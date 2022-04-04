import { EquationNode } from 'equation-parser'
import { format, VariableLookup } from '../../src'

import { equationUnitedNumber } from '../helpers/equationUnitedNumber'

test('simplify units', () => {
    const equation: EquationNode = {
        type: 'plus',
        a: equationUnitedNumber(10, 'a'),
        b: equationUnitedNumber(5, 'a'),
    }
    const variables: VariableLookup = {
        a: { type: 'unit', units: { b: 2, c: -1 }, value: { type: 'number', value: 1 } },
    }
    expect(format(equation, undefined, { variables, simplifiableUnits: ['a'] })).toEqual({
        type: 'equals',
        a: equation,
        b: equationUnitedNumber(15, 'a'),
    })
})
