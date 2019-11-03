import { ResultNode, ResultNodeNumber } from '../ResultNode'

export const isInteger = (x: ResultNode): x is ResultNodeNumber => (
    x.type === 'number' && Math.round(x.value) === x.value
)
