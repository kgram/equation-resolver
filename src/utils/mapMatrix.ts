import { ResultNodeMatrix, ResultNodeNumber } from '../ResultNode'

export const mapMatrix = (result: ResultNodeMatrix, mapper: (cell: ResultNodeNumber) => ResultNodeNumber): ResultNodeMatrix => ({
    type: 'matrix',
    m: result.m,
    n: result.n,
    values: result.values.map((row) => row.map(mapper)),
})
