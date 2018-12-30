import {BoardState} from '../BoardState';
import {List} from 'immutable';
import {HexMove, PlayerMove} from '../Move';
import {Player} from './Players';

export interface GameDecision {
    cancelMoves?: number
    makeMoves?: List<HexMove>
}

export interface Robot {
    decide(
        player: Player,
        bs: BoardState,
        curMoves?: List<PlayerMove>,
    ): GameDecision | undefined
}