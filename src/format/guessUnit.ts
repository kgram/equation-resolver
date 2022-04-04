import { EquationNode } from 'equation-parser'

import { ResultNodeUnit, ResultNodeMatrix, ResultNodeNumber } from '../ResultNode'
import { FormatOptions } from '../FormatOptions'

import { divide } from '../operators'
import { isSameUnit } from '../utils/units'

// Attempt to simplify unit to one of these if possible
const defaultSimplifiableUnits = ['N', 'J', 'W', 'Pa', 'Hz', 'lx', 'C', 'V', 'F', 'Ω', 'S', 'Wb', 'T', 'H', 'Gy']

export function guessUnit(result: ResultNodeUnit, { simplifiableUnits = defaultSimplifiableUnits, variables = {} }: FormatOptions): ResultNodeUnit {
    const unit = simplifiableUnits.find((u) => {
        const variable = variables[u]

        return variable &&
            variable.type === 'unit' &&
            variable.value.type === 'number' &&
            isSameUnit(variable.units, result.units)
    })

    if (unit) {
        const variable = variables[unit] as ResultNodeUnit
        return {
            type: 'unit',
            units: { [unit]: 1 },
            value: divide({} as EquationNode, result.value, variable.value) as ResultNodeMatrix | ResultNodeNumber,
        }
    } else {
        return result
    }
}
