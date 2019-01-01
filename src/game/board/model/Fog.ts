import {Map, Set} from 'immutable';

import {Player} from './players/Players';
import {BoardState} from './BoardState';
import {Hex} from './Hex';
import {Board} from './Board';
import {Tile} from './Tile';

export class PlayerFog {
    private prevGlobal?: BoardState
    private prevFog?: BoardState
    // doesn't include empty terrain
    private seenBefore = Set<Hex>().asMutable()

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
        // copy visible explicitTiles — owned by or neighboring player's explicitTiles
        const ownedHexes = board.filterTiles(tile => tile.owner === this.player)
        this.seenBefore = this.seenBefore.union(ownedHexes).asMutable()
        const fogTiles = Map<Hex, Tile>().asMutable()
        const canSee = (hex: Hex) => {
            if (!fogTiles.has(hex)) {
                fogTiles.set(hex, board.explicitTiles.get(hex, Tile.EMPTY))
                this.seenBefore.add(hex)
            }
        }
        ownedHexes.forEach(hex => {
            canSee(hex)
            hex.neighbors.forEach(neighbor => canSee(neighbor))
        })

        // cities and mountains in the distance look the same
        board.explicitTiles.forEach((tile, hex) => {
            if (!fogTiles.has(hex)) {
                const fromADistance = tile.fromADistance(
                    this.seenBefore.has(hex))
                if (fromADistance)
                    fogTiles.set(hex, fromADistance)
            }
        })

        return board.setTiles(fogTiles.asImmutable())
    }
}