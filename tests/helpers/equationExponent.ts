import { EquationNode } from 'equation-parser'

import { equationNumber } from './equationNumber'

export const equationExponent = (number: number | string, exponent: number | string): EquationNode => {

    if (typeof number === 'number' && number < 0) {
        return { type: 'negative', value: equationExponent(-number, exponent) }
    }

    if (typeof number === 'string' && number[0] === '-') {
        return { type: 'negative', value: equationExponent(number.slice(1), exponent) }
    }

    const exponentNode = equationNumber(exponent)

    return {
        type: 'multiply-dot',
        a: equationNumber(number),
        b: {
            type: 'power',
            a: equationNumber('10'),
            b: exponentNode.type === 'number'
                ? exponentNode
                : { type: 'block', child: exponentNode },
        },
    }
}
