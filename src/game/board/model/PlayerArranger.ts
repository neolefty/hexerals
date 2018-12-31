import * as assert from 'assert';
import {List, Map} from 'immutable';

import {Board} from './Board';
import {Hex} from './Hex';
import {Tile} from './Tile';
import {Arranger, MAP_TOO_SMALL} from './Arranger';
import {StatusMessage} from '../../../common/StatusMessage';
import {Player} from './players/Players';
import {CacheDistance} from './ShortestPath';
import {Terrain} from './Terrain';

// arranges players on a board
export class RandomPlayerArranger extends Arranger {
    constructor(
        readonly startingPop: number = 0,
        readonly startingTerrain: Terrain = Terrain.City,
    ) {
        super()
    }

    // return a map of starting tiles
    public arrange(
        board: Board,
        status: StatusMessage[] | undefined = undefined,
    ): Map<Hex, Tile> {
        const allHexes: Hex[] = board.filterTiles(tile => tile.terrain === Terrain.Empty).toArray()
        let starts = Map<Hex, Tile>()
        board.players.forEach((player: Player) => {
            if (allHexes.length > 0) {
                const i = Math.floor(Math.random() * allHexes.length)
                const hex = allHexes.splice(i, 1)[0]
                starts = starts.set(hex, new Tile(
                    player,
                    this.startingPop,
                    this.startingTerrain,
                ))
            }
            else {
                if (status)
                    status.push(new StatusMessage(
                        MAP_TOO_SMALL,
                        `Could not place player ${player}`,
                        `map size ${board.hexesAll.size} / players ${
                            board.players.size
                            }`,
                    ))
            }
        })
        return starts
    }
}

// place up to 4 players in lower left, upper right, upper left, and lower right
export class CornersPlayerArranger extends Arranger {
    constructor(
        readonly startingPop: number = 0,
        readonly terrain: Terrain = Terrain.City,
    ) { super() }

    public arrange(board: Board): Map<Hex, Tile> {
        assert(board.players.size <= 4)
        let starts = Map<Hex, Tile>()
        const corners = [
            (b: Board) => b.edges.lowerLeft,
            (b: Board) => b.edges.upperRight,
            (b: Board) => b.edges.upperLeft,
            (b: Board) => b.edges.lowerRight,
        ]
        board.players.forEach((player, i) =>
            starts = starts.set(
                corners[i](board),
                new Tile(player, this.startingPop, this.terrain),
            )
        )
        return starts
    }
}

// Spread out players — maximize each player's distance to their nearest neighbor,
// and minimize the difference between those nearest neighbors.
// This may not really be fair because some players will have more nearby neighbors than others.
// Maybe better to minimize difference in total distance to neighbors?
export class SpreadPlayersArranger extends Arranger {
    constructor(
        readonly startingTerrain: Terrain = Terrain.Capital,
        readonly startingPop: number = 0,
        readonly settleRounds: number = 4,  // how many rounds to require to settle before returning
        readonly settleDelta: number = 6, // maximum change during settling
        readonly maxRounds: number = 30, // when to give up
        readonly minRounds: number = 6,
    ) { super() }

    arrange(board: Board, status: StatusMessage[] | undefined = undefined): Map<Hex, Tile> {
        const randomStarts: Map<Hex, Tile> = new RandomPlayerArranger(
            this.startingPop, this.startingTerrain,
        ).arrange(board, status)
        const emptyHexes = board.filterTiles(tile => tile.terrain === Terrain.Empty)
        const distances = new CacheDistance(emptyHexes)
        // the last N rounds' delta between closest & farthest pairs
        let lastNDeltas: List<number> = List<number>(Array(this.settleRounds).fill(Infinity))
        let nRounds = 0
        let curStarts = randomStarts
        // console.log(`Start — ${ hexesToString(List(List(curStarts.keys()).sort()))}`)

        const distancesToOthers = (a: Hex, player: Player): List<number> => {
            const result: number[] = []
            curStarts.forEach((tileB, hexB) => {
                if (tileB.owner !== player)
                    result.push(distances.distance(a, hexB))
            })
            // console.log(`        > distances from ${a.toCartString()}: ${result}`)
            return List(result)
        }

        while (
            nRounds < this.minRounds ||
            (nRounds < this.maxRounds && lastNDeltas.max() > this.settleDelta)
        ) {
            let nextStarts: Map<Hex, Tile> = Map<Hex, Tile>()
            let [ maxOfMins, minOfMins ] = [ -Infinity, Infinity ]
            curStarts.forEach((tile, hex) => {
                // console.log(`     * ${tile.owner} at ${hex.toCartString()}`)
                let [ nextHex, minDist ] = [ hex, distancesToOthers(hex, tile.owner).min() ]
                hex.neighbors.forEach(neighbor => {
                    if (!curStarts.has(neighbor) && emptyHexes.has(neighbor)) {
                        const neighborDs = distancesToOthers(neighbor, tile.owner)
                        if (neighborDs.min() > minDist) {
                            [ nextHex, minDist ] = [ neighbor, neighborDs.min() ]
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
}