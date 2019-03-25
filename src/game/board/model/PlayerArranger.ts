import {List, Map} from 'immutable';
import * as assert from 'assert';

import {Board} from './Board';
import {Hex, hexesToString} from './Hex';
import {Tile} from './Tile';
import {Arranger, MAP_TOO_SMALL} from './Arranger';
import {StatusMessage} from '../../../common/StatusMessage';
import {Player} from './players/Players';
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
        let emptyHexes: Hex[] = board.filterTiles(
            tile => tile.terrain === Terrain.Empty
        ).toArray()
        let starts = Map<Hex, Tile>()
        board.players.forEach((player: Player) => {
            if (emptyHexes.length > 0) {
                const i = Math.floor(Math.random() * emptyHexes.length)
                // shorten emptyHexes by 1
                const hex = emptyHexes.splice(i, 1)[0]
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

    public arrange(
        board: Board,
        status: StatusMessage[] | undefined = undefined,
    ): Map<Hex, Tile> {
        assert.ok(board.players.size <= 4)
        let starts = Map<Hex, Tile>()
        const corners = [
            (b: Board) => b.edges.lowerLeft,
            (b: Board) => b.edges.upperRight,
            (b: Board) => b.edges.upperLeft,
            (b: Board) => b.edges.lowerRight,
        ]
        board.players.forEach((player, i) => {
            const hex = corners[i](board)
            const prevOwner = starts.get(hex, Tile.EMPTY).owner
            if (prevOwner !== Player.Nobody) {
                if (status)
                    status.push(new StatusMessage(
                        MAP_TOO_SMALL,
                        `Could not place player ${player} in corner #${i}.`,
                        `Hex at ${hex.toString()} already occupied by ${prevOwner}`,
                    ))
            }
            else
                starts = starts.set(hex, new Tile(player, this.startingPop, this.terrain))
        })
        return starts
    }

    toString = (): string =>
        `corners arranger — capital: ${this.terrain}; pop: ${this.startingPop}`
}

// Spread out players — maximize each player's distance to their nearest neighbor,
// and minimize the difference between those nearest neighbors.
// This may not really be fair because some players will have more nearby neighbors than others.
// Maybe better to minimize difference in total distance to neighbors?
