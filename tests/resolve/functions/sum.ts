import { resolve } from '../../../src'
import { defaultFunctions } from '../../../src/defaultFunctions'

import { equationVariable } from '../../helpers/equationVariable'
import { equationNumber } from '../../helpers/equationNumber'
import { resultNumber } from '../../helpers/resultNumber'

import '../../helpers/toEqualCloseTo'

test('constant', () => {
    const m = 5
    const n = 10
    expect(resolve({
        type: 'function',
        name: 'sum',
        args: [equationVariable('i'), equationNumber(m), equationNumber(n), equationNumber(1)],
    }, { functions: defaultFunctions })).toEqualCloseTo(resultNumber((n + 1 - m)))
})

test('linear (arithmetic serries)', () => {
    const m = 5
    const n = 10
    expect(resolve({
        type: 'function',
        name: 'sum',
        args: [equationVariable('i'), equationNumber(m), equationNumber(n), equationVariable('i')],
    }, { functions: defaultFunctions })).toEqualCloseTo(resultNumber((n + 1 - m) * (n + m) / 2))
})

test('exponential (geometric series)', () => {
    const m = 5
    const n = 10
    const a = 4
    expect(resolve({
        type: 'function',
        name: 'sum',
        args: [equationVariable('i'), equationNumber(m), equationNumber(n), { type: 'power', a: equationNumber(a), b: equationVariable('i') }],
    }, { functions: defaultFunctions })).toEqualCloseTo(resultNumber((a ** m - a ** (n + 1)) / (1 - a)))
})
