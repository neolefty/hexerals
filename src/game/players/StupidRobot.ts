import {GameDecision, Robot} from './Robot';
import {List} from 'immutable';
import {HexMove, PlayerMove} from '../board/model/Move';
import {BoardState} from '../board/model/BoardState';
import {Player} from './Players';
import {HexCoord} from '../board/model/HexCoord';
import {Spot, Terrain} from '../board/model/Spot';
import {Board} from '../board/model/Board';

// improvements
// * parameterize intelligence -- a vector of booleans or numbers that can be randomly modified
// * specify robot intelligence in options
// * don't make losing moves
// * if you're next to a city and can take it
// * bias towards initial capture
// * test that smarter always wins

const NONE_MOVE = new HexMove(HexCoord.NONE, HexCoord.NONE)

export class StupidRobot implements Robot {
    decide(
        player: Player, bs: BoardState, curMoves?: List<PlayerMove>
    ): GameDecision | undefined {
        // only queue moves if we don't already have any queued
        if (!curMoves || curMoves.size === 0) {
            let totalPop = 0
            // ran into a TS bug with "let curMove: HexCoord | undefined"
            let curMove: HexMove = NONE_MOVE
            forEachLegalMove(bs.board, player, (orig: HexCoord, dest: HexCoord) => {
                const origSpot = bs.board.getSpot(orig)
                // I think this is a shortcut to giving each move a fair weight
                const takeIt: boolean = (Math.random() * (totalPop + origSpot.pop)) > totalPop
                if (takeIt)
                    curMove = new HexMove(orig, dest.minus(orig))
                totalPop += origSpot.pop
            })
            if (curMove !== NONE_MOVE) {
                let result: List<HexMove> = List()
                let pos: HexCoord = curMove.source
                const delta = curMove.delta
                do {
                    result = result.push(new HexMove(pos, delta))
                    pos = pos.plus(delta)
                } while (bs.board.inBounds(pos))
                return { makeMoves: result }
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
                if (board.inBounds(dest) && board.getSpot(dest).terrain !== Terrain.Mountain)
                    sideEffect(orig, dest)
            })
        }
    })
}