import { EquationNode } from 'equation-parser'

import { resolve } from '../src'

import { equationNumber } from './helpers/equationNumber'
import { resultNumber } from './helpers/resultNumber'
import { failResolve } from './helpers/failResolve'

const scalar = equationNumber(7)
const matrix: EquationNode = {
    type: 'matrix',
    n: 4,
    m: 3,
    values: [
        [equationNumber(1), equationNumber(2), equationNumber(3)],
        [equationNumber(2), equationNumber(3), equationNumber(4)],
        [equationNumber(3), equationNumber(4), equationNumber(5)],
        [equationNumber(4), equationNumber(5), equationNumber(6)],
    ],
}

test('plus', () => {
    expect(resolve({ type: 'plus', a: scalar, b: matrix })).toEqual({
        type: 'matrix',
        n: 4,
        m: 3,
        values: [
            [resultNumber(8), resultNumber(9), resultNumber(10)],
            [resultNumber(9), resultNumber(10), resultNumber(11)],
            [resultNumber(10), resultNumber(11), resultNumber(12)],
            [resultNumber(11), resultNumber(12), resultNumber(13)],
        ],
    })
    expect(resolve({ type: 'plus', a: matrix, b: scalar })).toEqual({
        type: 'matrix',
        n: 4,
        m: 3,
        values: [
            [resultNumber(8), resultNumber(9), resultNumber(10)],
            [resultNumber(9), resultNumber(10), resultNumber(11)],
            [resultNumber(10), resultNumber(11), resultNumber(12)],
            [resultNumber(11), resultNumber(12), resultNumber(13)],
        ],
    })
})
test('minus', () => {
    expect(resolve({ type: 'minus', a: scalar, b: matrix })).toEqual({
        type: 'matrix',
        n: 4,
        m: 3,
        values: [
            [resultNumber(6), resultNumber(5), resultNumber(4)],
            [resultNumber(5), resultNumber(4), resultNumber(3)],
            [resultNumber(4), resultNumber(3), resultNumber(2)],
            [resultNumber(3), resultNumber(2), resultNumber(1)],
        ],
    })
    expect(resolve({ type: 'minus', a: matrix, b: scalar })).toEqual({
        type: 'matrix',
        n: 4,
        m: 3,
        values: [
            [resultNumber(-6), resultNumber(-5), resultNumber(-4)],
            [resultNumber(-5), resultNumber(-4), resultNumber(-3)],
            [resultNumber(-4), resultNumber(-3), resultNumber(-2)],
            [resultNumber(-3), resultNumber(-2), resultNumber(-1)],
        ],
    })
})
test('multiply-dot', () => {
    expect(resolve({ type: 'multiply-dot', a: scalar, b: matrix })).toEqual({
        type: 'matrix',
        n: 4,
        m: 3,
        values: [
            [resultNumber(7), resultNumber(14), resultNumber(21)],
            [resultNumber(14), resultNumber(21), resultNumber(28)],
            [resultNumber(21), resultNumber(28), resultNumber(35)],
            [resultNumber(28), resultNumber(35), resultNumber(42)],
        ],
    })
    expect(resolve({ type: 'multiply-dot', a: matrix, b: scalar })).toEqual({
        type: 'matrix',
        n: 4,
        m: 3,
        values: [
            [resultNumber(7), resultNumber(14), resultNumber(21)],
            [resultNumber(14), resultNumber(21), resultNumber(28)],
            [resultNumber(21), resultNumber(28), resultNumber(35)],
            [resultNumber(28), resultNumber(35), resultNumber(42)],
        ],
    })
})
test('multiply-cross', () => {
    expect(resolve({ type: 'multiply-dot', a: scalar, b: matrix })).toEqual({
        type: 'matrix',
        n: 4,
        m: 3,
        values: [
            [resultNumber(7), resultNumber(14), resultNumber(21)],
            [resultNumber(14), resultNumber(21), resultNumber(28)],
            [resultNumber(21), resultNumber(28), resultNumber(35)],
            [resultNumber(28), resultNumber(35), resultNumber(42)],
        ],
    })
    expect(resolve({ type: 'multiply-dot', a: matrix, b: scalar })).toEqual({
        type: 'matrix',
        n: 4,
        m: 3,
        values: [
            [resultNumber(7), resultNumber(14), resultNumber(21)],
            [resultNumber(14), resultNumber(21), resultNumber(28)],
            [resultNumber(21), resultNumber(28), resultNumber(35)],
            [resultNumber(28), resultNumber(35), resultNumber(42)],
        ],
    })
})
test('multiply-implicit', () => {
    expect(resolve({ type: 'multiply-dot', a: scalar, b: matrix })).toEqual({
        type: 'matrix',
        n: 4,
        m: 3,
        values: [
            [resultNumber(7), resultNumber(14), resultNumber(21)],
            [resultNumber(14), resultNumber(21), resultNumber(28)],
            [resultNumber(21), resultNumber(28), resultNumber(35)],
            [resultNumber(28), resultNumber(35), resultNumber(42)],
        ],
    })
    expect(resolve({ type: 'multiply-dot', a: matrix, b: scalar })).toEqual({
        type: 'matrix',
        n: 4,
        m: 3,
        values: [
            [resultNumber(7), resultNumber(14), resultNumber(21)],
            [resultNumber(14), resultNumber(21), resultNumber(28)],
            [resultNumber(21), resultNumber(28), resultNumber(35)],
            [resultNumber(28), resultNumber(35), resultNumber(42)],
        ],
    })
})
test('divide-fraction', () => {
    expect(resolve({ type: 'divide-fraction', a: scalar, b: matrix })).toEqual({
        type: 'matrix',
        n: 4,
        m: 3,
        values: [
            [resultNumber(7 / 1), resultNumber(7 / 2), resultNumber(7 / 3)],
            [resultNumber(7 / 2), resultNumber(7 / 3), resultNumber(7 / 4)],
            [resultNumber(7 / 3), resultNumber(7 / 4), resultNumber(7 / 5)],
            [resultNumber(7 / 4), resultNumber(7 / 5), resultNumber(7 / 6)],
        ],
    })
    expect(resolve({ type: 'divide-fraction', a: matrix, b: scalar })).toEqual({
        type: 'matrix',
        n: 4,
        m: 3,
        values: [
            [resultNumber(1 / 7), resultNumber(2 / 7), resultNumber(3 / 7)],
            [resultNumber(2 / 7), resultNumber(3 / 7), resultNumber(4 / 7)],
            [resultNumber(3 / 7), resultNumber(4 / 7), resultNumber(5 / 7)],
            [resultNumber(4 / 7), resultNumber(5 / 7), resultNumber(6 / 7)],
        ],
    })
})
test('divide-inline', () => {
    expect(resolve({ type: 'divide-inline', a: scalar, b: matrix })).toEqual({
        type: 'matrix',
        n: 4,
        m: 3,
        values: [
            [resultNumber(7 / 1), resultNumber(7 / 2), resultNumber(7 / 3)],
            [resultNumber(7 / 2), resultNumber(7 / 3), resultNumber(7 / 4)],
            [resultNumber(7 / 3), resultNumber(7 / 4), resultNumber(7 / 5)],
            [resultNumber(7 / 4), resultNumber(7 / 5), resultNumber(7 / 6)],
        ],
    })
    expect(resolve({ type: 'divide-inline', a: matrix, b: scalar })).toEqual({
        type: 'matrix',
        n: 4,
        m: 3,
        values: [
            [resultNumber(1 / 7), resultNumber(2 / 7), resultNumber(3 / 7)],
            [resultNumber(2 / 7), resultNumber(3 / 7), resultNumber(4 / 7)],
            [resultNumber(3 / 7), resultNumber(4 / 7), resultNumber(5 / 7)],
            [resultNumber(4 / 7), resultNumber(5 / 7), resultNumber(6 / 7)],
        ],
    })
})
test('power', () => {
    failResolve({ type: 'power', a: scalar, b: matrix }, 'powerUnitlessNumberExponent')
    expect(resolve({ type: 'power', a: matrix, b: scalar })).toEqual({
        type: 'matrix',
        n: 4,
        m: 3,
        values: [
            [resultNumber(1 ** 7), resultNumber(2 ** 7), resultNumber(3 ** 7)],
            [resultNumber(2 ** 7), resultNumber(3 ** 7), resultNumber(4 ** 7)],
            [resultNumber(3 ** 7), resultNumber(4 ** 7), resultNumber(5 ** 7)],
            [resultNumber(4 ** 7), resultNumber(5 ** 7), resultNumber(6 ** 7)],
        ],
    })
})

