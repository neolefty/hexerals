import {Board} from './Board'
import {Hex} from './Hex'
import {MovementQueue} from './MovementQueue'
import {Player, PlayerManager} from './players/Players'
import {StatusMessage} from '../../../common/StatusMessage'
import {List, Map} from 'immutable'
import {GamePhase} from './GamePhase';
import {Capture} from './Capture';
import {AnalyticsLabel} from '../../../common/Analytics';

export interface BoardState {
    board: Board
    turn: number
    cursors: Map<number, Hex>
    moves: MovementQueue
    players: PlayerManager
    messages: List<StatusMessage>
    phase: GamePhase
    curPlayer?: Player
    captures?: List<Capture>
}

export const DEFAULT_CURSORS = Map<number, Hex>(
    [[0, Hex.NONE]]
)

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
    + (s.messages.size > 0 ? `messages: ${s.messages}\n` : '')
    + `turn: ${s.turn}\n`
    + `phase: ${s.phase}\n`
    + (s.captures && s.captures.size > 0 ? `captures: ${
            s.captures.join('\n          ')
        }\n` : '')

export const curPlayerTileCount = (state: BoardState) => (
    state.curPlayer !== undefined
    && state.board.getTileStatistics().get(state.curPlayer, 0)
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