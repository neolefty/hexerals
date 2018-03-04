import {Board, PLAYABLE_PLAYERS, RandomArranger} from './Board';
import {BoardState} from './BoardContainer';
import {HexCoord} from './Hex';

export const INITIAL_WIDTH = 5;
export const INITIAL_HEIGHT = 27;
export const INITIAL_POP = 120;

export const INITIAL_STATE: BoardState = {
    board: Board.constructRectangular(
        INITIAL_WIDTH,
        INITIAL_HEIGHT,
        new RandomArranger(INITIAL_POP, PLAYABLE_PLAYERS)
    ),
    cursor: HexCoord.NONE,
};