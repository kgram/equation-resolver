import { EquationNode } from 'equation-parser'

import { VariableLookup } from './VariableLookup'
import { FunctionLookup } from './FunctionLookup'
import { ResolverFunction } from './ResolverFunction'
import { ResolveOptions } from './ResolveOptions'

import { checkArgs } from './utils/checkArgs'
import { resolveNode } from './resolve'

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
