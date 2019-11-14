import { EquationNode } from 'equation-parser'

export type ResultResolveError = {
    type: 'resolve-error',
    errorType:
    | 'functionUnknown'
    | 'functionArgs'
    | 'functionNumberOnly'

    | 'functionSqrt1Negative'
    | 'functionRoot1PositiveInteger'
    | 'functionRoot2Negative'
    | 'functionSum1Variable'
    | 'functionSum2Integer'
    | 'functionSum3Integer'

    | 'variableUnknown'

    | 'plusDifferentUnits'
    | 'plusMatrixMismatch'
    | 'plusminusUnhandled'
    | 'scalarProductUnbalanced'
    | 'vectorProduct3VectorOnly'
    | 'matrixProductMatrixMismatch'
    | 'multiplyImplicitNoVectors'
    | 'divideNotZero'
    | 'divideMatrixMatrix'
    | 'powerUnitlessNumberExponent'

    | 'noComparison'

    | 'matrixDifferentUnits'
    | 'matrixNoNesting'

    | 'invalidEquation'
    ,
    node: EquationNode | null,
    values: any[],
}
