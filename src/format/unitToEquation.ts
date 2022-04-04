import { EquationNode } from 'equation-parser'

import { UnitLookup } from '../UnitLookup'

export function unitToEquation(units: UnitLookup): EquationNode {
    // Terms above fraction
    const positive: EquationNode[] = []
    // Terms below fraction
    const negative: EquationNode[] = []
    for (const [unit, factor] of Object.entries(units)) {
        if (factor > 0) {
            positive.push(getExponent(unit, factor))
        } else {
            negative.push(getExponent(unit, -factor))
        }
    }
    if (negative.length === 0) {
        return multiplyList(positive)
    }

    return {
        type: 'divide-fraction',
        a: multiplyList(positive),
        b: multiplyList(negative),
    }
}

function getExponent(unit: string, factor: number): EquationNode {
    if (factor === 1) {
        return { type: 'variable', name: unit }
    } else {
        return {
            type: 'power',
            a: { type: 'variable', name: unit },
            b: { type: 'number', value: factor.toString() },
        }
    }
}


function multiplyList(list: EquationNode[]): EquationNode {
    if (list.length === 0) {
        return {
            type: 'number',
            value: '1',
        }
    }
    let current = list[0]
    // Build multiplication tree
    for (let i = 1; i < list.length; i++) {
        current = {
            type: 'multiply-implicit',
            a: current,
            b: list[i],
        }
    }

    return current
}
