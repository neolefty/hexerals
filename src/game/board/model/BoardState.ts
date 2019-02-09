import {Board} from './Board'
import {Hex} from './Hex'
import {MovementQueue} from './MovementQueue'
import {Player, PlayerManager} from './players/Players'
import {StatusMessage} from '../../../common/StatusMessage'
import {List, Map} from 'immutable'
import {GamePhase} from './GamePhase';
import {Capture} from './Capture';

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