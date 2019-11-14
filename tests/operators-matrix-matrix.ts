import { EquationNode } from 'equation-parser'

import { resolve } from '../src'

import { equationNumber } from './helpers/equationNumber'
import { resultNumber } from './helpers/resultNumber'
import { failResolve } from './helpers/failResolve'

const matrix4x3a: EquationNode = {
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
const matrix4x3b: EquationNode = {
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
const matrix2x4: EquationNode = {
    type: 'matrix',
    n: 4,
    m: 2,
    values: [
        [equationNumber(1), equationNumber(2), equationNumber(3), equationNumber(4)],
        [equationNumber(2), equationNumber(3), equationNumber(4), equationNumber(5)],
    ],
}
const vector3x1a: EquationNode = {
    type: 'matrix',
    n: 1,
    m: 3,
    values: [
        [equationNumber(1)],
        [equationNumber(2)],
        [equationNumber(3)],
    ],
}
const vector3x1b: EquationNode = {
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
    expect(resolve({ type: 'plus', a: matrix4x3a, b: matrix4x3b })).toEqual({
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
    expect(resolve({ type: 'plus', a: matrix4x3b, b: matrix4x3a })).toEqual({
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
    failResolve({ type: 'plus', a: matrix4x3a, b: matrix2x4 }, 'plusMatrixMismatch', [], '4x3', '2x4')
    failResolve({ type: 'plus', a: matrix4x3a, b: vector3x1a }, 'plusMatrixMismatch', [], '4x3', '3x1')
    failResolve({ type: 'plus', a: vector3x1a, b: matrix4x3a }, 'plusMatrixMismatch', [], '3x1', '4x3')
})

test('minus', () => {
    expect(resolve({ type: 'minus', a: matrix4x3a, b: matrix4x3b })).toEqual({
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
    expect(resolve({ type: 'minus', a: matrix4x3b, b: matrix4x3a })).toEqual({
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
    failResolve({ type: 'plus', a: matrix4x3a, b: matrix2x4 }, 'plusMatrixMismatch', [], '4x3', '2x4')
    failResolve({ type: 'plus', a: matrix4x3a, b: vector3x1a }, 'plusMatrixMismatch', [], '4x3', '3x1')
    failResolve({ type: 'plus', a: vector3x1a, b: matrix4x3a }, 'plusMatrixMismatch', [], '3x1', '4x3')
})
test('multiply-dot', () => {
    failResolve({ type: 'multiply-dot', a: matrix4x3a, b: matrix4x3b }, 'matrixProductMatrixMismatch', [], '4x3', '4x3')
    failResolve({ type: 'multiply-dot', a: matrix4x3b, b: matrix4x3a }, 'matrixProductMatrixMismatch', [], '4x3', '4x3')
    expect(resolve({ type: 'multiply-dot', a: matrix2x4, b: matrix4x3a })).toEqual({
        type: 'matrix',
        n: 3,
        m: 2,
        values: [
            [resultNumber(30), resultNumber(40), resultNumber(50)],
            [resultNumber(40), resultNumber(54), resultNumber(68)],
        ],
    })
    expect(resolve({ type: 'multiply-dot', a: matrix4x3a, b: vector3x1a })).toEqual({
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
    failResolve({ type: 'multiply-dot', a: vector3x1a, b: matrix4x3a }, 'matrixProductMatrixMismatch', [], '3x1', '4x3')
    expect(resolve({ type: 'multiply-dot', a: vector3x1a, b: vector3x1b })).toEqual(resultNumber(37))
})
test('multiply-cross', () => {
    failResolve({ type: 'multiply-cross', a: matrix4x3a, b: matrix4x3b }, 'matrixProductMatrixMismatch', [], '4x3', '4x3')
    failResolve({ type: 'multiply-cross', a: matrix4x3b, b: matrix4x3a }, 'matrixProductMatrixMismatch', [], '4x3', '4x3')
    expect(resolve({ type: 'multiply-cross', a: matrix2x4, b: matrix4x3a })).toEqual({
        type: 'matrix',
        n: 3,
        m: 2,
        values: [
            [resultNumber(30), resultNumber(40), resultNumber(50)],
            [resultNumber(40), resultNumber(54), resultNumber(68)],
        ],
    })
    expect(resolve({ type: 'multiply-cross', a: matrix4x3a, b: vector3x1a })).toEqual({
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
    failResolve({ type: 'multiply-cross', a: vector3x1a, b: matrix4x3a }, 'matrixProductMatrixMismatch', [], '3x1', '4x3')
    expect(resolve({ type: 'multiply-cross', a: vector3x1a, b: vector3x1b })).toEqual({
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
    failResolve({ type: 'multiply-implicit', a: matrix4x3a, b: matrix4x3b }, 'matrixProductMatrixMismatch', [], '4x3', '4x3')
    failResolve({ type: 'multiply-implicit', a: matrix4x3b, b: matrix4x3a }, 'matrixProductMatrixMismatch', [], '4x3', '4x3')
    expect(resolve({ type: 'multiply-implicit', a: matrix2x4, b: matrix4x3a })).toEqual({
        type: 'matrix',
        n: 3,
        m: 2,
        values: [
            [resultNumber(30), resultNumber(40), resultNumber(50)],
            [resultNumber(40), resultNumber(54), resultNumber(68)],
        ],
    })
    expect(resolve({ type: 'multiply-implicit', a: matrix4x3a, b: vector3x1a })).toEqual({
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
    failResolve({ type: 'multiply-implicit', a: vector3x1a, b: matrix4x3a }, 'matrixProductMatrixMismatch', [], '3x1', '4x3')
    failResolve({ type: 'multiply-implicit', a: vector3x1a, b: vector3x1b }, 'multiplyImplicitNoVectors', [])
})
test('divide-fraction', () => {
    failResolve({ type: 'divide-fraction', a: matrix4x3a, b: matrix4x3b }, 'divideMatrixMatrix', [])
    failResolve({ type: 'divide-fraction', a: matrix4x3b, b: matrix4x3a }, 'divideMatrixMatrix', [])
    failResolve({ type: 'divide-fraction', a: matrix2x4, b: matrix4x3a }, 'divideMatrixMatrix', [])
    failResolve({ type: 'divide-fraction', a: matrix4x3a, b: vector3x1a }, 'divideMatrixMatrix', [])
    failResolve({ type: 'divide-fraction', a: vector3x1a, b: matrix4x3a }, 'divideMatrixMatrix', [])
    failResolve({ type: 'divide-fraction', a: vector3x1a, b: vector3x1b }, 'divideMatrixMatrix', [])
})
test('divide-inline', () => {
    failResolve({ type: 'divide-inline', a: matrix4x3a, b: matrix4x3b }, 'divideMatrixMatrix', [])
    failResolve({ type: 'divide-inline', a: matrix4x3b, b: matrix4x3a }, 'divideMatrixMatrix', [])
    failResolve({ type: 'divide-inline', a: matrix2x4, b: matrix4x3a }, 'divideMatrixMatrix', [])
    failResolve({ type: 'divide-inline', a: matrix4x3a, b: vector3x1a }, 'divideMatrixMatrix', [])
    failResolve({ type: 'divide-inline', a: vector3x1a, b: matrix4x3a }, 'divideMatrixMatrix', [])
    failResolve({ type: 'divide-inline', a: vector3x1a, b: vector3x1b }, 'divideMatrixMatrix', [])
})
test('power', () => {
    failResolve({ type: 'power', a: matrix4x3a, b: matrix4x3b }, 'powerUnitlessNumberExponent', [])
    failResolve({ type: 'power', a: matrix4x3b, b: matrix4x3a }, 'powerUnitlessNumberExponent', [])
    failResolve({ type: 'power', a: matrix2x4, b: matrix4x3a }, 'powerUnitlessNumberExponent', [])
    failResolve({ type: 'power', a: matrix4x3a, b: vector3x1a }, 'powerUnitlessNumberExponent', [])
    failResolve({ type: 'power', a: vector3x1a, b: matrix4x3a }, 'powerUnitlessNumberExponent', [])
    failResolve({ type: 'power', a: vector3x1a, b: vector3x1b }, 'powerUnitlessNumberExponent', [])
})

