import { ResultResolveError } from '../ResultResolveError'

type Error<T extends ResultResolveError['errorType'], TError = ResultResolveError> = TError extends { errorType: T }
    ? TError
    : never

type Values<T extends ResultResolveError['errorType']> = Omit<Error<T>, 'type' | 'errorNode' | 'errorType'>

export class ResolverError<T extends ResultResolveError['errorType']> extends Error {
    type: T
    errorNode: ResultResolveError['errorNode']
    values: Values<T>
    constructor(type: T, errorNode: ResultResolveError['errorNode'], values: Values<T>) {
        super(`Internal ${type} parse error`)
        this.type = type
        this.errorNode = errorNode
        this.values = values
    }

    getResolveError() {
        return {
            type: 'resolve-error',
            errorType: this.type,
            errorNode: this.errorNode,
            ...this.values,
        } as Error<T>
    }
}
