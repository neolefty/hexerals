import {Board} from './Board'
import {Hex} from './Hex'
import {MovementQueue} from './MovementQueue'
import {Player, PlayerManager} from './players/Players'
import {StatusMessage} from '../../../common/StatusMessage'
import {List} from 'immutable'

export interface BoardState {
    board: Board
    turn: number
    cursor: Hex
    moves: MovementQueue
    players: PlayerManager
    curPlayer: Player | undefined
    messages: List<StatusMessage>
}

export const boardStateToString = (s: BoardState): string =>
    ''
    + (s.cursor === Hex.NONE ? '' : `cursor: ${s.cursor}\n`)
    + `players: ${s.players.toString()}\n`
    + `current: ${s.curPlayer}\n`
    + `board: ${s.board.toString()}\n`
    + `moves: ${s.moves}\n`
    + `messages: ${s.messages}\n`
    + `turn: ${s.turn}\n`

