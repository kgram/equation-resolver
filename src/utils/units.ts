import { EquationNode } from 'equation-parser'
import { ResultNode } from '../ResultNode'
import { UnitLookup } from '../UnitLookup'

export function getUnit(x: ResultNode): UnitLookup {
    if (x.type === 'unit') {
        return x.units
    } else {
        return {}
    }
}

export function getUnitless(x: ResultNode) {
    if (x.type === 'unit') {
        return x.value
    } else {
        return x
    }
}

export function isSameUnit(a: UnitLookup, b: UnitLookup) {
    const keys = Object.keys(a)

    return keys.length === Object.keys(b).length &&
        keys.every((key) => a[key] === b[key])
}

export function isEmptyUnit(x: UnitLookup) {
    return Object.keys(x).length === 0
}

export function combineUnits(
    a: UnitLookup,
    b: UnitLookup,
    mapper: (a: number, b: number, key: string) => number,
): UnitLookup {
    // Get all units from a
    const result = mapUnit(a, (value, key) => {
        return mapper(value, b[key] || 0, key)
    })
    // Get remaining units from b
    for (const [key, value] of Object.entries(b)) {
        if (key in a) { continue }
        const newValue = mapper(0, value, key)
        if (newValue !== 0) {
            result[key] = newValue
        }
    }

    return result
}

export function mapUnit(x: UnitLookup, mapper: (value: number, key: string) => number) {
    const result: UnitLookup = {}
    for (const [key, value] of Object.entries(x)) {
        const newValue = mapper(value, key)
        if (newValue !== 0) {
            result[key] = newValue
        }
    }

    return result
}

export function isUnitEquation(unitTree: EquationNode): boolean {
    switch (unitTree.type) {
        case 'multiply-implicit':
        case 'multiply-dot':
        case 'multiply-cross':
        case 'divide-fraction':
        case 'divide-inline':
            return isUnitEquation(unitTree.a) && isUnitEquation(unitTree.b)
        case 'power':
            return unitTree.a.type === 'variable' && unitTree.b.type === 'number'
        case 'variable':
            return true
        case 'block':
            return isUnitEquation(unitTree.child)
        default:
            return false
    }
}

export function isUnitResult(unitResult: ResultNode): boolean {
    switch (unitResult.type) {
        case 'unit':
            return isUnitResult(unitResult.value)
        case 'number':
            return true
        default:
            return false
    }
}
