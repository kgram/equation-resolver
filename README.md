# `equation-resolver` – Resolve equations ASTs

Resolves an AST from [`equation-parser`](https://github.com/kgram/equation-parser) into a number or matrix, optionally with a unit.

## Installation

```
npm install -S equation-resolver
```
or
```
yarn add equation-resolver
```

## API

### `resolve(node: EquationNode | EquationParserError, options: ResolveOptions): ResultNode | ResultResolveError`
Resolve an `EquationNode` (or `EquationParserError`) to a `ResultNode` (or `ResultResolveError`).

Options `functions` and `variables` that should be available should be added as part of options.

Example:
```js
resolve(parse('1+2*3+2/4'))
// returns {
//   type: 'number',
//   value: 7.5
// }
```

### `format(equation: EquationNode | EquationParserError, unit: EquationNode | EquationParserError | null, options: FormatOptions): EquationNode | EquationParserError | EquationResolveError`
Resolve an `EquationNode` (or `EquationParserError`), wraps it in an `equals`-node and adds the result as an `EquationNode`.

Options `functions` and `variables` that should be available should be added as part of options.

If a unit is passed, the result will be in the unit, with any unrepresented unit multiplied, e.g. if `unit` is `m^2` and result is `m^2`, format uses `m^2`. If result is `m^2*kg/s^2`, format uses `m^2 * (kg/s^2)`.

Option `simplifiableUnits` should be an array of variable-names that units can be represented as instead, e.g. showing `N` instead of `m*kg/s^2`. Only used when not passing a unit. Defaults to these:

- `N` (Newton, m * kg / s^2)
- `J` (Joule, m^2 * kg / s^2)
- `W` (Watt, m^2 * kg / s^3)
- `Pa` (Pascal, kg / m / s^2)
- `Hz` (Hertz, 1 / s)
- `lx` (lux, cd / m^2)
- `C` (coulomb, A * s)
- `V` (volt, m^2 * kg / A / s^3)
- `F` (farad, s^4 * A^2 / m^2 / kg)
- `Ω` (ohm, m^2 * kg / A^2 / s^3)
- `S` (siemens, s^3 * A^2 / m^2 / kg)
- `Wb` (weber, m^2 * kg / A / s^2)
- `T` (tesla, kg / A / s^2)
- `H` (henry, m^2 * kg / A^2 / s^2)
- `Gy` (gray, m^2 / s^2)

Errors are automatically wrapped in `equals` with a placeholder-result and the appropriate `EquationParserError` or `EquationResolveError`, which allows highlighting the problematic part of the equation.

Example:
```js
format(parse('1+2*3+2/4'))
// returns {
//     type: 'equals',
//     a: {...},
//     b: { type: 'number', value: '7.5' },
// }

format(parse('2m * 3m'), null, { variables: defaultVariables })
// returns {
//     type: 'equals',
//     a: {...},
//     b: {
//         type: 'multiply-dot',
//         a: { type: 'number', value: '6' },
//         b: {
//             type: 'power',
//             a: { type: 'variable', name: 'm' },
//             b: { type: 'number', value: '2' },
//         },
//     },
// }
```

### `defaultFunctions`
A lookup of common mathmatical functions to be passed as part of options.

- `sin`
- `cos`
- `tan`
- `asin`
- `acos`
- `atan`
- `atan2`
- `abs`
- `ceil`
- `floor`
- `round` (first argument is number to round, second is amount of decimals defaulting to 0)
- `max` (arbitrary amount of arguments)
- `min` (arbitrary amount of arguments)
- `pow`
- `sqrt`
- `root` (first argument is radicand)
- `ln`
- `log` (second argument is base, defaulting to 10)
- `sum` (first argument is variable name, second is start, third is end, fourth is expression)
    Example: `sum(n, 1, 5, n^2)` is 55

The functions can be freely renamed by simply assigning them to a new name, as such:

```js
const customFunctions = {
    squareroot: defaultFunctions.sqrt,
}
```

The new name will be passed along in errors.

### `defaultVariables`
A lookup of common units and numbers to be referenced in equations.

Currently, all units and significant numbers have been attempted to be included as part of `defaultVariables`. This does however mean a lot of probably useless units are included (petabecquerel are rarely used by most people). In the future, this can hopefully be split into some useful sets.

To see the values included, check the `./src/defaultVariables`-file. Additions are welcome.

### `createResolverFunction(argNames: string[], expression: EquationNode, options: ResolveOptions)`
Create a function for future resolving from an `EquationNode`.

Options `functions` and `variables` that should be available should be added as part of options. Note that these may be different from the variables and functions available when the function is invoked.

This is primarily a tool to let users define their own functions.

Example:

```js
// Parse function expression
const node = parse('f(a, b) = a^2 + b')

// Check that expression can be made into a resolver function
if (node.type !== 'equals' || node.a.type !== 'function' || node.a.args.every((arg) => arg.type === 'variable')) {
    throw new Error('Expected equals with a function with only variable-args as left-hand side')
}

// Create the function
const func = createResolverFunction(node.a.args.map((arg) => arg.name), node.b)

resolve(parse('f(2,3)'), {
    functions: {
        // Assign the function as the correct name, `f`
        [node.a.name]: func
    }
})
// returns {
//     type: 'number',
//     value: 7,
// }
```

## AST – `ResultNode`
After resolving, a `ResultNode` is returned. The structure is similar to the `EquationNode` from `equation-parser`, plain objects with a `type` property to distinguish them.

The TS typing enforces the correct ordering of the nodes.

### `'number'` – `ResultNodeNumber`
Represents a plain number

Additional values:
- `value: number`

### `'matrix'` – `ResultNodeMatrix`
Represents a matrix result. The values can only be numbers.

Additional values:
- `n: number`
- `m: number`
- `values: ResultNodeNumber[][]`

### `'unit'` – `ResultNodeUnit`
Represents a matrix or number with a unit. The units are represented as an object with units as keys and numbers as values, e.g. acceleration is `{ m: 2, s: -1 }`.

Additional values:
- `units: UnitLookup`
- `value: ResultNodeMatrix | ResultNodeNumber`

### `'resolver-error'` – `ResultResolveError`
Represents an error during resolution. Not technically a `ResultNode`.

The type of error is represented by the `errorType`-value, taking one of the following:

- `functionUnknown`: The name of the function is not included in the function-lookup.
- `functionArgLength`: Wrong number of arguments.
- `functionNumberOnly`: Argument was a matrix or has a unit, where only plain numbers are supported.

- `functionSqrt1Positive`: Function sqrt must have a positive number as first argument.
- `functionRoot1PositiveInteger`: Function root must have a positive integer as first argument.
- `functionRoot2Positive`: Function root must have a positive number as second arguement.
- `functionSum1Variable`: Function sum must have a variable name as first arguement.
- `functionSum2Integer`: Function sum must have an integer as second argument.
- `functionSum3Integer`: Function sum must have an integer as third argument.

- `variableUnknown`: The name of the variable is not included in the variable lookup.

- `plusDifferentUnits`: Cannot add numbers with different units.
- `plusMatrixMismatch`: Cannot add matrices of wrong dimensions.
- `plusminusUnhandled`: No implementation of plus/minus is included.
- `scalarProductUnbalanced`: Scalar (dot) product requires equal-sized vectors.
- `vectorProduct3VectorOnly`: Vector (cross) product requires vectors of size 3.
- `matrixProductMatrixMismatch`: Cannot multiply matrices of wrong dimensions.
- `multiplyImplicitNoVectors`: Cannot implicitly multiply two vectors (wouldn't know if scalar or vector product is intended)
- `divideNotZero`: Cannot divide by zero.
- `divideMatrixMatrix`: Cannot divide two matrices.
- `powerUnitlessNumberExponent`: Exponent can only be a plain number.

- `operatorInvalidArguments`: Operator has invalid arguments. This should generally be handled by specific errors, such as `divideMatrixMatrix`, ut is include for safety.

- `noComparison`: Cannot resolve a comparison.

- `matrixDifferentUnits`: All cells in a matrix must have the same unit.
- `matrixNoNesting`: A matrix-cell cannot be another matrix.

- `invalidEquation`: Tried to resolve a parser-error.

- `placeholder`: Cannot resolve anything including a placeholder.

- `invalidUnit`: Only used by the `format`-function. The provided `unit` argument was not valid as a unit.

## Known limitations

Plus-minus operators don't work, since they would require the addition of a `ResultNodeSet`-type.

Default math-functions (except for `sum`, which is a special case) are only implemented for unitless numbers.
