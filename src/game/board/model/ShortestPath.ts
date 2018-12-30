import {List, Map, Set} from 'immutable'
import {Hex} from './Hex';
import * as assert from 'assert';

interface HexNum {
    h: Hex
    n: number
}

// type HexEvaluator = (hex: Hex) => number

// Find the best path by flooding (simplified Dijkstra's algorithm).
// extraBenefit: Extra (negative) value of visiting a particular hex. Should be between 0 and -1.
// Note: extraBenefit complicates things because we can't just stop when we reach the dest. Instead, we have to figure out when to stop looking for better paths. Full Dijkstra I guess if you want to add that.
export const floodShortestPath = (
    hexes: Set<Hex>, origin: Hex, dest: Hex // , extraBenefit: HexEvaluator | undefined = undefined
): List<Hex> => {
    // distance (value.n) from origin to intermediate hex (key) and how to start off (value.h)
    // initial condition: cost of zero to go from origin to origin, passing through origin
    const scratch = Map<Hex, HexNum>().set(origin, {h: origin, n: 0}).asMutable()

    let prevRing: Set<Hex> = Set<Hex>() // previous layer of flood — avoid going backwards
    let curRing: Set<Hex> = Set<Hex>([origin]) // current layer we're traversing
    // console.log(`first ring: ${hexesToString(List(curRing))}`)
    while (!scratch.has(dest)) {
        const nextRing = Set<Hex>().asMutable() // build the next layer as we go
        if (curRing.size === 0)
            throw Error(`origin ${origin.toString()} and destination ${
                dest.toString()} are not connected`)
        curRing.forEach(hex => {
            const curCost: HexNum = scratch.get(hex) // the cost to get here
            // to get to a neighbor, go here first; the trip will cost you to here + 1
            const nextCost = {h: hex, n: curCost.n + 1}
            hex.neighbors.forEach(neighbor => {
                if (hexes.has(neighbor) && !curRing.has(neighbor) && !prevRing.has(neighbor)) {
                    nextRing.add(neighbor)
                    const neighborCost = scratch.get(neighbor)
                    if (!neighborCost || neighborCost.n > nextCost.n) {
                        scratch.set(neighbor, nextCost)
                        // console.log(`  -- costs ${nextCost.n} to get to ${neighbor} -- on path from ${nextCost.h}`)
                    }
                }
            })
        })

        // step forward to the next layer
        prevRing = curRing
        curRing = nextRing.asImmutable()
        // console.log(` next ring: ${hexesToString(List(curRing))}`)
    }
    let result = List<Hex>([dest])
    // walk backwards from destination
    while (result.get(0) !== origin)
        result = result.insert(0, scratch.get(result.get(0)).h)

    return result
}

// cache the navigated distance between pairs of hexes (but not the full path)
export class CacheDistance {
    private cache = Map().asMutable() as Map<Hex, Map<Hex, number>>
    constructor(readonly hexes: Set<Hex>) {}
    distance(a: Hex, b: Hex): number {
        assert(this.hexes.has(a))
        assert(this.hexes.has(b))
        if (b.id < a.id) // only remember from smaller to larger
            [ a, b ] = [ b, a ]
        if (!this.cache.has(a))
            this.cache.set(a, Map().asMutable() as Map<Hex, number>)
        const aCache = this.cache.get(a) as Map<Hex, number>
        if (!aCache.has(b))
            aCache.set(b, floodShortestPath(this.hexes, a, b).size)
        return aCache.get(b)
    }
}
