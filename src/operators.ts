import { ResultNode, ResultNodeNumber, ResultNodeMatrix } from './ResultNode'
import { UnitLookup } from './UnitLookup'

import { getUnit, getUnitless, isEmptyUnit, isSameUnit, mapUnit, combineUnits } from './utils/units'

import { valueWrap } from './valueWrap'
import { mapMatrix } from './utils/mapMatrix'
import { negate } from './negate'

export function plus(aTree: ResultNode, bTree: ResultNode): ResultNode {
    return handleCases(aTree, bTree,
        (a, b) => {
            if (!isSameUnit(a, b)) {
                throw new Error(`Equation resolve: cannot add different units`)
            }
            return a
        },
        // number, number
        (a, b) => valueWrap(a.value + b.value),
        // number, matrix
        (a, b) => mapMatrix(b, (cell) => plus(a, cell) as ResultNodeNumber),
        // matrix, number
        (a, b) => mapMatrix(a, (cell) => plus(cell, b) as ResultNodeNumber),
        // matrix, matrix
        (a, b) => {
            if (a.n !== b.n || a.m !== b.m) {
                throw new Error(`Equation resolve: cannot add ${a.m}x${a.n} matrix to ${b.m}x${b.n} matrix`)
            }
            return {
                type: 'matrix',
                m: a.m,
                n: a.n,
                values: a.values.map(
                    (row, rowIdx) => row.map(
                        (cell, cellIdx) => plus(cell, b.values[rowIdx][cellIdx]) as ResultNodeNumber,
                    ),
                ),
            }
        },
    )
}

export function minus(a: ResultNode, b: ResultNode): ResultNode {
    return plus(a, negate(b))
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function plusminus(a: ResultNode, b: ResultNode): ResultNode {
    throw new Error('Equation resolve: cannot handle ± operator')
}

function multiply(aTree: ResultNode, bTree: ResultNode, multiplyVectors: (a: ResultNodeMatrix, b: ResultNodeMatrix) => ResultNodeNumber | ResultNodeMatrix): ResultNode {
    return handleCases(aTree, bTree,
        (a, b) => combineUnits(a, b, (unit1, unit2) => unit1 + unit2),
        // number, number
        (a, b) => valueWrap(a.value * b.value),
        // number, matrix
        (a, b) => mapMatrix(b, (cell) => multiply(a, cell, multiplyVectors) as ResultNodeNumber),
        // matrix, number
        (a, b) => mapMatrix(a, (cell) => multiply(cell, b, multiplyVectors) as ResultNodeNumber),
        // matrix, matrix
        (a, b) => {
            if (a.n === 1 && b.n === 1) {
                return multiplyVectors(a, b)
            } else {
                return matrixProduct(a, b)
            }
        },
    )
}

function scalarProduct(a: ResultNodeMatrix, b: ResultNodeMatrix): ResultNodeNumber {
    if (a.m !== b.m) {
        throw new Error(`Equation resolve: scalar/dot-product requires balanced vectors`)
    }
    const sum = a.values.reduce(
        (current, row, rowIdx) => current + row[0].value * b.values[rowIdx][0].value,
        0,
    )

    return valueWrap(sum)
}

function vectorProduct(a: ResultNodeMatrix, b: ResultNodeMatrix): ResultNodeMatrix {
    if (a.m !== 3 || b.m !== 3) {
        throw new Error(`Equation resolve: vector/cross-product is defined for 3-dimensional vectors only`)
    }

    return {
        type: 'matrix',
        n: 1,
        m: 3,
        values: [
            [valueWrap(a.values[1][0].value * b.values[2][0].value - a.values[2][0].value * b.values[1][0].value)],
            [valueWrap(a.values[2][0].value * b.values[0][0].value - a.values[0][0].value * b.values[2][0].value)],
            [valueWrap(a.values[0][0].value * b.values[1][0].value - a.values[1][0].value * b.values[0][0].value)],
        ],
    }
}

function matrixProduct(a: ResultNodeMatrix, b: ResultNodeMatrix): ResultNodeMatrix {
    if (a.n !== b.m) {
        throw new Error(`Equation resolve: cannot multiply ${a.m}x${a.n} matrix with ${b.m}x${b.n} matrix`)
    }

    return {
        type: 'matrix',
        m: a.m,
        n: b.n,
        values: a.values.map(
            (row, aRow) => b.values[0].map(
                (cell, bCol) => valueWrap(a.values[aRow].reduce(
                    (current, innerCell, colIdx) => current + innerCell.value * b.values[colIdx][bCol].value,
                    0,
                )),
            ),
        ),
    }
}

export function multiplyImplicit(a: ResultNode, b: ResultNode): ResultNode {
    if (a.type === 'matrix' && b.type === 'matrix' && a.n === 1 && b.n === 1) {
        throw new Error(`Equation resolve: cannot use implied multiplication for scalar product`)
    }
    return multiply(a, b, scalarProduct)
}

export function multiplyDot(a: ResultNode, b: ResultNode): ResultNode {
    return multiply(a, b, scalarProduct)
}

export function multiplyCross(a: ResultNode, b: ResultNode): ResultNode {
    return multiply(a, b, vectorProduct)
}

export function divide(aTree: ResultNode, bTree: ResultNode): ResultNode {
    if (bTree.type === 'number' && bTree.value === 0) {
        throw new Error(`Equation resolve: cannot divide by 0`)
    }
    return handleCases(aTree, bTree,
        (a, b) => combineUnits(a, b, (factor1, factor2) => factor1 - factor2),
        // number, number
        (a, b) => valueWrap(a.value / b.value),
        // number, matrix
        (a, b) => mapMatrix(b, (cell) => divide(a, cell) as ResultNodeNumber),
        // matrix, number
        (a, b) => mapMatrix(a, (cell) => divide(cell, b) as ResultNodeNumber),
        // matrix, matrix
        null,
    )
}

export function power(aTree: ResultNode, bTree: ResultNode): ResultNode {
    if (bTree.type === 'unit') {
        throw new Error(`Equation resolve: exponent must be unitless`)
    }
    if (bTree.type !== 'number') {
        throw new Error(`Equation resolve: exponent must be a number`)
    }
    return handleCases(aTree, bTree,
        (a) => mapUnit(a, (factor) => factor * bTree.value),
        // number, number
        (a, b) => valueWrap(Math.pow(a.value, b.value)),
        // number, matrix
        null,
        // matrix, number
        (a, b) => mapMatrix(a, (cell) => valueWrap(Math.pow(cell.value, b.value))),
        // matrix, matrix
        null,
    )
}

function handleCases(
    a: ResultNode,
    b: ResultNode,
    combineUnits: (a: UnitLookup, b: UnitLookup) => UnitLookup,
    numberNumber: ((a: ResultNodeNumber, b: ResultNodeNumber) => ResultNodeNumber | ResultNodeMatrix) | null,
    numberMatrix: ((a: ResultNodeNumber, b: ResultNodeMatrix) => ResultNodeNumber | ResultNodeMatrix) | null,
    matrixNumber: ((a: ResultNodeMatrix, b: ResultNodeNumber) => ResultNodeNumber | ResultNodeMatrix) | null,
    matrixMatrix: ((a: ResultNodeMatrix, b: ResultNodeMatrix) => ResultNodeNumber | ResultNodeMatrix) | null,
): ResultNode {
    if (a.type === 'unit' || b.type === 'unit') {
        const units = combineUnits(getUnit(a), getUnit(b))

        const result = handleCases(
            getUnitless(a),
            getUnitless(b),
            combineUnits,
            numberNumber,
            numberMatrix,
            matrixNumber,
            matrixMatrix,
        ) as ResultNodeNumber | ResultNodeMatrix

        if (isEmptyUnit(units)) {
            return result
        } else {
            return {
                type: 'unit',
                units,
                value: result,
            }
        }
    }
    switch (a.type) {
        case 'number':
            switch (b.type) {
                case 'number':
                    if (numberNumber) {
                        return numberNumber(a, b)
                    }
                    break
                case 'matrix':
                    if (numberMatrix) {
                        return numberMatrix(a, b)
                    }
                    break
            }
            break

        case 'matrix': {
            switch (b.type) {
                case 'number':
                    if (matrixNumber) {
                        return matrixNumber(a, b)
                    }
                    break
                case 'matrix':
                    if (matrixMatrix) {
                        return matrixMatrix(a, b)
                    }
                    break
            }
            break
        }
    }
    throw new Error(`Equation resolve: cannot handle operator`)
}
