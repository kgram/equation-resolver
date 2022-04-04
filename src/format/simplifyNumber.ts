import { EquationNode } from 'equation-parser'

export function simplifyNumber(value: number): EquationNode {
    // Handle infinity
    if (value === Infinity) {
        return {
            type: 'variable',
            name: '∞',
        }
    }

    // Float exponent
    const factor = Math.log10(value)

    if (value === 0 || Math.abs(factor) < 5) {
        // Retain regular number
        return {
            type: 'number',
            value: formatNumber(value),
        }
    } else {
        // Rewrite as power-of-ten
        const exponent = Math.floor(factor)
        const significand = value / Math.pow(10, exponent)
        return {
            type: 'multiply-dot',
            a: {
                type: 'number',
                value: formatNumber(significand),
            },
            b: {
                type: 'power',
                a: {
                    type: 'number',
                    value: '10',
                },
                b: {
                    type: 'number',
                    value: formatNumber(exponent),
                },
            },
        }
    }
}

function formatNumber(value: number, digits = 3, commaSep = '.'): string {
    return ensurePrecision(value, digits)
        .split('.')
        .join(commaSep)
}

// number.toPrecision with trailing zeros stripped
// Avoids scientific notation for large numbers
function ensurePrecision(value: number, digits: number) {
    // Handle cases where scientific notation would be used
    if (Math.log(Math.abs(value)) * Math.LOG10E >= digits) {
        return Math.round(value).toString()
    }
    // Strip trailing zeroes
    return Number(value.toPrecision(digits)).toString()
}
