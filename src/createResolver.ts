import { EquationNode } from 'equation-parser'

import { VariableLookup } from './VariableLookup'
import { FunctionLookup } from './FunctionLookup'
import { ResolverFunction } from './ResolverFunction'

import { checkArgs } from './utils/checkArgs'
import { resolve } from './resolve'

export const createResolver = (
    argNames: string[],
    expression: EquationNode,
    expressionVariables: VariableLookup,
    expressionFunctions: FunctionLookup,
): ResolverFunction => {
    expressionVariables = { ...expressionVariables }
    expressionFunctions = { ...expressionFunctions }

    return (name, args, argVariables, argFunctions) => {
        checkArgs(name, args, argNames.length, argNames.length)

        argNames.forEach((n, idx) => {
            expressionVariables[n] = resolve(args[idx], argVariables, argFunctions)
        })

        return resolve(expression, expressionVariables, expressionFunctions)
    }
}
