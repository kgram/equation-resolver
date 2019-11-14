import { ResultNode } from './ResultNode'
import { valueWrap } from './valueWrap'
import { mapMatrix } from './utils/mapMatrix'
import { throwUnknownType } from './utils/throwUnknownType'

// Requires extensive hacks to move around type system, since generic types
// don't narrow from control-flow (ie. T remains ResultNode in switch)
export const negate = <T extends ResultNode>(value: T): T => {
    const castValue: ResultNode = value
    switch (castValue.type) {
        case 'number':
            return valueWrap(-castValue.value) as T
        case 'matrix':
            return mapMatrix(castValue, (cell) => negate(cell)) as T
        case 'unit':
            return {
                type: 'unit',
                units: { ...castValue.units },
                value: negate(castValue.value),
            } as T
        default:
            return throwUnknownType(castValue, (type) => `Equation resolve: cannot resolve type "${type}"`)
    }
}
