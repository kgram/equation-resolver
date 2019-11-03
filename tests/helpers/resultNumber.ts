import { ResultNodeNumber } from '../../src/ResultNode'

export const resultNumber = (value: number): ResultNodeNumber => {
    return {
        type: 'number',
        value,
    }
}
