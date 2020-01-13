import { EquationNode } from 'equation-parser'

import { ResultNode, ResultNodeNumber, ResultNodeMatrix } from './ResultNode'
import { UnitLookup } from './UnitLookup'
import { ResolverError } from './utils/ResolverError'

import { getUnit, getUnitless, isEmptyUnit, isSameUnit, mapUnit, combineUnits } from './utils/units'

import { valueWrap } from './valueWrap'
import { mapMatrix } from './utils/mapMatrix'
import { negate } from './negate'

export function plus(node: EquationNode, aTree: ResultNode, bTree: ResultNode): ResultNode {
    return handleCases(node, aTree, bTree,
        (a, b) => {
            if (!isSameUnit(a, b)) {
                throw new ResolverError('plusDifferentUnits', node, {})
            }
            return a
        },
        // number, number
        (a, b) => valueWrap(a.value + b.value),
        // number, matrix
        (a, b) => mapMatrix(b, (cell) => plus(node, a, cell) as ResultNodeNumber),
        // matrix, number
        (a, b) => mapMatrix(a, (cell) => plus(node, cell, b) as ResultNodeNumber),
        // matrix, matrix
        (a, b) => {
            if (a.n !== b.n || a.m !== b.m) {
                throw new ResolverError('plusMatrixMismatch', node, { aDimensions: `${a.m}x${a.n}`, bDimensions: `${b.m}x${b.n}` })
            }
            return {
                type: 'matrix',
                m: a.m,
                n: a.n,
                values: a.values.map(
                    (row, rowIdx) => row.map(
                        (cell, cellIdx) => plus(node, cell, b.values[rowIdx][cellIdx]) as ResultNodeNumber,
                    ),
                ),
            }
        },
    )
}

export function minus(node: EquationNode, a: ResultNode, b: ResultNode): ResultNode {
    return plus(node, a, negate(b))
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function plusminus(node: EquationNode, a: ResultNode, b: ResultNode): ResultNode {
    throw new ResolverError('plusminusUnhandled', node, {})
}

function multiply(node: EquationNode,aTree: ResultNode, bTree: ResultNode, multiplyVectors: (node: EquationNode, a: ResultNodeMatrix, b: ResultNodeMatrix) => ResultNodeNumber | ResultNodeMatrix): ResultNode {
    return handleCases(node, aTree, bTree,
        (a, b) => combineUnits(a, b, (unit1, unit2) => unit1 + unit2),
        // number, number
        (a, b) => valueWrap(a.value * b.value),
        // number, matrix
        (a, b) => mapMatrix(b, (cell) => multiply(node, a, cell, multiplyVectors) as ResultNodeNumber),
        // matrix, number
        (a, b) => mapMatrix(a, (cell) => multiply(node, cell, b, multiplyVectors) as ResultNodeNumber),
        // matrix, matrix
        (a, b) => {
            if (a.n === 1 && b.n === 1) {
                return multiplyVectors(node, a, b)
            } else {
                return matrixProduct(node, a, b)
            }
        },
    )
}

function scalarProduct(node: EquationNode, a: ResultNodeMatrix, b: ResultNodeMatrix): ResultNodeNumber {
    if (a.m !== b.m) {
        throw new ResolverError('scalarProductUnbalanced', node, { aLength: a.m, bLength: b.m })
    }
    const sum = a.values.reduce(
        (current, row, rowIdx) => current + row[0].value * b.values[rowIdx][0].value,
        0,
    )

    return valueWrap(sum)
}

function vectorProduct(node: EquationNode, a: ResultNodeMatrix, b: ResultNodeMatrix): ResultNodeMatrix {
    if (a.m !== 3 || b.m !== 3) {
        throw new ResolverError('vectorProduct3VectorOnly', node, {})
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

function matrixProduct(node: EquationNode, a: ResultNodeMatrix, b: ResultNodeMatrix): ResultNodeMatrix {
    if (a.n !== b.m) {
        throw new ResolverError('matrixProductMatrixMismatch', node, { aDimensions: `${a.m}x${a.n}`, bDimensions: `${b.m}x${b.n}` })
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

export function multiplyImplicit(node: EquationNode, a: ResultNode, b: ResultNode): ResultNode {
    if (a.type === 'matrix' && b.type === 'matrix' && a.n === 1 && b.n === 1) {
        throw new ResolverError('multiplyImplicitNoVectors', node, {})
    }
    return multiply(node, a, b, scalarProduct)
}

export function multiplyDot(node: EquationNode, a: ResultNode, b: ResultNode): ResultNode {
    return multiply(node, a, b, scalarProduct)
}

export function multiplyCross(node: EquationNode, a: ResultNode, b: ResultNode): ResultNode {
    return multiply(node, a, b, vectorProduct)
}

export function divide(node: EquationNode,aTree: ResultNode, bTree: ResultNode): ResultNode {
    if (aTree.type === 'matrix' && bTree.type === 'matrix') {
        throw new ResolverError('divideMatrixMatrix', node, {})
    }
    if (bTree.type === 'number' && bTree.value === 0) {
        throw new ResolverError('divideNotZero', node, {})
    }
    if (bTree.type === 'matrix' && bTree.values.some((row) => row.some((cell) => cell.value === 0))) {
        throw new ResolverError('divideNotZero', node, {})
    }
    return handleCases(node, aTree, bTree,
        (a, b) => combineUnits(a, b, (factor1, factor2) => factor1 - factor2),
        // number, number
        (a, b) => valueWrap(a.value / b.value),
        // number, matrix
        (a, b) => mapMatrix(b, (cell) => divide(node, a, cell) as ResultNodeNumber),
        // matrix, number
        (a, b) => mapMatrix(a, (cell) => divide(node, cell, b) as ResultNodeNumber),
        // matrix, matrix
        null,
    )
}

export function power(node: EquationNode, aTree: ResultNode, bTree: ResultNode): ResultNode {
    if (bTree.type !== 'number') {
        throw new ResolverError('powerUnitlessNumberExponent', node, {})
    }
    return handleCases(node, aTree, bTree,
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
    node: EquationNode,
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
            node,
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

    throw new ResolverError('operatorInvalidArguments', node, { operator: node.type, a: a.type, b: b.type })
}
