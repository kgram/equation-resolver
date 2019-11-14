import { equationNumber } from './helpers/equationNumber'
import { failResolve } from './helpers/failResolve'

test('any', () => {
    failResolve({ type: 'positive-negative', value: equationNumber(5) }, 'plusminusUnhandled', [])
})

