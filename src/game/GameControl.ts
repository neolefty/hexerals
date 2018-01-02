import { Board, Move, Player } from './GameModel';
import * as assert from 'assert';

// a player's control of their part in a game
export class GamePlayerControl {
    cursor: number;  // coordinate of current selection
    board: Board;

    constructor(readonly player: Player, board: Board) {
        this.board = board;
        this.cursor = NaN;  // nowhere
    }

    createMove(step: number): Move {
        // can only create a move for this controller's player
        assert(this.board.getSpot(this.cursor).owner === this.player);
        return new Move(this.cursor, step);
    }

    getCursorSpot() {
        return this.board.getSpot(this.cursor);
    }

    // TODO make this immutable
    apply(move: Move) {
        this.board = this.board.apply(move);
        this.cursor = move.dest();
    }
}