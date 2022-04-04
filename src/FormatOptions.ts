import { ResolveOptions } from './ResolveOptions'

export type FormatOptions = ResolveOptions & {
    /**
     * A list of units (included as `variables`) that a formatted equation
     * should use if possible.
     *
     * @default
     * ```ts
     * ['N', 'J', 'W', 'Pa', 'Hz', 'lx', 'C', 'V', 'F', 'Ω', 'S', 'Wb', 'T', 'H', 'Gy']
     * ```
     *
     * @example
     * ```ts
     * const variables = { N: { type: 'unit', units: { m: 1, kg: 1, s: -2} } }
     *
     * // With no simplified units, base units are shown
     * stringify(format(parse('5 N + 2 N'), null, { variables, simplifiableUnits: [] }))
     * // -> 7 m kg / s^2
     *
     * // With simplified units, the better result is picked
     * stringify(format(parse('5 N + 2 N'), null, { variables, simplifiableUnits: ['N'] }))
     * // -> 7 N
     * ```
     */
    simplifiableUnits?: string[],
}
