import { EquationNodeFunction } from 'equation-parser'

import { ResolverError } from './ResolverError'

export const checkArgs = (node: EquationNodeFunction, minArgs: number, maxArgs: number) => {
    if (node.args.length < minArgs || node.args.length > maxArgs) {
        throw new ResolverError('functionArgLength', node, { minArgs, maxArgs })
    }
}
