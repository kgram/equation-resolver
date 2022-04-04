import { EquationNode } from 'equation-parser'
import { equationNumber } from './equationNumber'
import { equationVariable } from './equationVariable'

export const equationUnitedNumber = (number: number | string, unit: string): EquationNode => ({
    type: 'multiply-implicit',
    a: equationNumber(number),
    b: equationVariable(unit),
})
