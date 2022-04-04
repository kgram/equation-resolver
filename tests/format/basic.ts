import { EquationNode } from 'equation-parser'
import { format } from '../../src'

import { equationNumber } from '../helpers/equationNumber'

test('basic', () => {
    const equation: EquationNode = {
        type: 'plus',
        a: equationNumber(10),
        b: equationNumber(5),
    }
    expect(format(equation)).toEqual({
        type: 'equals',
        a: equation,
        b: equationNumber(15),
    })
})
