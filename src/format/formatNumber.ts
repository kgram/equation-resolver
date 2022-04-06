import { EquationNode } from 'equation-parser'

import { FormatDecimalsOption } from '../FormatOptions'

export const formatNumber = (value: number, options: FormatDecimalsOption = { type: 'auto', significantFigures: 5 }): EquationNode => {
    const number = numberFormatters[options.type](value, options as any)
    return value < 0
        ? { type: 'negative', value: number }
        : number
}

const numberFormatters: {
    [Key in FormatDecimalsOption['type']]: (value: number, options: Extract<FormatDecimalsOption, { type: Key }>) => EquationNode
} = {
    exact: (value) => {
        const [digits, exponent] = breakdownNumber(value.toString())
        return toNumber(digits, exponent)
    },
    fixed: (value, { digits: decimalDigits }) => {
        const [digits, exponent] = breakdownNumber(value.toFixed(decimalDigits))
        return toNumber(digits, exponent)
    },
    max: (value, { significantFigures }) => {
        const [digits, exponent] = breakdownNumber(value < 10 ** significantFigures ? value.toExponential(significantFigures - 1) : value.toFixed(0))
        return toNumber(stripTrailingZeroes(digits), exponent)
    },
    precision: (value, { significantFigures }) => {
        const [digits, exponent] = breakdownNumber(value < 10 ** significantFigures ? value.toExponential(significantFigures - 1) : value.toFixed(0))
        return toNumber(digits, exponent)
    },
    scientific: (value, { significantFigures }) => {
        const [digits, exponent] = breakdownNumber(value.toExponential(significantFigures - 1))
        return toExponent(toNumber(digits, 1), exponent - 1)
    },
    engineering: (value, { significantFigures }) => {
        const [digits, exponent] = breakdownNumber(value.toExponential(significantFigures - 1))
        const remainder = ((((exponent - 1) % 3) + 3) % 3) + 1
        return toExponent(toNumber(digits, remainder), exponent - remainder)
    },
    auto: (value, { significantFigures }) => {
        const [digits, exponent] = breakdownNumber(value.toExponential(significantFigures - 1))
        if (exponent - 1 < significantFigures && exponent > -2) {
            return toNumber(stripTrailingZeroes(digits), exponent)
        }
        const remainder = ((((exponent - 1) % 3) + 3) % 3) + 1
        return toExponent(toNumber(stripTrailingZeroes(digits), remainder), exponent - remainder)
    },
}

/**
 * Breakdown a number into digits, exponent, positive/negative, handling
 * switches to exponent notation above 1e21. -12.345 = ['12345', 2]
 */
const breakdownNumber = (value: string): [string, number] => {
    const [number, exponentString] = value.split('e')
    const [integer, decimals = ''] = number.slice(number[0] === '-' ? 1 : 0).split('.')
    const digits = integer + decimals
    const exponent = integer.length + (exponentString ? parseInt(exponentString, 10) : 0)

    let firstNonZeroIndex = 0
    while (firstNonZeroIndex < digits.length && digits[firstNonZeroIndex] === '0') {
        firstNonZeroIndex++
    }

    // If all digits are zero, leave them to allow for fixed trailing zeroes
    if (firstNonZeroIndex === digits.length) {
        return [
            digits,
            exponent,
        ]
    } else {
        return [
            digits.slice(firstNonZeroIndex),
            exponent - firstNonZeroIndex,
        ]
    }
}

const stripTrailingZeroes = (digits: string) => {
    let firstTrailingZero = digits.length
    while (firstTrailingZero > 1 && digits[firstTrailingZero - 1] === '0') {
        firstTrailingZero--
    }

    return digits.slice(0, firstTrailingZero)
}

const decimalPoint = '.'

const toNumber = (digits: string, exponent: number): EquationNode => {
    if (exponent <= 0) {
        return { type: 'number', value: '0' + decimalPoint + '0'.repeat(-exponent) + digits }
    } else if (digits.length > exponent) {
        return { type: 'number', value: digits.slice(0, exponent) + decimalPoint + digits.slice(exponent) }
    } else {
        return { type: 'number', value: digits.padEnd(exponent, '0') }
    }
}

const toExponent = (number: EquationNode, exponent: number): EquationNode => {
    const exponentNumber: EquationNode = { type: 'number', value: Math.abs(exponent).toString() }
    return {
        type: 'multiply-dot',
        a: number,
        b: {
            type: 'power',
            a: { type: 'number', value: '10' },
            b: exponent < 0
                ? { type: 'block', child: { type: 'negative', value: exponentNumber } }
                : exponentNumber,
        },
    }
}
