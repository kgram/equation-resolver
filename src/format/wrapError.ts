import { EquationNode } from 'equation-parser'

/** Utility method to wrap an error with "= _ unit" */
export const wrapError = (equation: EquationNode, unit: EquationNode | null): EquationNode => ({
    type: 'equals',
    a: equation,
    b: unit
        ? {
            type: 'multiply-implicit',
            a: { type: 'operand-placeholder' },
            b: unit,
        }
        : { type: 'operand-placeholder' },
})
