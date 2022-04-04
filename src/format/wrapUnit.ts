import { EquationNode } from 'equation-parser'

export function wrapUnit(value: EquationNode, units: EquationNode): EquationNode {
    // Retain proper ordering of operations be letting negative wrap multiplication
    if (value.type === 'negative') {
        return {
            type: 'negative',
            value: {
                type: 'multiply-implicit',
                a: value.value,
                b: units,
            },
        }
    } else {
        return {
            type: 'multiply-implicit',
            a: value,
            b: units,
        }
    }
}
