import { get } from 'lodash'
import { EquationNode } from 'equation-parser'

import { resolve, ResultResolveError } from '../../src'

export const failResolve = (node: EquationNode, errorType: ResultResolveError['errorType'], nodePath: string[] = [], ...values: any[]) => {
    expect(resolve(node)).toEqual({
        type: 'resolve-error',
        errorType,
        node: nodePath.length > 0 ? get(node, nodePath) : node,
        values,
    })
}
