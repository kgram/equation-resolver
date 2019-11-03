import { EquationNode } from 'equation-parser'

export const checkArgs = (name: string, args: EquationNode[], minArgs: number, maxArgs: number) => {
    if (args.length < minArgs || args.length > maxArgs) {
        if (minArgs === maxArgs) {
            throw new Error(`Equation resolve: function "${name}" takes ${minArgs} arguments, not ${args.length}`)
        } else {
            throw new Error(`Equation resolve: function "${name}" takes ${minArgs}-${maxArgs} arguments, not ${args.length}`)
        }
    }
}
