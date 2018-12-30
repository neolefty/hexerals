import {List} from 'immutable';

import {GameDecision, Robot} from './Robot';
import {HexMove, PlayerMove} from '../board/model/Move';
import {BoardState} from '../board/model/BoardState';
import {Player} from './Players';
import {Hex} from '../board/model/Hex';
import {Tile} from '../board/model/Tile';
import {Board} from '../board/model/Board';
import * as assert from 'assert';

// improvements
// * parameterize intelligence -- a vector of booleans or numbers that can be randomly modified
// * specify robot intelligence in options
// * don't make losing moves
// * if you're next to a city and can take it
// * bias towards initial capture
// * test that smarter always wins

const NONE_MOVE = new HexMove(Hex.NONE, Hex.NONE)

export class StupidRobot implements Robot {
    decide(
        player: Player, bs: BoardState, curMoves?: List<PlayerMove>
    ): GameDecision | undefined {
        // only queue moves if we don't already have any queued
        if (!curMoves || curMoves.size === 0) {
            let totalPop = 0
            let chosenMove: HexMove = NONE_MOVE
            forEachSetOfStarts(
                bs.board,
                player,
                (orig: Hex, dests: List<Hex>) => {
                    const origTile = bs.board.getTile(orig)
                    // I think this is a shortcut to giving each move a fair weight
                    const takeIt: boolean =
                        (Math.random() * (totalPop + origTile.pop)) > totalPop
                    if (takeIt) {
                        const dest = dests.get(Math.floor(Math.random() * dests.size))
                        chosenMove = new HexMove(orig, dest.minus(orig))
                    }
                    totalPop += origTile.pop
                }
            )
            if (chosenMove !== NONE_MOVE) {
                const delta = chosenMove.delta
                let result: List<HexMove> = List()
                let pos: Hex = chosenMove.source
                let dest = chosenMove.dest
                do {
                    result = result.push(new HexMove(pos, delta))
                    pos = dest
                    dest = dest.plus(delta)
                } while (bs.board.canBeOccupied(dest))
                // randomly shorten the move queue, biased towards longer
                if (result.size > 1) {
                    const movesToDrop = Math.floor(
                        Math.random() * Math.random() * result.size
                    )
                    result = result.slice(0, result.size - movesToDrop) as List<HexMove>
                    assert(result.size >= 1)
                }
                return { makeMoves: result }
            }
        }
        return undefined
    }
}

const forEachSetOfStarts = (
    board: Board,
    player: Player,
    sideEffect: (orig: Hex, dests: List<Hex>) => void
): void => {
    board.explicitTiles.forEach((tile: Tile, orig: Hex) => {
        if (tile.owner === player && tile.pop > 1) {
            const dests = orig.neighbors.filter((dest: Hex) =>
                board.canBeOccupied(dest)
            ) as List<Hex>
            if (dests.size > 0)
                sideEffect(orig, dests)
        }
    })
}