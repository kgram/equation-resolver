import { FunctionLookup } from './FunctionLookup'
import { VariableLookup } from './VariableLookup'

export type ResolveOptions = {
    variables?: VariableLookup,
    functions?: FunctionLookup,
}
