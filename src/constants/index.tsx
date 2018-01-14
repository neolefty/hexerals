import {HexCoord} from '../game/Hex';
import {HexBoard} from '../game/HexBoard';
import {StoreState} from '../types';

export const MOVE_PLAYER = 'MOVE_PLAYER';
export type MOVE_PLAYER = typeof MOVE_PLAYER;

export const PLACE_CURSOR = 'PLACE_CURSOR';
export type PLACE_CURSOR = typeof PLACE_CURSOR;

export const INITIAL_WIDTH = 7;
export const INITIAL_HEIGHT = 5;
export const INITIAL_POP = 30;

export const INITIAL_STATE: StoreState = {
    board: HexBoard.constructRectangular(INITIAL_WIDTH, INITIAL_HEIGHT, INITIAL_POP),
    cursor: HexCoord.NONE,
};