
// This has to be a js-file with an accompanying .d.ts file to allow creating
// global types
import { isEqualWith, isNumber } from 'lodash'
import { matcherHint,printExpected, printReceived } from 'jest-matcher-utils'
import diff from 'jest-diff'

expect.extend({
    toEqualCloseTo(actual, expected) {
        const pass = isEqualWith(actual, expected, (a, b) => {
            if (isNumber(a) && isNumber(b)) {
                return Math.abs(a - b) < Math.max(Math.abs(a), Math.abs(b)) / 1e10
            }
        })
        // Copied from jest 'toEqual'
        const message = pass
            ? () =>
                matcherHint('.not.toEqualCloseTo') +
                '\n\n' +
                `Expected value to not closely equal:\n` +
                `  ${printExpected(expected)}\n` +
                `Received:\n` +
                `  ${printReceived(actual)}`
            : () => {
                const diffString = diff(expected, actual, { expand: false })
                return (
                    matcherHint('.toEqualCloseTo') +
                '\n\n' +
                `Expected value to closely equal:\n` +
                `  ${printExpected(expected)}\n` +
                `Received:\n` +
                `  ${printReceived(actual)}` +
                (diffString ? `\n\nDifference:\n\n${diffString}` : '')
                )
            }
        // Passing the the actual and expected objects so that a custom reporter
        // could access them, for example in order to display a custom visual diff,
        // or create a different error message
        return { actual, expected, message, name: 'toEqualCloseTo', pass }
    },
})
