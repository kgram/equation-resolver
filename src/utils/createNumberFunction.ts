import { EquationNode } from 'equation-parser'

import { ResultNodeNumber } from '../ResultNode'
import { FunctionLookup } from '../FunctionLookup'
import { VariableLookup } from '../VariableLookup'
import { ResolverFunction } from '../ResolverFunction'

import { checkArgs } from './checkArgs'
import { valueWrap } from '../valueWrap'
import { resolve } from '../resolve'

export const createNumberFunction = (
    func: (...args: number[]) => number,
    minArgs = 1,
    maxArgs = minArgs,
    validate?: (name: string, ...args: number[]) => void,
): ResolverFunction => {
    return (
        name: string,
        args: EquationNode[],
        variables: VariableLookup,
        functions: FunctionLookup,
    ) => {
        checkArgs(name, args, minArgs, maxArgs)

        const resolvedArgs = args.map((arg) => resolve(arg, variables, functions))

        if (!resolvedArgs.every((arg) => arg.type === 'number')) {
            throw new Error(`Equation resolve: arguments of ${name} must be numbers`)
        }

        const numberArgs = (resolvedArgs as ResultNodeNumber[]).map((arg) => arg.value)

        if (validate) {
            validate(name, ...numberArgs)
        }

        return valueWrap(func(...numberArgs))
    }
}
