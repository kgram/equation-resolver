import { EquationNode, EquationParserError } from 'equation-parser'

import { ResultNode } from '../ResultNode'
import { EquationResolveError } from '../EquationResolveError'
import { FormatOptions } from '../FormatOptions'

import { resolve } from '../resolve'
import { divide } from '../operators'
import { isEmptyUnit, getUnit, getUnitless, combineUnits, isUnitEquation, isUnitResult } from '../utils/units'
import { ResultResolveError } from '../ResultResolveError'

import { formatNumber } from './formatNumber'
import { guessUnit } from './guessUnit'
import { wrapUnit } from './wrapUnit'
import { unitToEquation} from './unitToEquation'
import { wrapError } from './wrapError'

/**
 * Resolve an `EquationNode` (or `EquationParserError`), wraps it in an
 * `equals`-node and adds the result as an `EquationNode`.
 * */
export const format = (
    equation: EquationNode | EquationParserError,
    unit: EquationNode | EquationParserError | null = null,
    options: FormatOptions = {},
): EquationNode | EquationParserError | EquationResolveError => {
    const result = resolve(equation, options)
    const unitResult = unit ? resolve(unit, options) : null

    return formatPreresolved(
        equation,
        unit,
        result,
        unitResult,
        options,
    )
}

/**
 * Wraps a resolved `EquationNode` in an `equals`-node with a formatted
 * `ResultNode` as the right-hand side.
 *
 * This is used internally by `format`, it's mostly useful if the result needs
 * to be exposed with the equation. It assumes `equation` matches `result`, and `unit` matches `unitResult`
 */
export const formatPreresolved = (
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
                    value: formatNumber(-result.value, options.decimals),
                }
            } else {
                return formatNumber(result.value, options.decimals)
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
