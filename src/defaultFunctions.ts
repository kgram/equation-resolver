import { EquationNodeFunction } from 'equation-parser'

import { FunctionLookup } from './FunctionLookup'
import { VariableLookup } from './VariableLookup'
import { ResolveOptions } from './ResolveOptions'

import { checkArgs } from './utils/checkArgs'
import { isInteger } from './utils/isInteger'
import { valueWrap } from './valueWrap'
import { plus } from './operators'
import { resolveNode } from './resolve'
import { createNumberFunction } from './utils/createNumberFunction'
import { ResolverError } from './utils/ResolverError'

export const defaultFunctions: FunctionLookup = {
    sin: createNumberFunction(Math.sin),
    cos: createNumberFunction(Math.cos),
    tan: createNumberFunction(Math.tan),
    asin: createNumberFunction(Math.asin),
    acos: createNumberFunction(Math.acos),
    atan: createNumberFunction(Math.atan),
    atan2: createNumberFunction(Math.atan2, 2),

    abs: createNumberFunction(Math.abs),
    ceil: createNumberFunction(Math.ceil),
    floor: createNumberFunction(Math.floor),
    round: createNumberFunction((x, precision = 0) => {
        const factor = Math.pow(10, precision)
        return Math.round(x * factor) / factor
    }, 1 , 2),

    max: createNumberFunction(Math.max, 1, Infinity),
    min: createNumberFunction(Math.min, 1, Infinity),

    pow: createNumberFunction(Math.pow, 2),
    sqrt: createNumberFunction(Math.sqrt, 1, 1, (name, x) => {
        if (x < 0) {
            return [0, 'functionSqrt1Positive']
        }
    }),

    root: createNumberFunction(
        (f, x) => Math.sign(x) * Math.pow(Math.abs(x), 1 / f),
        2, 2,
        (name, f, x) => {
            if (Math.round(f) !== f || f <= 0) {
                return [0, 'functionRoot1PositiveInteger']
            }
            if (f % 2 === 0 && x < 0) {
                return [1, 'functionRoot2Positive']
            }
        },
    ),

    ln: createNumberFunction(Math.log),
    log: createNumberFunction((x, base = 10) => Math.log(x) / Math.log(base), 1, 2),

    sum: (node: EquationNodeFunction, options: ResolveOptions) => {
        checkArgs(node, 4, 4)

        const [variable, startTree, endTree, expression] = node.args

        if (variable.type !== 'variable') {
            throw new ResolverError('functionSum1Variable', variable, { name: node.name, variableType: variable.type })
        }

        let start = resolveNode(startTree, options)
        let end = resolveNode(endTree, options)
        if (!isInteger(start)) {
            throw new ResolverError('functionSum2Integer', startTree, { name: node.name })
        }
        if (!isInteger(end)) {
            throw new ResolverError('functionSum3Integer', endTree, { name: node.name })
        }
        if (start > end) {
            [start, end] = [end, start]
        }
        const enhancedOptions = {
            functions: options.functions,
            variables: { ...options.variables } as VariableLookup,
        }

        // Get initial value
        enhancedOptions.variables[variable.name] = start
        let sum = resolveNode(expression, enhancedOptions)
        for (let i = start.value + 1; i <= end.value; i++) {
            enhancedOptions.variables[variable.name] = valueWrap(i)
            sum = plus(node, sum, resolveNode(expression, enhancedOptions))
        }

        return sum
    },
}
