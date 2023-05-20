import {Board} from './Board'
import {Hex} from '../hex/Hex'
import {MovementQueue} from '../move/MovementQueue'
import {Player, PlayerManager} from '../players/Players'
import {List, Map} from 'immutable'
import {GamePhase} from '../cycle/GamePhase';
import {Capture} from '../move/Capture';
import {StatusMessage} from '../../../common/StatusMessage';
import {AnalyticsLabel} from '../../../common/Analytics';
import {StatHistory} from '../stats/StatHistory'

export interface BoardState {
    board: Board
    turn: number
    cursors: Map<number, Hex>
    moves: MovementQueue
    players: PlayerManager
    messages: List<StatusMessage>
    phase: GamePhase
    stats: StatHistory
    curPlayer?: Player
    captures?: List<Capture>
}

export const DEFAULT_CURSORS = Map<number, Hex>(
    [[0, Hex.NONE]]
)

export const BOARD_STATE_STARTER = Object.freeze({
    turn: 0,
    cursors: DEFAULT_CURSORS,
    moves: MovementQueue.EMPTY,
    messages: List<StatusMessage>(),
    phase: GamePhase.BeforeStart,
    stats: StatHistory.EMPTY,
})

export const boardStateToString = (s: BoardState): string =>
    ''
    + `cursors: ${
            List<[number, Hex]>(s.cursors.entries())
                .map(([i, hex]) =>
                    `${i}:${hex.toString()}`).toArray()
        }\n`
    + `players: ${s.players.toString()} (current: ${s.curPlayer})\n`
    + `board: ${s.board.toString()}\n`
    + `moves: ${s.moves}\n`
    + `messages: ${s.messages}\n`
    + `turn: ${s.turn}\n`
    + `phase: ${s.phase}\n`
    + (s.captures && s.captures.size > 0 ? `captures: ${
            s.captures.join('\n          ')
        }\n` : '')

export const curPlayerTileCount = (state: BoardState) => (
    state.curPlayer !== undefined
    && state.board.getHexStatistics().get(state.curPlayer, 0)
) || 0

export const isVictory = (state: BoardState) => (
    state.phase === GamePhase.Ended
    && curPlayerTileCount(state) > 0
)

export const isDefeat = (state: BoardState) => (
    curPlayerTileCount(state) === 0
)

// win, lose, or none
export const analyticsLabel = (state: BoardState): AnalyticsLabel | undefined => {
    if (isVictory(state))
        return AnalyticsLabel.win
    else if (isDefeat(state))
        return AnalyticsLabel.lose
    else
        return undefined
}