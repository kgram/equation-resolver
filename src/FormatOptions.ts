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
    /**
     * Strategy for rendering decimals in results.
     *
     * @default
     * ```ts
     * { type: 'auto', significantFigures: 5 }
     * ```
     */
    decimals?: FormatDecimalsOption,
}

export type FormatDecimalsOption =
| {
    /**
     * Default option with 5 significant figures. Switches to
     * engineering-notation above `10^significantFigures` and below `10^2`. No
     * trailing zeroes.
     *
     * @example
     * 123456 = 123.46 * 10 ^ 3
     * 12345.6 = 12346
     * 1234.56 = 1234.6
     * 123.456 = 123.46
     * 12.3456 = 12.346
     * 1.23456 = 1.2346
     * 0.123456 = 0.12346
     * 0.0123456 = 0.012346
     * 0.00123456 = 0.0012346
     * 0.000123456 = 123.46 * 10 ^ (-6)
     */
    type: 'auto',
    significantFigures: number,
}
| {
    /**
     * Fixed amount of decimals. Never uses scientific notation. Has trailing
     * zeroes.
     */
    type: 'fixed',
    digits: number,
}
| {
    /**
     * A set amount of significant digits. Never uses scientific notation.
     * No trailing zeroes.
     */
    type: 'max',
    significantFigures: number,
}
| {
    /**
     * A set amount of significant digits. Never uses scientific notation.
     * Has trailing zeroes.
     */
    type: 'precision',
    significantFigures: number,
}
| {
    /**
     * A number from -10;10 (excluding both ends), multiplied by a power
     * of ten.
     */
    type: 'scientific',
    significantFigures: number,
}
| {
    /**
     * Shows a number from -1000;1000 (excluding both ends), multiplied by a
     * power of ten divisible by 3 (10^3, 10^6 etc.).
     */
    type: 'engineering',
    significantFigures: number,
}
| {
    /**
     * Shows as many digits as possible. Never uses scientific notation. No
     * trailing zeroes. Very vulnerable to floating point rounding errors. Using
     * `max` with ~14 significant figures should yield better results.
     */
    type: 'exact',
}

