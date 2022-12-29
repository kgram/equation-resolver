import { EquationNodeFunction } from 'equation-parser'

import { FunctionLookup } from './FunctionLookup'
import { VariableLookup } from './VariableLookup'
import { ResolveOptions } from './ResolveOptions'
import { UnitLookup } from './UnitLookup'

import { checkArgs } from './utils/checkArgs'
import { isInteger } from './utils/isInteger'
import { valueWrap } from './valueWrap'
import { plus } from './operators'
import { resolveNode } from './resolve'
import { createNumberFunction } from './utils/createNumberFunction'
import { ResolverError } from './utils/ResolverError'
import { mapUnit } from './utils/units'

/** Implementation of common functions with common abbreviated english names */
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
    sqrt: (node, options) => {
        checkArgs(node, 1, 1)

        const [valueResult] = node.args.map((arg) => resolveNode(arg, options))

        let value: number | undefined
        let units: UnitLookup | undefined
        switch (valueResult.type) {
            case 'number':
                value = valueResult.value
                break
            case 'unit':
                if (valueResult.value.type === 'number') {
                    value = valueResult.value.value
                    units = valueResult.units
                }
                break
        }

        if (!value) {
            throw new ResolverError('functionNumberOnly', node.args[0], { name: node.name })
        }

        if (value < 0) {
            throw new ResolverError('functionSqrt1Positive', node.args[0], { name: node.name })
        }

        const result = valueWrap(Math.sqrt(value))

        return units
            ? { type: 'unit', units: mapUnit(units, (value) => value / 2), value: result }
            : result
    },

    root: (node: EquationNodeFunction, options: ResolveOptions) => {
        checkArgs(node, 2, 2)

        const [factorResult, valueResult] = node.args.map((arg) => resolveNode(arg, options))

        if (!isInteger(factorResult) || factorResult.value <= 0) {
            throw new ResolverError('functionRoot1PositiveInteger', node.args[0], { name: node.name })
        }

        const factor = factorResult.value
        let value: number | undefined
        let units: UnitLookup | undefined
        switch (valueResult.type) {
            case 'number':
                value = valueResult.value
                break
            case 'unit':
                if (valueResult.value.type === 'number') {
                    value = valueResult.value.value
                    units = valueResult.units
                }
                break
        }

        if (!value) {
            throw new ResolverError('functionNumberOnly', node.args[1], { name: node.name })
        }

        if (factor % 2 === 0 && value < 0) {
            throw new ResolverError('functionRoot2Positive', node.args[1], { name: node.name })
        }

        const result = valueWrap(Math.sign(value) * Math.pow(Math.abs(value), 1 / factor))

        return units
            ? { type: 'unit', units: mapUnit(units, (value) => value / factor), value: result }
            : result
    },

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
