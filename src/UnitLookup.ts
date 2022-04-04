/**
 * Unit specifier. Keys are basic unit names ('m', 's' etc.), values are powers.
 *
 * @example
 * ```ts
 * const accelerationUnit = { m: 1, s: -2 }
 * ```
 */
export type UnitLookup = {
    [key: string]: number,
}
