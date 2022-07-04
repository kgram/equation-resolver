import { EquationNode } from 'equation-parser'

import { ResultResolveError } from './ResultResolveError'

export type EquationResolveError = {
    node: EquationNode,
} & ResultResolveError
