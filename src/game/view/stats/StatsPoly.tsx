import {StatHistory} from '../../model/stats/StatHistory'
import {Player} from '../../model/players/Players'
import {List, Map} from 'immutable'
import {BoardStat} from '../../model/board/BoardStat'
import {HistoryGraphProps} from './HistoryGraph'
import {TurnStat} from '../../model/stats/TurnStat'
import * as React from 'react'
import {DriftColor} from '../../../color/DriftColor'

const compareStat = (
    a: Player, b: Player,
    last: BoardStat<Player>, // the last turn's stats for this metric
    tieBreaker: Map<Player, number>,
) => {
    const aLive = last.has(a)
    const bLive = last.has(b)
    if (aLive) {
        if (bLive)
            return (last.get(b, 0)) - (last.get(a, 0))
        else // a alive; b dead --> draw a (first) behind b
            return -1
    } else {
        if (bLive) // a dead; b alive --> draw b first
            return 1
        else // both dead --> base decision on faded glory
            return tieBreaker.get(b, 0) - tieBreaker.get(a, 0)
    }
}

// turn "3,7" into "3,0"
const zeroY = (pair: string) => {
    return `${pair.substring(0, pair.lastIndexOf(','))},0`
}

const MIN_Y_RANGE = 5
const MIN_X_RANGE = 25

export class StatsPoly {
    readonly history: StatHistory
    readonly players: List<Player>
    readonly smallFirst: List<Player>
    readonly largeFirst: List<Player>

    constructor(readonly props: HistoryGraphProps) {
        this.history = props.boardState.stats
        this.players = this.props.boardState.board.players
        this.largeFirst = this.players.sort(
            (a: Player, b: Player) =>
                compareStat(a, b, this.props.picker(this.history.last), this.history.lastTurns)
        )
        this.smallFirst = this.largeFirst.reverse()
    }

    private _pointLists?: Map<Player, Array<string>>
    get pointLists(): Map<Player, Array<string>> {
        if (this._pointLists === undefined) {
            // scale
            const xRange = Math.max(MIN_X_RANGE, this.history.size)
            const maxStat = this.props.picker(this.history.maxes)
            const yMax = this.props.stacked
                ? this.props.picker(this.history.maxTotals).total
                : maxStat.maxValue
            const yRange = Math.max(
                MIN_Y_RANGE * (this.props.stacked ? Math.max(this.players.size, 1) : 1),
                yMax
            )
            const transform = ''
                + `translate(0 ${this.props.displaySize.y}) `
                + `scale(${this.props.displaySize.x / xRange} ${- this.props.displaySize.y / yRange})`

            // TODO scale BEFORE conversion to string
            // TODO flip & rotate for orientation
            const xScale = this.props.displaySize.x / xRange
            const yScale = this.props.displaySize.y / yRange

            // initialize empty
            const playerLines = Map<Player, Array<string>>().withMutations(
                mut => this.players.forEach(
                    player => mut.set(player, [])
                )
            )
            // ordering:
            // stacked area
            //   — computing
            //      > smallest & dead longest first (at the bottom)
            //      > largest currently alive last (at top)
            //   — drawing — reverse order (large first, behind others)
            // non-stacked lines: small last
            //   — smallest & dead longest drawn last (in front)
            this.history.values.forEach((stat: TurnStat) => {
                const boardStat = this.props.picker(stat)
                if (this.props.stacked) {
                    let total = 0
                    this.smallFirst.forEach(player => {
                        const n = boardStat.get(player, 0)
                        total += n;
                        if (n > 0) // avoid drawing horizontal line for dead players
                            // TODO scale
                            (playerLines.get(player) as Array<string>).push(`${stat.turn},${total}`)
                    })
                }
                else { // not stacked
                    boardStat.stats.forEach((n, player) => {
                        // TODO scale
                        (playerLines.get(player) as Array<string>).push(`${stat.turn},${n}`)
                    })
                }
            })
            this._pointLists = playerLines
        }
        return this._pointLists as Map<Player, Array<string>>
    }

    get polys(): React.ReactNode {
        // scale so that graph fits naturally — height and width match data
        const xRange = Math.max(MIN_X_RANGE, this.history.size)
        const maxStat = this.props.picker(this.history.maxes)
        const yMax = this.props.stacked
            ? this.props.picker(this.history.maxTotals).total
            : maxStat.maxValue
        const yRange = Math.max(
            MIN_Y_RANGE * (this.props.stacked ? Math.max(this.players.size, 1) : 1),
            yMax
        )
        const transform = ''
            + `translate(0 ${this.props.displaySize.y}) `
            + `scale(${this.props.displaySize.x / xRange} ${- this.props.displaySize.y / yRange})`

        // TODO scale BEFORE conversion to string
        // TODO flip & rotate for orientation
        const xScale = this.props.displaySize.x / xRange
        const yScale = this.props.displaySize.y / yRange

        return (
            <g transform={transform}>
                {
                    (this.largeFirst).map(player => {
                        const line = this.pointLists.get(player) as Array<string>
                        const color = this.props.colors.get(player, DriftColor.GREY_60)
                        return this.props.area
                            ? (<polygon
                                    key={player}
                                    points={`0,0 ${line.join(' ')} ${
                                        // close shape
                                        line.length > 0 ? zeroY(line[line.length - 1]) : ''
                                    }`}
                                    fill={color.toHexString()}
                                />)
                            : (<polyline
                                    key={player}
                                    points={`0,0 ${line.join(' ')}`}
                                    stroke={color.toHexString()}
                                    fill='none'
                                />)
                    })
                }
            </g>
        )
    }
}