import { EquationNode } from 'equation-parser'

import { ResultNode } from './ResultNode'
import { VariableLookup } from './VariableLookup'
import { FunctionLookup } from './FunctionLookup'

export type ResolverFunction = (name: string, args: EquationNode[], variables: VariableLookup, functions: FunctionLookup) => ResultNode
