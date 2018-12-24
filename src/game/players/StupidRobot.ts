import {GameDecision, Robot} from './Robot';
import {List} from 'immutable';
import {HexMove, PlayerMove} from '../board/model/Move';
import {BoardState} from '../board/model/BoardState';
import {Player} from './Players';
import {HexCoord} from '../board/model/HexCoord';
import {Spot} from '../board/model/Spot';
import {Board} from '../board/model/Board';

// improvements
// * parameterize intelligence -- a vector of booleans or numbers that can be randomly modified
// * specify robot intelligence in options
// * don't make losing moves
// * if you're next to a city and can take it
// * bias towards initial capture
// * test that smarter always wins

export class StupidRobot implements Robot {
    decide(
        player: Player, bs: BoardState, curMoves?: List<PlayerMove>
    ): GameDecision | undefined {
        // only queue moves if we don't already have any queued
        if (!curMoves || curMoves.size === 0) {
            const maxes: HexMove[] = []
            let maxPop = 0
            forEachLegalMove(bs.board, player, (orig: HexCoord, dest: HexCoord) => {
                const spot = bs.board.getSpot(orig)
                if (maxes.length === 0 || maxPop <= spot.pop) {
                    maxes.push(new HexMove(orig, dest.minus(orig)))
                    maxPop = spot.pop
                }
            })
            if (maxes.length > 0) {
                const randomMove: HexMove = maxes[
                    Math.floor(Math.random() * maxes.length)
                ]
                let result: List<HexMove> = List()
                let pos: HexCoord = randomMove.source
                do {
                    result = result.push(new HexMove(pos, randomMove.delta))
                    pos = pos.plus(randomMove.delta)
                } while (bs.board.inBounds(pos))
                return {
                    makeMoves: result
                }
            }
        }
        return undefined
    }
}

const forEachLegalMove = (
    board: Board,
    player: Player,
    sideEffect: (orig: HexCoord, dest: HexCoord) => void
): void => {
    board.spots.forEach((spot: Spot, orig: HexCoord) => {
        if (spot.owner === player && spot.pop > 1) {
            orig.getNeighbors().forEach((dest: HexCoord) => {
                if (board.inBounds(dest))
                    sideEffect(orig, dest)
            })
        }
    })
}