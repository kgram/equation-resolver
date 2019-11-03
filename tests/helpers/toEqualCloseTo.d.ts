// This has to be in a separate file with no imports to become a global module
// See https://stackoverflow.com/a/32472574
declare namespace jest {
    interface Matchers<R, T> {
        toEqualCloseTo: (expected: any) => R
    }
}
