import { resolve } from '../../src'
import { defaultFunctions } from '../../src/defaultFunctions'

import { equationNumber } from '../helpers/equationNumber'
import { resultNumber } from '../helpers/resultNumber'
import { failResolve } from '../helpers/failResolve'


test('sin', () => {
    expect(resolve({
        type: 'function',
        name: 'sin',
        args: [equationNumber(5)],
    }, { functions: defaultFunctions })).toEqual(resultNumber(Math.sin(5)))
})

test('cos', () => {
    expect(resolve({
        type: 'function',
        name: 'cos',
        args: [equationNumber(5)],
    }, { functions: defaultFunctions })).toEqual(resultNumber(Math.cos(5)))
})

test('tan', () => {
    expect(resolve({
        type: 'function',
        name: 'tan',
        args: [equationNumber(5)],
    }, { functions: defaultFunctions })).toEqual(resultNumber(Math.tan(5)))
})

test('asin', () => {
    expect(resolve({
        type: 'function',
        name: 'asin',
        args: [equationNumber(5)],
    }, { functions: defaultFunctions })).toEqual(resultNumber(Math.asin(5)))
})

test('acos', () => {
    expect(resolve({
        type: 'function',
        name: 'acos',
        args: [equationNumber(5)],
    }, { functions: defaultFunctions })).toEqual(resultNumber(Math.acos(5)))
})

test('atan', () => {
    expect(resolve({
        type: 'function',
        name: 'atan',
        args: [equationNumber(5)],
    }, { functions: defaultFunctions })).toEqual(resultNumber(Math.atan(5)))
})

test('atan2', () => {
    expect(resolve({
        type: 'function',
        name: 'atan2',
        args: [equationNumber(5), equationNumber(2)],
    }, { functions: defaultFunctions })).toEqual(resultNumber(Math.atan2(5, 2)))
})

test('abs', () => {
    expect(resolve({
        type: 'function',
        name: 'abs',
        args: [equationNumber(5)],
    }, { functions: defaultFunctions })).toEqual(resultNumber(Math.abs(5)))
})

test('ceil', () => {
    expect(resolve({
        type: 'function',
        name: 'ceil',
        args: [equationNumber(5.2)],
    }, { functions: defaultFunctions })).toEqual(resultNumber(Math.ceil(5.2)))
})

test('floor', () => {
    expect(resolve({
        type: 'function',
        name: 'floor',
        args: [equationNumber(5.2)],
    }, { functions: defaultFunctions })).toEqual(resultNumber(Math.floor(5.2)))
})

test('round', () => {
    expect(resolve({
        type: 'function',
        name: 'round',
        args: [equationNumber(5.4)],
    }, { functions: defaultFunctions })).toEqual(resultNumber(Math.round(5.4)))
})

test('max', () => {
    expect(resolve({
        type: 'function',
        name: 'max',
        args: [equationNumber(5), equationNumber(2), equationNumber(9)],
    }, { functions: defaultFunctions })).toEqual(resultNumber(Math.max(5, 2, 9)))
})

test('min', () => {
    expect(resolve({
        type: 'function',
        name: 'min',
        args: [equationNumber(5), equationNumber(2), equationNumber(9)],
    }, { functions: defaultFunctions })).toEqual(resultNumber(Math.min(5, 2, 9)))
})

test('pow', () => {
    expect(resolve({
        type: 'function',
        name: 'pow',
        args: [equationNumber(5), equationNumber(3)],
    }, { functions: defaultFunctions })).toEqual(resultNumber(Math.pow(5, 3)))
})

test('sqrt', () => {
    expect(resolve({
        type: 'function',
        name: 'sqrt',
        args: [equationNumber(5)],
    }, { functions: defaultFunctions })).toEqual(resultNumber(Math.sqrt(5)))
})

test('ln', () => {
    expect(resolve({
        type: 'function',
        name: 'ln',
        args: [equationNumber(5)],
    }, { functions: defaultFunctions })).toEqual(resultNumber(Math.log(5)))
})

test('unknown', () => {
    failResolve({ type: 'function', name: 'unknown', args: [equationNumber(5)] }, 'functionUnknown', [], 'unknown')
})
