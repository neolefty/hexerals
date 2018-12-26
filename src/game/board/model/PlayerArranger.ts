import * as assert from 'assert';
import {Map} from 'immutable';

import {Board} from './Board';
import {HexCoord} from './HexCoord';
import {Spot, Terrain} from './Spot';
import {Arranger, MAP_TOO_SMALL} from './Arranger';
import {StatusMessage} from '../../../common/StatusMessage';
import {Player} from '../../players/Players';

// arranges players on a board
export class RandomPlayerArranger extends Arranger {
    constructor(readonly startingArmy: number = 0) {
        super()
    }

    // return a map of starting spots
    public arrange(
        board: Board,
        status: StatusMessage[] | undefined = undefined,
    ): Map<HexCoord, Spot> {
        const allHexes: HexCoord[] = board.allHexes.toArray()
        let starts = Map<HexCoord, Spot>()
        board.players.forEach((player: Player) => {
            if (allHexes.length > 0) {
                const i = Math.floor(Math.random() * allHexes.length)
                const hex = allHexes.splice(i, 1)[0]
                starts = starts.set(hex, new Spot(
                    player,
                    this.startingArmy,
                    Terrain.City,
                ))
            }
            else {
                if (status)
                    status.push(new StatusMessage(
                        MAP_TOO_SMALL,
                        `Could not place player ${player}`,
                        `map size ${board.allHexes.size} / players ${
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
    constructor(readonly startingArmy: number = 0) {
        super()
    }

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