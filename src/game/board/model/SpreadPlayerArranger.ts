import {Arranger} from './Arranger';
import {Terrain} from './Terrain';
import {Board} from './Board';
import {StatusMessage} from '../../../common/StatusMessage';
import {List, Map, Set} from 'immutable';
import {Hex} from './Hex';
import {Tile} from './Tile';
import {CacheDistance, HexPaths} from './ShortestPath';
import {Player} from './players/Players';
import {RandomPlayerArranger} from './PlayerArranger';

interface Distancer {
    distance(a: Hex, b: Hex): number
}
type DistanceMaker = (hexes: Set<Hex>) => Distancer

export const FloodDM: DistanceMaker = (hexes: Set<Hex>) =>
    new CacheDistance(hexes)

export const PathsDM: DistanceMaker = (hexes: Set<Hex>) =>
    new HexPaths(hexes)

export class SpreadPlayersArranger extends Arranger {
    constructor(
        readonly startingTerrain: Terrain = Terrain.Capital,
        readonly startingPop: number = 0,
        readonly distanceMaker: DistanceMaker = PathsDM,
        readonly settleRounds: number = 4,  // how many rounds to require to settle before returning
        readonly settleDelta: number = 6, // maximum change during settling
        readonly maxRounds: number = 30, // when to give up
        readonly minRounds: number = 6,
    ) {
        super()
    }

    arrange(board: Board, status: StatusMessage[] | undefined = undefined): Map<Hex, Tile> {
        const randomStarts: Map<Hex, Tile> = new RandomPlayerArranger(
            this.startingPop, this.startingTerrain,
        ).arrange(board, status)
        const emptyHexes = board.filterTiles(tile => tile.terrain === Terrain.Empty)
        const distances = this.distanceMaker(emptyHexes)
        // the last N rounds' delta between closest & farthest pairs
        let lastNDeltas: List<number> = List<number>(Array(this.settleRounds).fill(Infinity))
        let nRounds = 0
        let curStarts = randomStarts
        // console.log(`Start — ${ hexesToString(List(List(curStarts.keys()).sort()))}`)

        const distancesToOthers = (hexA: Hex, player: Player): List<number> => {
            const result: number[] = []
            curStarts.forEach((tileB, hexB) => {
                if (tileB.owner !== player)
                    result.push(distances.distance(hexA, hexB))
            })
            // console.log(`        > distances from ${a.toCartString()}: ${result}`)
            return List(result)
        }

        while (
            nRounds < this.minRounds ||
            (nRounds < this.maxRounds && (lastNDeltas.max() as number) > this.settleDelta)
        ) {
            let nextStarts: Map<Hex, Tile> = Map<Hex, Tile>()
            let [maxOfMins, minOfMins] = [-Infinity, Infinity]
            curStarts.forEach((tile, hex) => {
                // console.log(`     * ${tile.owner} at ${hex.toCartString()}`)
                let [nextHex, minDist] = [hex, distancesToOthers(hex, tile.owner).min() as number]
                hex.neighbors.forEach(neighbor => {
                    if (!curStarts.has(neighbor) && emptyHexes.has(neighbor)) {
                        const neighborDs = distancesToOthers(neighbor, tile.owner)
                        if ((neighborDs.min() as number) > minDist) {
                            [nextHex, minDist] = [neighbor, neighborDs.min() as number]
                        }
                    }
                })
                nextStarts = nextStarts.set(nextHex, tile)
                maxOfMins = Math.max(maxOfMins, minDist)
                minOfMins = Math.min(minOfMins, minDist)
            })

            lastNDeltas = lastNDeltas
                .delete(lastNDeltas.size - 1)
                .insert(0, maxOfMins - minOfMins)
            ++nRounds
            curStarts = nextStarts
            // console.log(` - Round ${nRounds} — (${minOfMins} to ${maxOfMins}) ${
            //     hexesToString(List(List(curStarts.keys()).sort()))}`)
        }
        return curStarts
    }

    toString = (): string =>
        `spread arranger — capital: ${this.startingTerrain}; pop: ${this.startingPop}`
}