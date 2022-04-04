import { EquationNode, EquationParserError } from 'equation-parser'

import { ResultNode } from '../ResultNode'
import { EquationResolveError } from '../EquationResolveError'
import { FormatOptions } from '../FormatOptions'

import { resolve } from '../resolve'
import { divide } from '../operators'
import { isEmptyUnit, getUnit, getUnitless, combineUnits, isUnitEquation, isUnitResult } from '../utils/units'
import { ResultResolveError } from '../ResultResolveError'

import { simplifyNumber } from './simplifyNumber'
import { guessUnit } from './guessUnit'
import { wrapUnit } from './wrapUnit'
import { unitToEquation} from './unitToEquation'

export const format = (
    equation: EquationNode | EquationParserError,
    unit: EquationNode | EquationParserError | null = null,
    options: FormatOptions = {},
): EquationNode | EquationParserError | EquationResolveError => {
    const result = resolve(equation, options)
    const unitResult = unit ? resolve(unit, options) : null

    return formatInternal(
        equation,
        unit,
        result,
        unitResult,
        options,
    )
}

const formatInternal = (
    equation: EquationNode | EquationParserError,
    unit: EquationNode | EquationParserError | null = null,
    result: ResultNode | ResultResolveError,
    unitResult: ResultNode | ResultResolveError | null,
    options: FormatOptions,
): EquationNode | EquationParserError | EquationResolveError => {
    if (equation.type === 'parser-error') {
        return equation
    }

    if (unit && unit.type === 'parser-error') {
        return unit
    }

    if (unit && !isUnitEquation(unit)) {
        return {
            type: 'resolve-error',
            errorType: 'invalidUnit',
            node: wrapError(equation, unit),
            errorNode: unit,
        }
    }

    if (result.type === 'resolve-error') {
        return {
            ...result,
            node: wrapError(equation, unit),
        }
    }

    if (unitResult && unitResult.type === 'resolve-error') {
        return {
            ...unitResult,
            node: wrapError(equation, unit),
        }
    }

    if (unitResult && !isUnitResult(unitResult)) {
        return {
            type: 'resolve-error',
            errorType: 'invalidUnit',
            node: wrapError(equation, unit),
            errorNode: unit,
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
