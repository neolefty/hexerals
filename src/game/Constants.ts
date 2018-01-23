import { Board } from './Board';
import { HexCoord } from './Hex';
import { BoardState } from './BoardContainer';

export const MOVE_PLAYER = 'MOVE_PLAYER';
export type MOVE_PLAYER = typeof MOVE_PLAYER;

export const PLACE_CURSOR = 'PLACE_CURSOR';
export type PLACE_CURSOR = typeof PLACE_CURSOR;

export const INITIAL_WIDTH = 36; // 70;
export const INITIAL_HEIGHT = 27; // 50;
export const INITIAL_POP = 300;

export const INITIAL_STATE: BoardState = {
    board: Board.constructRectangular(INITIAL_WIDTH, INITIAL_HEIGHT, INITIAL_POP),
    cursor: HexCoord.NONE,
};