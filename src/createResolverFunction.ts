import { EquationNode } from 'equation-parser'

import { VariableLookup } from './VariableLookup'
import { FunctionLookup } from './FunctionLookup'
import { ResolverFunction } from './ResolverFunction'
import { ResolveOptions } from './ResolveOptions'

import { checkArgs } from './utils/checkArgs'
import { resolveNode } from './resolve'

/**
 * Helper-function for creating an equation-function from an equation and a list
 * of variables.
 *
 * Creates a clone of variables/functions, so future modification isn't
 * included.
 *
 * @example
 * ```ts
 * const functions = {
 *  f: createResolverFunction(['x'], parse('2x+5'))
 * }
 * resolve('f(3)', { functions })
 * // -> { type: 'number', value: 11 }
 * ```
 */
export const createResolverFunction = (
    argNames: string[],
    expression: EquationNode,
    options: ResolveOptions,
): ResolverFunction => {
    const expressionOptions = {
        variables: { ...options.variables } as VariableLookup,
        functions: { ...options.functions } as FunctionLookup,
    }

    return (node, argOptions) => {
        checkArgs(node, argNames.length, argNames.length)

        argNames.forEach((n, idx) => {
            expressionOptions.variables[n] = resolveNode(node.args[idx], argOptions)
        })

        return resolveNode(expression, expressionOptions)
    }
}
