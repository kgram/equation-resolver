import { UnitLookup } from './UnitLookup'

export type ResultNodeNumber = {
    type: 'number',
    value: number,
}

export type ResultNodeMatrix = {
    type: 'matrix',
    n: number,
    m: number,
    values: ResultNodeNumber[][],
}

export type ResultNodeUnit = {
    type: 'unit',
    units: UnitLookup,
    value: ResultNodeMatrix | ResultNodeNumber,
}

export type ResultNode =
    ResultNodeNumber |
    ResultNodeMatrix |
    ResultNodeUnit
