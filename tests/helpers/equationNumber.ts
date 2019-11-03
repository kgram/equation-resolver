import { EquationNode } from 'equation-parser'

export const equationNumber = (number: number | string): EquationNode => {
    if (number < 0 || number[0] === '-') {
        return {
            type: 'negative',
            value: equationNumber(-number),
        }
    }
    return {
        type: 'number',
        value: number.toString(),
    }
}
