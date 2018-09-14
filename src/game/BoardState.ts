import {Board} from './Board';
import {HexCoord} from './Hex';
import {MovementQueue} from './MovementQueue';
import {PlayerManager} from './Players';
import {StatusMessage} from '../StatusMessage';
import {List} from 'immutable';

export interface BoardState {
    board: Board;
    cursor: HexCoord;
    moves: MovementQueue;
    players: PlayerManager;
    messages: List<StatusMessage>;
}

export const boardStateToString = (s: BoardState): string =>
    ''
    + `cursor: ${s.cursor}\n`
    + `players: ${s.players}\n`
    + `board: ${s.board.toString()}\n`
    + `moves: ${s.moves}\n`
    + `messages: ${s.messages}`
;
