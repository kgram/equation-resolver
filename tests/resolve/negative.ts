import { resolve } from '../../src'

import { equationNumber } from '../helpers/equationNumber'
import { resultNumber } from '../helpers/resultNumber'

test('number', () => {
    expect(resolve({
        type: 'negative',
        value: equationNumber(5),
    })).toEqual(resultNumber(-5))
})

test('matrix', () => {
    expect(resolve({
        type: 'negative',
        value: {
            type: 'matrix', n: 3, m: 2,
            values: [
                [equationNumber(1), equationNumber(2), equationNumber(3)],
                [equationNumber(4), equationNumber(5), equationNumber(6)],
            ],
        },
    })).toEqual({
        type: 'matrix', n: 3, m: 2,
        values: [
            [{ type: 'number', value: -1 }, { type: 'number', value: -2 }, { type: 'number', value: -3 }],
            [{ type: 'number', value: -4 }, { type: 'number', value: -5 }, { type: 'number', value: -6 }],
        ],
    })
})
