import { EquationNode } from 'equation-parser'

import { VariableLookup } from './VariableLookup'
import { FunctionLookup } from './FunctionLookup'
import { ResolverFunction } from './ResolverFunction'
import { ResolveOptions } from './ResolveOptions'

import { checkArgs } from './utils/checkArgs'
import { resolve } from './resolve'

export const createResolverFunction = (
    argNames: string[],
    expression: EquationNode,
    options: ResolveOptions,
): ResolverFunction => {
    const expressionOptions = {
        variables: { ...options.variables } as VariableLookup,
        functions: { ...options.functions } as FunctionLookup,
    }

    return (name, args, argOptions) => {
        checkArgs(name, args, argNames.length, argNames.length)

        argNames.forEach((n, idx) => {
            expressionOptions.variables[n] = resolve(args[idx], argOptions)
        })

        return resolve(expression, expressionOptions)
    }
}
