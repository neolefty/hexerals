import {Player} from '../../players/Players'
import {List, Map, Set} from 'immutable'
import {HexCoord} from './HexCoord'
import {Board} from './Board'
import {Spot, Terrain} from './Spot'
import * as assert from 'assert';
import {connected} from './HexGraph';

export interface Arranger {
    arrange(board: Board): Map<HexCoord, Spot>
}

// arranges players on a board
export class RandomPlayerArranger implements Arranger {
    constructor(readonly startingArmy: number = 0) {}

    // return a map of starting spots
    public arrange(board: Board): Map<HexCoord, Spot> {
        const allHexes: HexCoord[] = board.constraints.all().toArray()
        let starts = Map<HexCoord, Spot>()
        board.players.forEach((player: Player) => {
            if (player !== Player.Nobody && allHexes.length > 0) {
                const i = Math.floor(Math.random() * allHexes.length)
                const hex = allHexes.splice(i, 1)[0]
                starts = starts.set(hex, new Spot(
                    player,
                    this.startingArmy,
                    Terrain.City,
                ))
            }
        })
        return starts
    }
}

// place starting population in lower left, upper right, upper left, and lower right
export class CornersPlayerArranger implements Arranger {
    constructor(readonly startingArmy: number = 0) {}

    public arrange(board: Board): Map<HexCoord, Spot> {
        assert(board.players.size <= 4)
        let starts = Map<HexCoord, Spot>()
        const corners = [
            (b: Board) => b.edges.lowerLeft,
            (b: Board) => b.edges.upperRight,
            (b: Board) => b.edges.upperLeft,
            (b: Board) => b.edges.lowerRight,
        ]
        board.players.forEach((player, i) =>
            starts = starts.set(
                corners[i](board),
                new Spot(player, this.startingArmy, Terrain.City),
            )
        )
        return starts
    }
}

// replace empty terrain randomly and without blocking
export class TerrainArranger implements Arranger {
    constructor(
        // what fraction of empty terrain should be replaced?
        readonly fractionOfEmpty: number,
        readonly terrain: Terrain = Terrain.Mountain
    ) {
        assert(fractionOfEmpty <= 1 && fractionOfEmpty >= 0)
    }

    arrange(board: Board, avoidBlocking: boolean = true): Map<HexCoord, Spot> {
        // spots we might replace with terrain
        let candidates: List<HexCoord> = List(board.constraints.all().filter(
            (hex: HexCoord) => board.isEmpty(hex)
        ))
        // remaining empty spots
        let remainingEmpties: Set<HexCoord> = Set(candidates)

        const beforeEmpty = candidates.size
        const numReplacements = Math.floor(this.fractionOfEmpty * beforeEmpty)

        const resultTemp: Map<HexCoord, Spot> = Map()
        // noinspection PointlessBooleanExpressionJS
        return resultTemp.withMutations(result => {
            while (result.size < numReplacements) {
                const r = Math.floor(Math.random() * candidates.size)
                // pick a random empty to replace with a mountain
                const hex = candidates.get(r)
                // would it bisect the remaining empty spots?
                const remainingWithoutThisOne = remainingEmpties.remove(hex)
                if (!avoidBlocking || connected(remainingWithoutThisOne)) {
                    result.set(hex, board.getSpot(hex).setTerrain(this.terrain))
                    candidates = candidates.delete(r)
                    remainingEmpties = remainingWithoutThisOne
                }
            }
            assert(candidates.size === beforeEmpty - numReplacements)
        })
    }
}