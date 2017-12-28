// a player's control of their part in a game
import { Board, Move, Player } from './game';
import * as assert from 'assert';

export class GamePlayerControl {
    board: Board;
    cursor: number;  // coordinate of cursor
    player: Player;

    constructor(player: Player, board: Board) {
        this.player = player;
        this.board = board;
        this.cursor = -1;  // nowhere
    }

    createMove(step: number): Move {
        assert(this.board.positions[this.cursor].owner === this.player);
        return new Move(this.cursor, step);
    }
}