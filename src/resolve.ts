import { EquationNode, EquationParserError, EquationNodeFunction, EquationNodeVariable } from 'equation-parser'

import { ResultNode } from './ResultNode'
import { UnitLookup } from './UnitLookup'
import { ResolveOptions } from './ResolveOptions'
import { ResultResolveError } from './ResultResolveError'

import { getUnit, getUnitless, isEmptyUnit, isSameUnit} from './utils/units'
import { plus, minus, multiplyCross, multiplyDot, multiplyImplicit, divide, power } from './operators'
import { negate } from './negate'
import { ResolverError } from './utils/ResolverError'
import { throwUnknownType } from './utils/throwUnknownType'

export const resolve = (node: EquationNode | EquationParserError, options: ResolveOptions = {}): ResultNode | ResultResolveError => {
    if (node.type === 'parser-error') {
        return {
            type: 'resolve-error',
            errorType: 'invalidEquation',
            node: null,
            values: [],
        }
    }
    try {
        return resolveNode(node, options)
    } catch (error) {
        if (error instanceof ResolverError) {
            return {
                type: 'resolve-error',
                errorType: error.type,
                node: error.node,
                values: error.values,
            }
        } else {
            throw error
        }
    }
}

export const resolveNode = (
    node: EquationNode,
    options: ResolveOptions,
): ResultNode => {
    switch (node.type) {
        case 'number':
            return {
                type: 'number',
                value: parseFloat(node.value),
            }
        case 'variable':
            return resolveVariable(node, options)
        case 'positive':
            return resolveNode(node.value, options)
        case 'negative':
            return negate(resolveNode(node.value, options))
        case 'positive-negative':
            throw new ResolverError('plusminusUnhandled', node)
        case 'block':
            return resolveNode(node.child, options)
        case 'plus':
            return plus(
                node,
                resolveNode(node.a, options),
                resolveNode(node.b, options),
            )
        case 'minus':
            return minus(
                node,
                resolveNode(node.a, options),
                resolveNode(node.b, options),
            )
        case 'plus-minus':
            throw new ResolverError('plusminusUnhandled', node)
        case 'multiply-implicit':
            return multiplyImplicit(
                node,
                resolveNode(node.a, options),
                resolveNode(node.b, options),
            )
        case 'multiply-dot':
            return multiplyDot(
                node,
                resolveNode(node.a, options),
                resolveNode(node.b, options),
            )
        case 'multiply-cross':
            return multiplyCross(
                node,
                resolveNode(node.a, options),
                resolveNode(node.b, options),
            )
        case 'divide-fraction':
        case 'divide-inline':
            return divide(
                node,
                resolveNode(node.a, options),
                resolveNode(node.b, options),
            )
        case 'power':
            return power(
                node,
                resolveNode(node.a, options),
                resolveNode(node.b, options),
            )
        case 'function':
            return resolveFunction(node, options)
        case 'equals':
        case 'less-than':
        case 'less-than-equals':
        case 'greater-than':
        case 'greater-than-equals':
        case 'approximates':
            throw new ResolverError('noComparison', node)
        case 'matrix': {
            // Keep track of resolved unit
            let unit: UnitLookup | null = null
            const values = node.values.map((row) => row.map((cell) => {
                const value = resolveNode(cell, options)
                // Compare units
                if (unit) {
                    if (!isSameUnit(unit, getUnit(value))) {
                        throw new ResolverError('matrixDifferentUnits', node)
                    }
                } else {
                    unit = getUnit(value)
                }
                // Ensure all children are unitless numbers
                const unitlessValue = getUnitless(value)
                if (unitlessValue.type !== 'number') {
                    throw new ResolverError('matrixNoNesting', node)
                }

                return unitlessValue
            }))

            // Wrap in unit if necessary
            if (!unit || isEmptyUnit(unit)) {
                return {
                    type: 'matrix',
                    m: node.m,
                    n: node.n,
                    values,
                }
            } else {
                return {
                    type: 'unit',
                    units: unit,
                    value: {
                        type: 'matrix',
                        m: node.m,
                        n: node.n,
                        values,
                    },
                }
            }
        }
        case 'function-placeholder':
        case 'operand-placeholder':
        case 'operator-placeholder':
        case 'operator-unary-placeholder':
            throw new ResolverError('placeholder', node)
        default:
            return throwUnknownType(node, (type) => `Equation resolve: cannot resolve type "${type}"`)
    }
}

function resolveVariable(node: EquationNodeVariable, options: ResolveOptions): ResultNode {
    if (!options.variables || !options.variables[node.name]) {
        throw new ResolverError('variableUnknown', node, node.name)
    }
    return options.variables[node.name]
}

function resolveFunction(node: EquationNodeFunction, options: ResolveOptions) {
    if (!options.functions || !options.functions[node.name]) {
        throw new ResolverError('functionUnknown', node, node.name)
    }

    return options.functions[node.name](node, options)
}
