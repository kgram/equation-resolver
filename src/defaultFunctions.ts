import { EquationNode } from 'equation-parser'

import { FunctionLookup } from './FunctionLookup'
import { VariableLookup } from './VariableLookup'
import { ResolveOptions } from './ResolveOptions'

import { checkArgs } from './utils/checkArgs'
import { isInteger } from './utils/isInteger'
import { valueWrap } from './valueWrap'
import { plus } from './operators'
import { resolve } from './resolve'
import { createNumberFunction } from './utils/createNumberFunction'

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
            throw new Error(`Equation resolve: radicand of ${name} cannot be negative`)
        }
    }),

    root: createNumberFunction(
        (f, x) => Math.sign(x) * Math.pow(Math.abs(x), 1 / f),
        2, 2,
        (name, f, x) => {
            if (Math.round(f) !== f || f <= 0) {
                throw new Error(`Equation resolve: index of ${name} must be a positive integer`)
            }
            if (f % 2 === 0 && x < 0) {
                throw new Error(`Equation resolve: radicand of ${name} cannot be negative when index is even`)
            }
        },
    ),

    ln: createNumberFunction(Math.log),
    log: createNumberFunction((x, base = 10) => Math.log(x) / Math.log(base), 1, 2),

    sum: (name: string, args: EquationNode[], options: ResolveOptions) => {
        checkArgs(name, args, 4, 4)

        const [variable, startTree, endTree, expression] = args

        if (variable.type !== 'variable') {
            throw new Error(`Equation resolve: first argument of ${name} must be a variable, not ${args[0].type}`)
        }

        let start = resolve(startTree, options)
        let end = resolve(endTree, options)
        if (!isInteger(start)) {
            throw new Error(`Equation resolve: second argument of ${name} must be an integer (is ${start})`)
        }
        if (!isInteger(end)) {
            throw new Error(`Equation resolve: third argument of ${name} must be an integer (is ${end})`)
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
        let sum = resolve(expression, enhancedOptions)
        for (let i = start.value + 1; i <= end.value; i++) {
            enhancedOptions.variables[variable.name] = valueWrap(i)
            sum = plus(sum, resolve(expression, enhancedOptions))
        }

        return sum
    },
}
