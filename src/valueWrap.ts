import { ResultNodeNumber } from './ResultNode'

export const valueWrap = (x: number): ResultNodeNumber => {
    return {
        type: 'number',
        value: x,
    }
}
