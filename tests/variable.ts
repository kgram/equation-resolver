import { resolve } from '../src'

import { resultNumber } from './helpers/resultNumber'
import { failResolve } from './helpers/failResolve'

test('defined', () => {
    const variable = resultNumber(5)
    expect(resolve({ type: 'variable', name: 'a' }, { variables: { 'a': variable } })).toEqual(variable)
})

test('undefined', () => {
    failResolve({ type: 'variable', name: 'a' }, 'variableUnknown', [], 'a')
})
