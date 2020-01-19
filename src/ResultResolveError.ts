import { EquationNode } from 'equation-parser'

export type ResultResolveError = { type: 'resolve-error', errorNode: EquationNode | null } & (
    | { errorType: 'functionUnknown', name: string }
    | { errorType: 'functionArgLength', name: string, minArgs: number, maxArgs: number }
    | { errorType: 'functionNumberOnly', name: string }

    | { errorType: 'functionSqrt1Positive', name: string }
    | { errorType: 'functionRoot1PositiveInteger', name: string }
    | { errorType: 'functionRoot2Positive', name: string }
    | { errorType: 'functionSum1Variable', name: string, variableType: string }
    | { errorType: 'functionSum2Integer', name: string }
    | { errorType: 'functionSum3Integer', name: string }

    | { errorType: 'variableUnknown', name: string }

    | { errorType: 'plusDifferentUnits' }
    | { errorType: 'plusMatrixMismatch', aDimensions: string, bDimensions: string }
    | { errorType: 'plusminusUnhandled' }
    | { errorType: 'scalarProductUnbalanced', aLength: number, bLength: number }
    | { errorType: 'vectorProduct3VectorOnly' }
    | { errorType: 'matrixProductMatrixMismatch', aDimensions: string, bDimensions: string }
    | { errorType: 'multiplyImplicitNoVectors' }
    | { errorType: 'divideNotZero' }
    | { errorType: 'divideMatrixMatrix' }
    | { errorType: 'powerUnitlessNumberExponent' }

    | { errorType: 'operatorInvalidArguments', operator: string, a: 'matrix' | 'number', b: 'matrix' | 'number' }

    | { errorType: 'noComparison' }

    | { errorType: 'matrixDifferentUnits' }
    | { errorType: 'matrixNoNesting' }

    | { errorType: 'invalidEquation' }

    | { errorType: 'placeholder' }

    | { errorType: 'invalidUnit' }
)
