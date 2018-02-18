import { Board } from './Board';
import { HexCoord } from './Hex';
import { BoardState } from './BoardContainer';

export const MOVE_PLAYER = 'MOVE_PLAYER';
export type MOVE_PLAYER = typeof MOVE_PLAYER;

export const PLACE_CURSOR = 'PLACE_CURSOR';
export type PLACE_CURSOR = typeof PLACE_CURSOR;

export const INITIAL_WIDTH = 7;
export const INITIAL_HEIGHT = 37;
export const INITIAL_POP = 120;

export const INITIAL_STATE: BoardState = {
    board: Board.constructRectangular(INITIAL_WIDTH, INITIAL_HEIGHT, INITIAL_POP),
    cursor: HexCoord.NONE,
};