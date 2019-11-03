import { EquationNode } from 'equation-parser'

import { ResultNode } from './ResultNode'
import { UnitLookup } from './UnitLookup'
import { ResolveOptions } from './ResolveOptions'

import { getUnit, getUnitless, isEmptyUnit, isSameUnit} from './utils/units'
import { plus, minus, multiplyCross, multiplyDot, multiplyImplicit, divide, power } from './operators'
import { negate } from './negate'
import { throwUnknownType } from './utils/throwUnknownType'

export const resolve = (
    tree: EquationNode,
    options: ResolveOptions = {},
): ResultNode => {
    switch (tree.type) {
        case 'number':
            return {
                type: 'number',
                value: parseFloat(tree.value),
            }
        case 'variable':
            return resolveVariable(tree.name, options)
        case 'positive':
            return resolve(tree.value, options)
        case 'negative':
            return negate(resolve(tree.value, options))
        case 'positive-negative':
            throw new Error('Equation resolve: cannot handle ± operator')
        case 'block':
            return resolve(tree.child, options)
        case 'plus':
            return plus(
                resolve(tree.a, options),
                resolve(tree.b, options),
            )
        case 'minus':
            return minus(
                resolve(tree.a, options),
                resolve(tree.b, options),
            )
        case 'plus-minus':
            throw new Error('Equation resolve: cannot handle ± operator')
        case 'multiply-implicit':
            return multiplyImplicit(
                resolve(tree.a, options),
                resolve(tree.b, options),
            )
        case 'multiply-dot':
            return multiplyDot(
                resolve(tree.a, options),
                resolve(tree.b, options),
            )
        case 'multiply-cross':
            return multiplyCross(
                resolve(tree.a, options),
                resolve(tree.b, options),
            )
        case 'divide-fraction':
        case 'divide-inline':
            return divide(
                resolve(tree.a, options),
                resolve(tree.b, options),
            )
        case 'power':
            return power(
                resolve(tree.a, options),
                resolve(tree.b, options),
            )
        case 'function':
            return resolveFunction(tree.name, tree.args, options)
        case 'equals':
        case 'less-than':
        case 'less-than-equals':
        case 'greater-than':
        case 'greater-than-equals':
        case 'approximates':
            throw new Error('Equation resolve: cannot resolve comparison')
        case 'matrix': {
            // Keep track of resolved unit
            let unit: UnitLookup | null = null
            const values = tree.values.map((row) => row.map((cell) => {
                const value = resolve(cell, options)
                // Compare units
                if (unit) {
                    if (!isSameUnit(unit, getUnit(value))) {
                        throw new Error(`Equation resolve: all matrix cells must have same unit`)
                    }
                } else {
                    unit = getUnit(value)
                }
                // Ensure all children are unitless numbers
                const unitlessValue = getUnitless(value)
                if (unitlessValue.type !== 'number') {
                    throw new Error(`Equation resolve: cannot resolve nested matrices`)
                }

                return unitlessValue
            }))

            // Wrap in unit if necessary
            if (!unit || isEmptyUnit(unit)) {
                return {
                    type: 'matrix',
                    m: tree.m,
                    n: tree.n,
                    values,
                }
            } else {
                return {
                    type: 'unit',
                    units: unit,
                    value: {
                        type: 'matrix',
                        m: tree.m,
                        n: tree.n,
                        values,
                    },
                }
            }
        }
        case 'parser-error':
            throw new Error('Parser error')
        default:
            return throwUnknownType(tree, (type) => `Equation resolve: cannot resolve type "${type}"`)
    }
}

function resolveVariable(name: string, options: ResolveOptions): ResultNode {
    if (options.variables && options.variables.hasOwnProperty(name)) {
        return options.variables[name]
    } else {
        throw new Error(`Equation resolve: unknown variable "${name}"`)
    }
}

function resolveFunction(name: string, args: EquationNode[], options: ResolveOptions) {
    let func
    if (options.functions && options.functions.hasOwnProperty(name)) {
        func = options.functions[name]
    } else {
        throw new Error(`Equation resolve: unknown function "${name}"`)
    }
    return func(name, args, options)
}
