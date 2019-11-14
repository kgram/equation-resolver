import { EquationNode, EquationParserError } from 'equation-parser'

import { ResultNode, ResultNodeUnit, ResultNodeMatrix, ResultNodeNumber } from './ResultNode'
import { EquationResolveError } from './EquationResolveError'
import { UnitLookup } from './UnitLookup'
import { FormatOptions } from './FormatOptions'

import { resolve } from './resolve'
import { divide } from './operators'
import { isSameUnit, isEmptyUnit, getUnit, getUnitless, combineUnits } from './utils/units'

// Attempt to simplify unit to one of these if possible
const defaultSimplifiableUnits = ['N', 'J', 'W', 'Pa', 'Hz', 'lx', 'C', 'V', 'F', 'Ω', 'S', 'Wb', 'T', 'H', 'Gy']

export const format = (
    equation: EquationNode | EquationParserError,
    unit: EquationNode | null = null,
    options: FormatOptions = {},
): EquationNode | EquationParserError | EquationResolveError => {
    if (equation.type === 'parser-error') {
        return equation
    }

    if (unit && !isUnitTree(unit)) {
        return {
            type: 'resolve-error',
            errorType: 'invalidUnit',
            node: wrapError(equation, unit),
            errorNode: unit,
            values: [],
        }
    }

    const result = resolve(equation, options)
    const unitResult = unit ? resolve(unit, options) : null

    if (result.type === 'resolve-error') {
        return {
            type: 'resolve-error',
            errorType: result.errorType,
            node: wrapError(equation, unit),
            errorNode: result.node,
            values: result.values,
        }
    }

    if (unitResult && unitResult.type === 'resolve-error') {
        return {
            type: 'resolve-error',
            errorType: unitResult.errorType,
            node: wrapError(equation, unit),
            errorNode: unitResult.node,
            values: unitResult.values,
        }
    }

    if (unitResult && !isUnitResult(unitResult)) {
        return {
            type: 'resolve-error',
            errorType: 'invalidUnit',
            node: wrapError(equation, unit),
            errorNode: unit,
            values: [],
        }
    }

    return {
        type: 'equals',
        a: equation,
        b: resultToEquationWithUnit(result, unit, unitResult, options),
    }
}

const wrapError = (equation: EquationNode, unit: EquationNode | null): EquationNode => ({
    type: 'equals',
    a: equation,
    b: unit
        ? {
            type: 'multiply-implicit',
            a: { type: 'operand-placeholder' },
            b: unit,
        }
        : { type: 'operand-placeholder' },
})

function resultToEquationWithUnit(result: ResultNode, unit: EquationNode | null, unitResult: ResultNode | null, options: FormatOptions) {
    if (unit && unitResult) {
        const value = divide(unit, getUnitless(result), getUnitless(unitResult))
        const diffUnits = combineUnits(getUnit(result), getUnit(unitResult), (a, b) => a - b)
        if (isEmptyUnit(diffUnits)) {
            return wrapUnit(resultToEquation(value, options), unit)
        } else {
            return wrapUnit(resultToEquation(value, options), {
                type: 'multiply-implicit',
                a: unit,
                b: unitToEquation(diffUnits),
            })
        }
    } else {
        return resultToEquation(result, options)
    }

}

function resultToEquation(result: ResultNode, options: FormatOptions): EquationNode {
    switch (result.type) {
        case 'number':
            if (result.value < 0) {
                return {
                    type: 'negative',
                    value: simplifyNumber(-result.value),
                }
            } else {
                return simplifyNumber(result.value)
            }
        case 'matrix':
            return {
                type: 'matrix',
                m: result.m,
                n: result.n,
                values: result.values.map((row) => row.map((cell) => resultToEquation(cell, options))),
            }
        case 'unit': {
            const unit = guessUnit(result, options)

            return wrapUnit(resultToEquation(unit.value, options), unitToEquation(unit.units))
        }
    }
}

function simplifyNumber(value: number): EquationNode {
    // Handle infinity
    if (value === Infinity) {
        return {
            type: 'variable',
            name: '∞',
        }
    }

    // Float exponent
    const factor = Math.log10(value)

    if (value === 0 || Math.abs(factor) < 5) {
        // Retain regular number
        return {
            type: 'number',
            value: formatNumber(value),
        }
    } else {
        // Rewrite as power-of-ten
        const exponent = Math.floor(factor)
        const significand = value / Math.pow(10, exponent)
        return {
            type: 'multiply-dot',
            a: {
                type: 'number',
                value: formatNumber(significand),
            },
            b: {
                type: 'power',
                a: {
                    type: 'number',
                    value: '10',
                },
                b: {
                    type: 'number',
                    value: formatNumber(exponent),
                },
            },
        }
    }
}

function formatNumber(value: number, digits = 3, commaSep = '.'): string {
    return ensurePrecision(value, digits)
        .split('.')
        .join(commaSep)
}

// number.toPrecision with trailing zeros stripped
// Avoids scientific notation for large numbers
function ensurePrecision(value: number, digits: number) {
    // Handle cases where scientific notation would be used
    if (Math.log(Math.abs(value)) * Math.LOG10E >= digits) {
        return Math.round(value).toString()
    }
    // Strip trailing zeroes
    return Number(value.toPrecision(digits)).toString()
}

function isUnitTree(unitTree: EquationNode): boolean {
    switch (unitTree.type) {
        case 'multiply-implicit':
        case 'multiply-dot':
        case 'multiply-cross':
        case 'divide-fraction':
        case 'divide-inline':
            return isUnitTree(unitTree.a) && isUnitTree(unitTree.b)
        case 'power':
            return unitTree.a.type === 'variable' && unitTree.b.type === 'number'
        case 'variable':
            return true
        default:
            return false
    }
}

function isUnitResult(unitResult: ResultNode): boolean {
    switch (unitResult.type) {
        case 'unit':
            return isUnitResult(unitResult.value)
        case 'number':
            return true
        default:
            return false
    }
}

function wrapUnit(value: EquationNode, units: EquationNode): EquationNode {
    // Retain proper ordering of operations be letting negative wrap multiplication
    if (value.type === 'negative') {
        return {
            type: 'negative',
            value: {
                type: 'multiply-implicit',
                a: value.value,
                b: units,
            },
        }
    } else {
        return {
            type: 'multiply-implicit',
            a: value,
            b: units,
        }
    }
}

function guessUnit(result: ResultNodeUnit, { simplifiableUnits = defaultSimplifiableUnits, variables = {} }: FormatOptions): ResultNodeUnit {
    const unit = simplifiableUnits.find((u) => {
        const variable = variables[u]

        return variable &&
            variable.type === 'unit' &&
            variable.value.type === 'number' &&
            isSameUnit(variable.units, result.units)
    })

    if (unit) {
        const variable = variables[unit] as ResultNodeUnit
        return {
            type: 'unit',
            units: { [unit]: 1 },
            value: divide({} as EquationNode, result.value, variable.value) as ResultNodeMatrix | ResultNodeNumber,
        }
    } else {
        return result
    }
}

function getExponent(unit: string, factor: number): EquationNode {
    if (factor === 1) {
        return { type: 'variable', name: unit }
    } else {
        return {
            type: 'power',
            a: { type: 'variable', name: unit },
            b: { type: 'number', value: factor.toString() },
        }
    }
}

function unitToEquation(units: UnitLookup): EquationNode {
    // Terms above fraction
    const positive: EquationNode[] = []
    // Terms below fraction
    const negative: EquationNode[] = []
    for (const [unit, factor] of Object.entries(units)) {
        if (factor > 0) {
            positive.push(getExponent(unit, factor))
        } else {
            negative.push(getExponent(unit, -factor))
        }
    }
    if (negative.length === 0) {
        return multiplyList(positive)
    }

    return {
        type: 'divide-fraction',
        a: multiplyList(positive),
        b: multiplyList(negative),
    }
}

function multiplyList(list: EquationNode[]): EquationNode {
    if (list.length === 0) {
        return {
            type: 'number',
            value: '1',
        }
    }
    let current = list[0]
    // Build multiplication tree
    for (let i = 1; i < list.length; i++) {
        current = {
            type: 'multiply-implicit',
            a: current,
            b: list[i],
        }
    }

    return current
}
