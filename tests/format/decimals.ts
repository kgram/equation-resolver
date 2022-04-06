import { EquationNode } from 'equation-parser'

import { format, FormatDecimalsOption } from '../../src'

import { equationExponent } from '../helpers/equationExponent'
import { equationNumber } from '../helpers/equationNumber'

const runTest = (decimals: FormatDecimalsOption, ...values: Array<[string, EquationNode]>) => {
    values.forEach(([input, output]) => {
        const equation: EquationNode = equationNumber(input)
        expect(format(equation, undefined, { decimals })).toEqual({
            type: 'equals',
            a: equation,
            b: output,
        })
    })
}

test('exact', () => {
    runTest(
        { type: 'exact' },
        ['0',               equationNumber('0')],
        ['0.0000000123456', equationNumber('0.0000000123456')],
        ['0.0123456',       equationNumber('0.0123456')],
        ['-0.123456',       equationNumber('-0.123456')],
        ['1.23456',         equationNumber('1.23456')],
        ['1234.56',         equationNumber('1234.56')],
        ['123456',          equationNumber('123456')],
    )
})

test('fixed', () => {
    runTest(
        { type: 'fixed', digits: 2 },
        ['0',               equationNumber('0.00')],
        ['0.0000000123456', equationNumber('0.00')],
        ['0.0123456',       equationNumber('0.01')],
        ['-0.123456',       equationNumber('-0.12')],
        ['1.23456',         equationNumber('1.23')],
        ['1234.56',         equationNumber('1234.56')],
        ['123456',          equationNumber('123456.00')],
    )
})

test('max', () => {
    runTest(
        { type: 'max', significantFigures: 4 },
        ['0',               equationNumber('0')],
        ['0.0000000123456', equationNumber('0.00000001235')],
        ['0.0123456',       equationNumber('0.01235')],
        ['-0.123456',       equationNumber('-0.1235')],
        ['1.23456',         equationNumber('1.235')],
        ['1234.56',         equationNumber('1235')],
        ['123456',          equationNumber('123456')],
    )
})

test('precision', () => {
    runTest(
        { type: 'precision', significantFigures: 4 },
        ['0',               equationNumber('0.000')],
        ['0.0000000123456', equationNumber('0.00000001235')],
        ['0.0123456',       equationNumber('0.01235')],
        ['-0.123456',       equationNumber('-0.1235')],
        ['1.23456',         equationNumber('1.235')],
        ['1234.56',         equationNumber('1235')],
        ['123456',          equationNumber('123456')],
    )
})

test('scientific', () => {
    runTest(
        { type: 'scientific', significantFigures: 4 },
        ['0',               equationExponent('0.000', '0')],
        ['0.0000000123456', equationExponent('1.235', '-8')],
        ['0.0123456',       equationExponent('1.235', '-2')],
        ['-0.123456',       equationExponent('-1.235', '-1')],
        ['1.23456',         equationExponent('1.235', '0')],
        ['1234.56',         equationExponent('1.235', '3')],
        ['123456',          equationExponent('1.235', '5')],
    )
})

test('engineering', () => {
    runTest(
        { type: 'engineering', significantFigures: 4 },
        ['0',               equationExponent('0.000', '0')],
        ['0.0000000123456', equationExponent('12.35', '-9')],
        ['0.0123456',       equationExponent('12.35', '-3')],
        ['-0.123456',       equationExponent('-123.5', '-3')],
        ['1.23456',         equationExponent('1.235', '0')],
        ['1234.56',         equationExponent('1.235', '3')],
        ['123456',          equationExponent('123.5', '3')],
    )
})

test('auto', () => {
    runTest(
        { type: 'auto', significantFigures: 4 },
        ['0',               equationNumber('0')],
        ['0.0000000123456', equationExponent('12.35', '-9')],
        ['0.0123456',       equationNumber('0.01235')],
        ['-0.123456',       equationNumber('-0.1235')],
        ['1.23456',         equationNumber('1.235')],
        ['1234.56',         equationNumber('1235')],
        ['123456',          equationExponent('123.5', '3')],
    )
})
