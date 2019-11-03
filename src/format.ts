import { EquationNode } from 'equation-parser'

import { ResultNode, ResultNodeUnit, ResultNodeMatrix, ResultNodeNumber } from './ResultNode'
import { FunctionLookup } from './FunctionLookup'
import { VariableLookup } from './VariableLookup'
import { UnitLookup } from './UnitLookup'

import { resolve } from './resolve'
import { defaultVariables } from './defaultVariables'
import { divide } from './operators'
import { isSameUnit, isEmptyUnit, getUnit, getUnitless, combineUnits } from './utils/units'

// Attempt to simplify unit to one of these if possible
const simplifiableUnits = ['N', 'J', 'W', 'Pa', 'Hz', 'lx', 'C', 'V', 'F', 'Ω', 'S', 'Wb', 'T', 'H', 'Gy']

export const format = (
    tree: EquationNode,
    variables: VariableLookup = {},
    functions: FunctionLookup = {},
    unitTree?: EquationNode,
): EquationNode => {
    const result = resolve(tree, variables, functions)
    let unitResult
    if (unitTree) {
        unitResult = resolve(unitTree, variables, functions)
        if (!isUnitTree(unitTree) || !isUnitResult(unitResult)) {
            throw new Error('Equation resolve: invalid unit')
        }
    }
    return {
        type: 'equals',
        a: tree,
        b: resultToEquation(result, unitTree, unitResult),
    }
}

function resultToEquation(result: ResultNode, unitTree?: EquationNode, unitResult?: ResultNode): EquationNode {
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
                values: result.values.map((row) => row.map((cell) => resultToEquation(cell))),
            }
        case 'unit': {
            if (unitTree && unitResult) {
                const value = divide(result.value, getUnitless(unitResult))
                const diffUnits = combineUnits(result.units, getUnit(unitResult), (a, b) => a - b)
                if (isEmptyUnit(diffUnits)) {
                    return wrapUnit(resultToEquation(value), unitTree)
                } else {
                    return wrapUnit(resultToEquation(value), {
                        type: 'multiply-implicit',
                        a: unitTree,
                        b: unitToEquation(diffUnits),
                    })
                }
            } else {
                const unit = guessUnit(result)

                return wrapUnit(resultToEquation(unit.value), unitToEquation(unit.units))
            }
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
    }

    return false
}

function isUnitResult(unitResult: ResultNode): boolean {
    switch (unitResult.type) {
        case 'unit':
            return isUnitResult(unitResult.value)
        case 'number':
            return true
    }

    return false
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

function guessUnit(result: ResultNodeUnit): ResultNodeUnit {
    const unit = simplifiableUnits.find((u) => {
        const variable = defaultVariables[u]

        return variable &&
            variable.type === 'unit' &&
            variable.value.type === 'number' &&
            isSameUnit(variable.units, result.units)
    })

    if (unit) {
        const variable = defaultVariables[unit] as ResultNodeUnit
        return {
            type: 'unit',
            units: { [unit]: 1 },
            value: divide(result.value, variable.value) as ResultNodeMatrix | ResultNodeNumber,
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
