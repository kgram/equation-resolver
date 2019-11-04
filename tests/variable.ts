import { resolve } from '../src'

import { resultNumber } from './helpers/resultNumber'

test('defined', () => {
    const variable = resultNumber(5)
    expect(resolve({ type: 'variable', name: 'a' }, { variables: { 'a': variable } })).toEqual(variable)
})

test('undefined', () => {
    expect(() => resolve({ type: 'variable', name: 'a' })).toThrow()
})
