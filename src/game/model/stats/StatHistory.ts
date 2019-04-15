import {Player} from '../players/Players'
import {List, Map} from 'immutable'
import {BoardState} from '../board/BoardState'
import {TurnStat} from './TurnStat'
import {BoardStat} from '../board/BoardStat'

const THIN_SIZE = 250  // when it grows this big, thin it
const THIN_RANGE = THIN_SIZE / 2  // when thinning, remove from the first half
const THIN_BATCH = THIN_SIZE / 10  // how many to remove in a thinning
const THIN_PROB = THIN_BATCH / THIN_RANGE

export class StatHistory {
    static readonly EMPTY = new StatHistory(
        List(), Map(), TurnStat.BLANK, TurnStat.BLANK,
    )

    constructor(
        readonly values: List<TurnStat>, // historical values
        readonly lastTurns: Map<Player, number>, // the turn when each player exited
        readonly maxes: TurnStat, // precomputed maxes of this.values
        readonly maxTotals: TurnStat,
    ) {}

    get size() {
        return this.values.size
    }

    get last() {
        return this.values.last(TurnStat.BLANK)
    }

    update = (boardState: BoardState): StatHistory => {
        const prev = this.last
        if (prev.turn === boardState.turn)
            return this
        else {
            const next = TurnStat.create(boardState)

            // find any players that died this time
            let nextLastTurns = this.lastTurns
            if (next.hexes.size < prev.hexes.size)  // fewer players — somebody died
                prev.hexes.stats.forEach(
                    (n: number, player: Player) => {
                        if (!next.hexes.stats.has(player))
                            nextLastTurns = nextLastTurns.set(player, prev.turn)
                    }
                )

            // add this turn's stats to list
            let nextValues = this.values.push(next)
            const nextMaxes = next.max(this.maxes)
            const nextMaxTotals = new TurnStat(
                next.turn,
                new BoardStat<Player>(
                    this.maxTotals.pop.stats,
                    Math.max(this.maxTotals.pop.maxValue, next.pop.total)
                ),
                new BoardStat<Player>(
                    this.maxTotals.hexes.stats,
                    Math.max(this.maxTotals.hexes.maxValue, next.hexes.total)
                ),
            )

            // thin it?
            if (nextValues.size >= THIN_SIZE)
                nextValues = nextValues.filter((value: TurnStat, index: number) =>
                    index > THIN_RANGE || Math.random() > THIN_PROB
                )
            return new StatHistory(nextValues, nextLastTurns, nextMaxes, nextMaxTotals)
        }
    }

    toString = (): string => {
        return JSON.stringify({
            lastTurns: this.lastTurns.toJS(),
            hexes: this.last.hexes.toString(),
            pop: this.last.pop.toString(),
            max: this.maxes.toString(),
        })
    }
}