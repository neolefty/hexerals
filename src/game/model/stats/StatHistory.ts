import {Player} from '../players/Players'
import {List, Map} from 'immutable'
import {BoardState} from '../board/BoardState'

export class TurnStat {
    static create(boardState: BoardState): TurnStat {
        return new TurnStat(
            boardState.turn,
            boardState.board.getPopStatistics(),
            boardState.board.getHexStatistics(),
        )
    }

    static readonly BLANK = new TurnStat(-1, Map(), Map())

    constructor(
        readonly turn: number,
        readonly pop: Map<Player, number>,
        readonly hexes: Map<Player, number>,
    ) {}
}

export class StatHistory {
    static readonly MAX_SIZE = 250
    static readonly THIN_RANGE = 125 // when thinning, remove from the first half

    static readonly EMPTY = new StatHistory(List())

    constructor(readonly values: List<TurnStat>) {}

    update = (boardState: BoardState): StatHistory => {
        if (this.values.last(TurnStat.BLANK).turn === boardState.turn)
            return this
        else
            return new StatHistory(
                this.values.withMutations(mut => {
                    if (mut.size >= StatHistory.MAX_SIZE) // 1. thin
                        mut.remove(Math.floor(Math.random() * StatHistory.THIN_RANGE))
                    mut.push(TurnStat.create(boardState)) // 2. append
                })
            )
    }
}