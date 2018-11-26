import {Board} from './Board'
import {HexCoord} from '../Hex'
import {MovementQueue} from '../MovementQueue'
import {Player, PlayerManager} from '../Players'
import {StatusMessage} from '../../StatusMessage'
import {List} from 'immutable'

export interface BoardState {
    board: Board
    cursor: HexCoord
    moves: MovementQueue
    players: PlayerManager
    curPlayer: Player | undefined
    messages: List<StatusMessage>
}

export const boardStateToString = (s: BoardState): string =>
    ''
    + `cursor: ${s.cursor}\n`
    + `players: ${s.players}\n`
    + `current: ${s.curPlayer}\n`
    + `board: ${s.board.toString()}\n`
    + `moves: ${s.moves}\n`
    + `messages: ${s.messages}`

