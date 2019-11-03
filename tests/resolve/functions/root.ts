import { resolve } from '../../../src'
import { defaultFunctions } from '../../../src/defaultFunctions'
import { equationNumber } from '../../helpers/equationNumber'
import { resultNumber } from '../../helpers/resultNumber'

import '../../helpers/toEqualCloseTo'

test('default', () => {
    expect(resolve({
        type: 'function',
        name: 'root',
        args: [equationNumber(3), equationNumber(125)],
    }, {}, defaultFunctions)).toEqualCloseTo(resultNumber(5))
})
