import {List, Map, Set, Range} from 'immutable'
import {devAssert} from "../../../common/Environment"
import {Hex} from './Hex';

export interface HexNum {
    h: Hex
    n: number
}

// type HexEvaluator = (hex: Hex) => number

// Find the best path by flooding (simplified Dijkstra's algorithm).
// extraBenefit: Extra (negative) value of visiting a particular hex. Should be between 0 and -1.
// Note: extraBenefit complicates things because we can't just stop when we reach the dest. Instead, we have to figure out when to stop looking for better paths. Full Dijkstra I guess if you want to update that.
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
        // eslint-disable-next-line no-loop-func
        curRing.forEach(curRingHex => {
            const curCost: HexNum = scratch.get(curRingHex) as HexNum // the cost to get here
            // to get to a neighbor, go here first; the trip will cost you to here + 1
            const nextCost = {h: curRingHex, n: curCost.n + 1}
            curRingHex.neighbors.forEach(neighbor => {
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
        result = result.insert(0, (scratch.get(result.get(0) as Hex) as HexNum).h)

    return result
}

// A step in a shortest path
// class PathStep {
//     constructor (
//         readonly source: Hex,
//         readonly dest: Hex,
//         readonly distance: number,
//         readonly next: Hex
//     ) {}
//
//     // extend this with that — that must start where this ends
//     plus = (that: PathStep): PathStep => {
//         devAssert(that.source === this.dest)
//         return new PathStep(
//             this.source,
//             that.dest,
//             this.distance + that.distance,
//             this.next
//         )
//     }
//
//     // the shorter of the two (this or that)
//     min = (that: PathStep): PathStep => {
//         devAssert(this.sameEndpoints(that))
//         return this.distance < that.distance ? this : that
//     }
//
//     sameEndpoints = (that: PathStep): boolean =>
//         this.source === that.source && this.dest === that.dest
// }

// TODO move ring logic out to here — it's useful in lots of places
// export class Rings {
//     constructor(
//         readonly hexes: Set<Hex>,
//         readonly origin: Hex,
//     ) {}
// }

export class HexPaths {
    private readonly paths: HexNum[][]

    // map of hex ID to path index (to compact this.paths)
    private readonly hexIdToPathIndex = Map<number, number>().asMutable()

    constructor(readonly hexes: Set<Hex>) {
        this.paths = Array(hexes.size) as HexNum[][]
        this.computeLookups()
        this.computePaths()
    }

    // How to get from source to dest? Return the distance and next step.
    step(source: Hex, dest: Hex): HexNum {
        return this.paths[this.pathIndex(source)][this.pathIndex(dest)]
    }

    distance = (source: Hex, dest: Hex): number =>
        this.step(source, dest).n

    // includes both source and dest
    path(source: Hex, dest: Hex): List<Hex> {
        const firstStep = this.step(source, dest)
        const result = Array(firstStep.n + 1) as Hex[]
        result[0] = source
        result[firstStep.n] = dest
        let step = firstStep
        Range(1, firstStep.n).forEach(i => {
            const nextHex = step.h
            result[i] = nextHex
            step = this.step(nextHex, dest)
        })
        return List<Hex>(result)
    }

    private pathIndex = (hex: Hex): number =>
        this.hexIdToPathIndex.get(hex.id) as number

    private computeLookups() {
        let i: number = 0
        this.hexes.forEach(hex =>
            this.hexIdToPathIndex.set(hex.id, i++)
        )
    }

    // Kind of a universal flood fill:
    // 1. Start with all paths of length 1 by concatenating neighbor lists.
    // 2. Lengthen them one step at a time — backwards from the start, so we know the next step in the path — saving unique pairs as we find them and discarding pairs we've already seen.
    // The first time we find a pair, it will be along a shortest path, since we find paths in order of increasing length.
    private computePaths() {
        // allocate this.paths arrays
        Range(0, this.hexes.size).forEach(n =>
            this.paths[n] = Array(this.hexes.size)
        )
        const ones = this.initializeOnes()
        let curEndpoints: Map<Hex, List<Hex>> = ones
        let nextLength = 2  // the length of each of the next set of paths
        while (curEndpoints.size > 0) {
            const nextEndpoints = Map().asMutable() as Map<Hex, List<Hex>>
            // eslint-disable-next-line no-loop-func
            curEndpoints.forEach((curDests: List<Hex>, curSource: Hex) => {
                const nextStep: HexNum = Object.freeze({ h: curSource, n: nextLength })
                curDests.forEach((dest: Hex) => {
                    const destIndex = this.pathIndex(dest)
                    const oneDests = ones.get(curSource) as List<Hex>
                    // Lengthen each path by 1 by considering source's in-bounds neighbors.
                    // We could use curSource.neighbors, but ones is already in-bounds filtered.
                    oneDests.forEach((nextSource: Hex) => {
                        const sourceIndex = this.pathIndex(nextSource)
                        const sourcePaths: HexNum[] = this.paths[sourceIndex]
                        if (!sourcePaths[destIndex]) {  // found a new pair!
                            // New path starts at 1's dest, then to long path's source, then along long path to its dest.
                            sourcePaths[destIndex] = nextStep
                            if (!nextEndpoints.has(nextSource))
                                nextEndpoints.set(nextSource, List<Hex>([dest]).asMutable())
                            else
                                (nextEndpoints.get(nextSource) as List<Hex>).push(dest)
                        }
                    })
                })
            })
            curEndpoints = nextEndpoints
            ++nextLength
        }
    }

    private initializeOnes(): Map<Hex, List<Hex>> {
        // note two side-effects: populate 0's and 1's in this.paths
        return Map<Hex, List<Hex>>().withMutations(result => {
            this.hexes.forEach(source => {
                const sourceIndex = this.pathIndex(source)
                this.paths[sourceIndex][sourceIndex] = Object.freeze({ h: source, n: 0 })
                // 1. map source to dests that are distance 1 away (and in-bounds)
                const neighbors = source.neighbors.filter(
                    neighbor => this.hexes.has(neighbor)
                ) as List<Hex>
                result.set(source, neighbors)
                // 2. update them to the path store
                neighbors.forEach(neighbor =>
                    this.paths[sourceIndex][this.pathIndex(neighbor)] = Object.freeze({ h: neighbor, n: 1 })
                )
            })
        })
    }
}

// cache the navigated distance between pairs of hexes (but not the full path)
export class CacheDistance {
    private cache = Map().asMutable() as Map<Hex, Map<Hex, number>>
    constructor(readonly hexes: Set<Hex>) {}
    distance(a: Hex, b: Hex): number {
        devAssert(this.hexes.has(a))
        devAssert(this.hexes.has(b))
        if (b.id < a.id) // only remember from smaller to larger
            [ a, b ] = [ b, a ]
        if (!this.cache.has(a))
            this.cache.set(a, Map().asMutable() as Map<Hex, number>)
        const aCache = this.cache.get(a) as Map<Hex, number>
        if (!aCache.has(b))
            aCache.set(b, floodShortestPath(this.hexes, a, b).size - 1)
        return aCache.get(b) as number
    }
}
