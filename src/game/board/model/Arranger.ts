import {Player} from '../../players/Players'
import {List, Map} from 'immutable'
import {HexCoord} from './HexCoord'
import {Board} from './Board'
import {Spot, Terrain} from './Spot'
import * as assert from 'assert';

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

export class MountainArranger implements Arranger {
    constructor(
        readonly mountainFraction: number,
    ) {
        assert(mountainFraction <= 1 && mountainFraction >= 0)
    }

    arrange(board: Board): Map<HexCoord, Spot> {
        let emptyHexes: List<HexCoord> = List(board.constraints.all().filter(
            (hex: HexCoord) => board.isEmpty(hex)
        ))
        const beforeEmpty = emptyHexes.size
        const numMountains = Math.floor(this.mountainFraction * beforeEmpty)
        const resultTemp: Map<HexCoord, Spot> = Map()
        return resultTemp.withMutations(result => {
            while (result.size < numMountains) {
                const r = Math.floor(Math.random() * emptyHexes.size)
                const hex = emptyHexes.get(r)
                result.set(hex, board.getSpot(hex).setTerrain(Terrain.Mountain))
                emptyHexes = emptyHexes.delete(r)
            }
            assert(emptyHexes.size === beforeEmpty - numMountains)
        })
    }
}
