import { EquationNode } from 'equation-parser'

import { ResultResolveError } from './ResultResolveError'

export type EquationResolveError = {
    type: 'resolve-error',
    errorType:
    | ResultResolveError['errorType']

    | 'invalidUnit'
    ,
    node: EquationNode,
    errorNode: EquationNode | null,
    values: any[],
}
