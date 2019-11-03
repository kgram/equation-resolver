import { resolve } from '../../src'

import { equationNumber } from '../helpers/equationNumber'
import { resultNumber } from '../helpers/resultNumber'

test('integer', () => {
    expect(resolve(equationNumber(5))).toEqual(resultNumber(5))
})

test('decimal', () => {
    expect(resolve(equationNumber(5.5))).toEqual(resultNumber(5.5))
})
