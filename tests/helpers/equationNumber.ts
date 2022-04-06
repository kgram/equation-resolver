import { EquationNode } from 'equation-parser'

export const equationNumber = (number: number | string): EquationNode => {
    if (typeof number === 'number' && number < 0) {
        return { type: 'negative', value: equationNumber(-number) }
    }
    if (typeof number === 'string' && number[0] === '-') {
        return { type: 'negative', value: equationNumber(number.slice(1)) }
    }

    return { type: 'number', value: number.toString() }
}
