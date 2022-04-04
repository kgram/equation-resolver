import { EquationNode } from 'equation-parser'
import { format, VariableLookup } from '../../src'

import { equationNumber } from '../helpers/equationNumber'
import { equationUnitedNumber } from '../helpers/equationUnitedNumber'
import { equationVariable } from '../helpers/equationVariable'

test('with units, simple', () => {
    const equation: EquationNode = {
        type: 'plus',
        a: equationUnitedNumber(10, 'a'),
        b: equationUnitedNumber(5, 'a'),
    }
    const variables: VariableLookup = {
        a: { type: 'unit', units: { a: 1 }, value: { type: 'number', value: 1 } },
    }
    expect(format(equation, undefined, { variables })).toEqual({
        type: 'equals',
        a: equation,
        b: equationUnitedNumber(15, 'a'),
    })
})

test('with units, complex', () => {
    const equation: EquationNode = {
        type: 'plus',
        a: equationUnitedNumber(10, 'a'),
        b: equationUnitedNumber(5, 'a'),
    }
    const variables: VariableLookup = {
        a: { type: 'unit', units: { b: 2, c: -1 }, value: { type: 'number', value: 1 } },
    }
    expect(format(equation, undefined, { variables })).toEqual({
        type: 'equals',
        a: equation,
        b: {
            type: 'multiply-implicit',
            a: equationNumber(15),
            b: {
                type: 'divide-fraction',
                a: {
                    type: 'power',
                    a: equationVariable('b'),
                    b: equationNumber(2),
                },
                b: equationVariable('c'),
            },
        },
    })
})
