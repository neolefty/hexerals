import {Map} from 'immutable';

import {Player} from '../../players/Players';
import {BoardState} from './BoardState';
import {Hex} from './Hex';
import {Board} from './Board';
import {Tile} from './Tile';

export class PlayerFog {
    private prevGlobal?: BoardState
    private prevFog?: BoardState

    constructor(readonly player: Player) {}

    fog(global: BoardState): BoardState {
        if (this.prevFog && global === this.prevGlobal)
            return this.prevFog

        const usePrevBoard = (
            this.prevGlobal && global.board === (this.prevGlobal as BoardState).board
        )

        this.prevFog = {
            ...global,
            board: usePrevBoard
                ? (this.prevFog as BoardState).board
                : this.fogBoard(global.board),
            moves: global.moves.onlyForPlayer(this.player)
        }
        this.prevGlobal = global
        return this.prevFog
    }

    private fogBoard(board: Board) {
        // copy visible tiles — owned by or neighboring player's tiles
        const ownedHexes = board.filterTiles(tile => tile.owner === this.player)
        const mSpots = Map<Hex, Tile>().asMutable()
        const copyIt = (hex: Hex) => {
            if (!mSpots.has(hex) && board.explicitTiles.has(hex))
                mSpots.set(hex, board.explicitTiles.get(hex))
        }
        ownedHexes.forEach(hex => {
            copyIt(hex)
            hex.getNeighbors().forEach(neighbor => copyIt(neighbor))
        })

        // cities and mountains in the distance look the same
        board.explicitTiles.forEach((tile, hex) => {
            if (!mSpots.has(hex)) {
                const fromADistance = tile.fromADistance()
                if (fromADistance)
                    mSpots.set(hex, fromADistance)
            }
        })

        return board.setTiles(mSpots.asImmutable())
    }
}