import { EquationNode } from 'equation-parser'

import { resolve } from '../src'

import { equationNumber } from './helpers/equationNumber'
import { resultNumber } from './helpers/resultNumber'

const matrixA: EquationNode = {
    type: 'matrix',
    n: 3,
    m: 4,
    values: [
        [equationNumber(1), equationNumber(2), equationNumber(3)],
        [equationNumber(2), equationNumber(3), equationNumber(4)],
        [equationNumber(3), equationNumber(4), equationNumber(5)],
        [equationNumber(4), equationNumber(5), equationNumber(6)],
    ],
}
const matrixB: EquationNode = {
    type: 'matrix',
    n: 3,
    m: 4,
    values: [
        [equationNumber(2), equationNumber(3), equationNumber(4)],
        [equationNumber(1), equationNumber(2), equationNumber(3)],
        [equationNumber(0), equationNumber(1), equationNumber(2)],
        [equationNumber(-1), equationNumber(0), equationNumber(1)],
    ],
}
const matrixC: EquationNode = {
    type: 'matrix',
    n: 4,
    m: 2,
    values: [
        [equationNumber(1), equationNumber(2), equationNumber(3), equationNumber(4)],
        [equationNumber(2), equationNumber(3), equationNumber(4), equationNumber(5)],
    ],
}
const vectorA: EquationNode = {
    type: 'matrix',
    n: 1,
    m: 3,
    values: [
        [equationNumber(1)],
        [equationNumber(2)],
        [equationNumber(3)],
    ],
}
const vectorB: EquationNode = {
    type: 'matrix',
    n: 1,
    m: 3,
    values: [
        [equationNumber(6)],
        [equationNumber(8)],
        [equationNumber(5)],
    ],
}


test('plus', () => {
    expect(resolve({ type: 'plus', a: matrixA, b: matrixB })).toEqual({
        type: 'matrix',
        n: 3,
        m: 4,
        values: [
            [resultNumber(3), resultNumber(5), resultNumber(7)],
            [resultNumber(3), resultNumber(5), resultNumber(7)],
            [resultNumber(3), resultNumber(5), resultNumber(7)],
            [resultNumber(3), resultNumber(5), resultNumber(7)],
        ],
    })
    expect(resolve({ type: 'plus', a: matrixB, b: matrixA })).toEqual({
        type: 'matrix',
        n: 3,
        m: 4,
        values: [
            [resultNumber(3), resultNumber(5), resultNumber(7)],
            [resultNumber(3), resultNumber(5), resultNumber(7)],
            [resultNumber(3), resultNumber(5), resultNumber(7)],
            [resultNumber(3), resultNumber(5), resultNumber(7)],
        ],
    })
    expect(() => resolve({ type: 'plus', a: matrixA, b: matrixC })).toThrow()
    expect(() => resolve({ type: 'plus', a: matrixA, b: vectorA })).toThrow()
    expect(() => resolve({ type: 'plus', a: vectorA, b: matrixA })).toThrow()
})

test('minus', () => {
    expect(resolve({ type: 'minus', a: matrixA, b: matrixB })).toEqual({
        type: 'matrix',
        n: 3,
        m: 4,
        values: [
            [resultNumber(-1), resultNumber(-1), resultNumber(-1)],
            [resultNumber(1), resultNumber(1), resultNumber(1)],
            [resultNumber(3), resultNumber(3), resultNumber(3)],
            [resultNumber(5), resultNumber(5), resultNumber(5)],
        ],
    })
    expect(resolve({ type: 'minus', a: matrixB, b: matrixA })).toEqual({
        type: 'matrix',
        n: 3,
        m: 4,
        values: [
            [resultNumber(1), resultNumber(1), resultNumber(1)],
            [resultNumber(-1), resultNumber(-1), resultNumber(-1)],
            [resultNumber(-3), resultNumber(-3), resultNumber(-3)],
            [resultNumber(-5), resultNumber(-5), resultNumber(-5)],
        ],
    })
    expect(() => resolve({ type: 'minus', a: matrixA, b: matrixC })).toThrow()
    expect(() => resolve({ type: 'minus', a: matrixA, b: vectorA })).toThrow()
    expect(() => resolve({ type: 'minus', a: vectorA, b: matrixA })).toThrow()
})
test('multiply-dot', () => {
    expect(() => resolve({ type: 'multiply-dot', a: matrixA, b: matrixB })).toThrow()
    expect(() => resolve({ type: 'multiply-dot', a: matrixB, b: matrixA })).toThrow()
    expect(resolve({ type: 'multiply-dot', a: matrixC, b: matrixA })).toEqual({
        type: 'matrix',
        n: 3,
        m: 2,
        values: [
            [resultNumber(30), resultNumber(40), resultNumber(50)],
            [resultNumber(40), resultNumber(54), resultNumber(68)],
        ],
    })
    expect(resolve({ type: 'multiply-dot', a: matrixA, b: vectorA })).toEqual({
        type: 'matrix',
        n: 1,
        m: 4,
        values: [
            [resultNumber(14)],
            [resultNumber(20)],
            [resultNumber(26)],
            [resultNumber(32)],
        ],
    })
    expect(() => resolve({ type: 'multiply-dot', a: vectorA, b: matrixA })).toThrow()
    expect(resolve({ type: 'multiply-dot', a: vectorA, b: vectorB })).toEqual(resultNumber(37))
})
test('multiply-cross', () => {
    expect(() => resolve({ type: 'multiply-cross', a: matrixA, b: matrixB })).toThrow()
    expect(() => resolve({ type: 'multiply-cross', a: matrixB, b: matrixA })).toThrow()
    expect(resolve({ type: 'multiply-cross', a: matrixC, b: matrixA })).toEqual({
        type: 'matrix',
        n: 3,
        m: 2,
        values: [
            [resultNumber(30), resultNumber(40), resultNumber(50)],
            [resultNumber(40), resultNumber(54), resultNumber(68)],
        ],
    })
    expect(resolve({ type: 'multiply-cross', a: matrixA, b: vectorA })).toEqual({
        type: 'matrix',
        n: 1,
        m: 4,
        values: [
            [resultNumber(14)],
            [resultNumber(20)],
            [resultNumber(26)],
            [resultNumber(32)],
        ],
    })
    expect(() => resolve({ type: 'multiply-cross', a: vectorA, b: matrixA })).toThrow()
    expect(resolve({ type: 'multiply-cross', a: vectorA, b: vectorB })).toEqual({
        type: 'matrix',
        n: 1,
        m: 3,
        values: [
            [resultNumber(-14)],
            [resultNumber(13)],
            [resultNumber(-4)],
        ],
    })
})
test('multiply-implicit', () => {
    expect(() => resolve({ type: 'multiply-implicit', a: matrixA, b: matrixB })).toThrow()
    expect(() => resolve({ type: 'multiply-implicit', a: matrixB, b: matrixA })).toThrow()
    expect(resolve({ type: 'multiply-implicit', a: matrixC, b: matrixA })).toEqual({
        type: 'matrix',
        n: 3,
        m: 2,
        values: [
            [resultNumber(30), resultNumber(40), resultNumber(50)],
            [resultNumber(40), resultNumber(54), resultNumber(68)],
        ],
    })
    expect(resolve({ type: 'multiply-implicit', a: matrixA, b: vectorA })).toEqual({
        type: 'matrix',
        n: 1,
        m: 4,
        values: [
            [resultNumber(14)],
            [resultNumber(20)],
            [resultNumber(26)],
            [resultNumber(32)],
        ],
    })
    expect(() => resolve({ type: 'multiply-implicit', a: vectorA, b: matrixA })).toThrow()
    expect(() => resolve({ type: 'multiply-implicit', a: vectorA, b: vectorB })).toThrow()
})
test('divide-fraction', () => {
    expect(() => resolve({ type: 'divide-fraction', a: matrixA, b: matrixB })).toThrow()
    expect(() => resolve({ type: 'divide-fraction', a: matrixB, b: matrixA })).toThrow()
    expect(() => resolve({ type: 'divide-fraction', a: matrixC, b: matrixA })).toThrow()
    expect(() => resolve({ type: 'divide-fraction', a: matrixA, b: vectorA })).toThrow()
    expect(() => resolve({ type: 'divide-fraction', a: vectorA, b: matrixA })).toThrow()
    expect(() => resolve({ type: 'divide-fraction', a: vectorA, b: vectorB })).toThrow()
})
test('divide-inline', () => {
    expect(() => resolve({ type: 'divide-inline', a: matrixA, b: matrixB })).toThrow()
    expect(() => resolve({ type: 'divide-inline', a: matrixB, b: matrixA })).toThrow()
    expect(() => resolve({ type: 'divide-inline', a: matrixC, b: matrixA })).toThrow()
    expect(() => resolve({ type: 'divide-inline', a: matrixA, b: vectorA })).toThrow()
    expect(() => resolve({ type: 'divide-inline', a: vectorA, b: matrixA })).toThrow()
    expect(() => resolve({ type: 'divide-inline', a: vectorA, b: vectorB })).toThrow()
})
test('power', () => {
    expect(() => resolve({ type: 'power', a: matrixA, b: matrixB })).toThrow()
    expect(() => resolve({ type: 'power', a: matrixB, b: matrixA })).toThrow()
    expect(() => resolve({ type: 'power', a: matrixC, b: matrixA })).toThrow()
    expect(() => resolve({ type: 'power', a: matrixA, b: vectorA })).toThrow()
    expect(() => resolve({ type: 'power', a: vectorA, b: matrixA })).toThrow()
    expect(() => resolve({ type: 'power', a: vectorA, b: vectorB })).toThrow()
})

