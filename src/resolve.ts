import { EquationNode } from 'equation-parser'

import { ResultNode } from './ResultNode'
import { FunctionLookup } from './FunctionLookup'
import { VariableLookup } from './VariableLookup'
import { UnitLookup } from './UnitLookup'

import { getUnit, getUnitless, isEmptyUnit, isSameUnit} from './utils/units'
import { plus, minus, multiplyCross, multiplyDot, multiplyImplicit, divide, power } from './operators'
import { negate } from './negate'
import { throwUnknownType } from './utils/throwUnknownType'

export const resolve = (
    tree: EquationNode,
    variables: VariableLookup = {},
    functions: FunctionLookup = {},
): ResultNode => {
    switch (tree.type) {
        case 'number':
            return {
                type: 'number',
                value: parseFloat(tree.value),
            }
        case 'variable':
            return resolveVariable(tree.name, variables)
        case 'positive':
            return resolve(tree.value, variables, functions)
        case 'negative':
            return negate(resolve(tree.value, variables, functions))
        case 'positive-negative':
            throw new Error('Equation resolve: cannot handle ± operator')
        case 'block':
            return resolve(tree.child, variables, functions)
        case 'plus':
            return plus(
                resolve(tree.a, variables, functions),
                resolve(tree.b, variables, functions),
            )
        case 'minus':
            return minus(
                resolve(tree.a, variables, functions),
                resolve(tree.b, variables, functions),
            )
        case 'plus-minus':
            throw new Error('Equation resolve: cannot handle ± operator')
        case 'multiply-implicit':
            return multiplyImplicit(
                resolve(tree.a, variables, functions),
                resolve(tree.b, variables, functions),
            )
        case 'multiply-dot':
            return multiplyDot(
                resolve(tree.a, variables, functions),
                resolve(tree.b, variables, functions),
            )
        case 'multiply-cross':
            return multiplyCross(
                resolve(tree.a, variables, functions),
                resolve(tree.b, variables, functions),
            )
        case 'divide-fraction':
        case 'divide-inline':
            return divide(
                resolve(tree.a, variables, functions),
                resolve(tree.b, variables, functions),
            )
        case 'power':
            return power(
                resolve(tree.a, variables, functions),
                resolve(tree.b, variables, functions),
            )
        case 'function':
            return resolveFunction(
                tree.name,
                tree.args,
                variables,
                functions,
            )
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
                const value = resolve(cell, variables, functions)
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

function resolveVariable(name: string, variables: VariableLookup): ResultNode {
    if (variables.hasOwnProperty(name)) {
        return variables[name]
    } else {
        throw new Error(`Equation resolve: unknown variable "${name}"`)
    }
}

function resolveFunction(name: string, args: EquationNode[], variables: VariableLookup, functions: FunctionLookup) {
    let func
    if (functions.hasOwnProperty(name)) {
        func = functions[name]
    } else {
        throw new Error(`Equation resolve: unknown function "${name}"`)
    }
    return func(name, args, variables, functions)
}
