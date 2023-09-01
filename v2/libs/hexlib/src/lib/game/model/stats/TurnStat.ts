import {BoardState} from '../board/BoardState'
import {BoardStat} from '../board/BoardStat'
import {Player} from '../players/Players'
import {Map} from 'immutable'

export const EMPTY_BOARD_STAT: BoardStat<Player> =
    new BoardStat(Map(), 0)

export class TurnStat {
    static create(boardState: BoardState): TurnStat {
        return new TurnStat(
            boardState.turn,
            boardState.board.getPopStatistics(),
            boardState.board.getHexStatistics(),
        )
    }

    static readonly BLANK = new TurnStat(
        -1, EMPTY_BOARD_STAT, EMPTY_BOARD_STAT,
    )

    constructor(
        readonly turn: number,
        readonly pop: BoardStat<Player>,
        readonly hexes: BoardStat<Player>,
    ) {}

    max(that: TurnStat): TurnStat {
        const pop = this.pop.max(that.pop)
        const hexes = this.hexes.max(that.hexes)
        return (pop === this.pop && hexes === this.hexes && this.turn >= that.turn)
            ? this
            : new TurnStat(Math.max(this.turn, that.turn), pop, hexes)
    }

    toString(): string {
        return JSON.stringify({
            turn: this.turn,
            pop: this.pop.toString(),
            hexes: this.hexes.toString(),
        })
    }
}