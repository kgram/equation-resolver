import { EquationNode } from 'equation-parser'

import { ResultResolveError } from '../ResultResolveError'

export class ResolverError extends Error {
    type: ResultResolveError['errorType']
    node: EquationNode
    values: any[]
    constructor(type: ResultResolveError['errorType'], node: EquationNode, ...values: any[]) {
        super(`Internal ${type} resolve error`)
        this.type = type
        this.node = node
        this.values = values
    }
}
