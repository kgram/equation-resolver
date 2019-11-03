import { EquationNode } from 'equation-parser'

export const equationVariable = (name: string): EquationNode => {
    return {
        type: 'variable',
        name,
    }
}
