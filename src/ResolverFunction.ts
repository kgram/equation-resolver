import { EquationNode } from 'equation-parser'

import { ResultNode } from './ResultNode'
import { ResolveOptions } from './ResolveOptions'

export type ResolverFunction = (name: string, args: EquationNode[], options: ResolveOptions) => ResultNode
