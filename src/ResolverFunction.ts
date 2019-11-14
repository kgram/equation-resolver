import { EquationNodeFunction } from 'equation-parser'

import { ResultNode } from './ResultNode'
import { ResolveOptions } from './ResolveOptions'

export type ResolverFunction = (node: EquationNodeFunction, options: ResolveOptions) => ResultNode
