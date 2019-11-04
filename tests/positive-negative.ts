import { resolve } from '../src'

import { equationNumber } from './helpers/equationNumber'

test('any', () => {
    expect(() => resolve({
        type: 'positive-negative',
        value: equationNumber(5),
    })).toThrow()
})

