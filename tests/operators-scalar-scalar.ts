import { resolve } from '../src'

import { equationNumber } from './helpers/equationNumber'
import { resultNumber } from './helpers/resultNumber'

const runNumberSuite = (type: any, simple: (a: number, b: number) => number) => {
    expect(resolve({
        type,
        a: equationNumber(12),
        b: equationNumber(4),
    })).toEqual(resultNumber(simple(12, 4)))
    expect(resolve({
        type,
        a: equationNumber(12345),
        b: equationNumber(12345),
    })).toEqual(resultNumber(simple(12345, 12345)))
}

test('plus', () => {
    runNumberSuite('plus', (a, b) => a + b)
})
test('minus', () => {
    runNumberSuite('minus', (a, b) => a - b)
})
test('multiply-dot', () => {
    runNumberSuite('multiply-dot', (a, b) => a * b)
})
test('multiply-cross', () => {
    runNumberSuite('multiply-cross', (a, b) => a * b)
})
test('multiply-implicit', () => {
    runNumberSuite('multiply-implicit', (a, b) => a * b)
})
test('divide-fraction', () => {
    runNumberSuite('divide-fraction', (a, b) => a / b)
})
test('divide-inline', () => {
    runNumberSuite('divide-inline', (a, b) => a / b)
})
test('power', () => {
    runNumberSuite('power', (a, b) => a ** b)
})

