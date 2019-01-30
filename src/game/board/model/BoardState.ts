import {Board} from './Board'
import {Hex} from './Hex'
import {MovementQueue} from './MovementQueue'
import {Player, PlayerManager} from './players/Players'
import {StatusMessage} from '../../../common/StatusMessage'
import {List, Map} from 'immutable'

export interface BoardState {
    board: Board
    turn: number
    cursors: Map<number, Hex>
    moves: MovementQueue
    players: PlayerManager
    messages: List<StatusMessage>
    curPlayer?: Player
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
    + `players: ${s.players.toString()}\n`
    + `current: ${s.curPlayer}\n`
    + `board: ${s.board.toString()}\n`
    + `moves: ${s.moves}\n`
    + `messages: ${s.messages}\n`
    + `turn: ${s.turn}\n`