import { resolve } from '../../../src'
import { defaultFunctions } from '../../../src/defaultFunctions'

import { equationNumber } from '../../helpers/equationNumber'
import { resultNumber } from '../../helpers/resultNumber'

import '../../helpers/toEqualCloseTo'

test('default base (10)', () => {
    expect(resolve({
        type: 'function',
        name: 'log',
        args: [equationNumber(1e7)],
    }, { functions: defaultFunctions })).toEqualCloseTo(resultNumber(7))
})

test('specific base', () => {
    expect(resolve({
        type: 'function',
        name: 'log',
        args: [equationNumber(8 ** 7), equationNumber(8)],
    }, { functions: defaultFunctions })).toEqualCloseTo(resultNumber(7))
})
