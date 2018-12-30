import {Hex} from './Hex';
import {List, Set} from 'immutable';
import * as assert from 'assert';

export const hexesToString = (s: List<Hex>) => {
    let result = `${s.size} —`
    s.forEach(hex => result += ` ${hex.toCartString()}`)
    return result
}

export const connected = (hexes: Set<Hex>): boolean =>
    hexes.size <= 1 || flood(hexes.first(), hexes).remaining.size === 0

// break up a set of hexes into connected chunks
export const connectedSets = (hexes: Set<Hex>): List<Set<Hex>> => {
    let result: List<Set<Hex>> = List()
    while (hexes.size > 0) {
        const step: FloodResult = flood(hexes.first(), hexes)
        hexes = step.remaining
        result = result.push(step.flooded)
    }
    return result
}

export class FloodResult {
    constructor(
        readonly remaining: Set<Hex>,
        readonly flooded: Set<Hex> = Set(),
    ) {}
    transfer(hex: Hex): FloodResult {
        assert(!this.flooded.has(hex))
        assert(this.remaining.has(hex))
        return new FloodResult(
            this.remaining.delete(hex),
            this.flooded.add(hex),
        )
    }
    toString(): string {
        return `flood / remain — ${this.flooded.size} / ${this.remaining.size} — ${
            hexesToString(List(this.flooded))} / ${hexesToString(List(this.remaining))}`
    }
}

export const flood = (
    start: Hex, hexes: Set<Hex>
): FloodResult => {
    const result = [new FloodResult(hexes)]
    _flood(start, result)
    // console.log(` — ${result[0].toString()}`)
    return result[0]
}
const _flood = (hex: Hex, result: FloodResult[]) => {
    // console.log(`  ... ${hex.toCartString()} | ${result[0].toString()}`)
    result[0] = result[0].transfer(hex)
    hex.neighbors.forEach(neighbor => {
        if (
            result[0].remaining.has(neighbor) // relevant ...
            && !result[0].flooded.has(neighbor) // ... and not captured yet
        )
            _flood(neighbor, result)
    })
}