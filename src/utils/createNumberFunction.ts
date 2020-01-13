import { ResultNodeNumber } from '../ResultNode'
import { ResolverFunction } from '../ResolverFunction'
import { ResultResolveError } from '../ResultResolveError'
import { ResolverError } from './ResolverError'

import { checkArgs } from './checkArgs'
import { valueWrap } from '../valueWrap'
import { resolveNode } from '../resolve'

export const createNumberFunction = (
    func: (...args: number[]) => number,
    minArgs = 1,
    maxArgs = minArgs,
    validate?: (name: string, ...args: number[]) => [number, ResultResolveError['errorType']] | undefined,
): ResolverFunction => {
    return (node, options) => {
        checkArgs(node, minArgs, maxArgs)

        const resolvedArgs = node.args.map((arg) => resolveNode(arg, options))

        const nonNumber = resolvedArgs.findIndex((arg) => arg.type !== 'number')
        if (nonNumber !== -1) {
            throw new ResolverError('functionNumberOnly', node.args[nonNumber], { name: node.name })
        }

        const numberArgs = (resolvedArgs as ResultNodeNumber[]).map((arg) => arg.value)

        if (validate) {
            const result = validate(node.name, ...numberArgs)
            if (result) {
                throw new ResolverError(result[1], node.args[result[0]], { name: node.name })
            }
        }

        return valueWrap(func(...numberArgs))
    }
}
