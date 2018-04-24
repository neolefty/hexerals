import {Board, PLAYABLE_PLAYERS, RandomArranger} from './Board';
import {GameState} from './BoardContainer';
import {HexCoord} from './Hex';

export const INITIAL_WIDTH = 7;
export const INITIAL_HEIGHT = 17;
export const INITIAL_POP = 120;

export const MIN_WIDTH = 420;
export const MIN_HEIGHT = 120;

export const INITIAL_GAME_STATE: GameState = {
    board: Board.constructRectangular(
        INITIAL_WIDTH,
        INITIAL_HEIGHT,
        new RandomArranger(INITIAL_POP, PLAYABLE_PLAYERS),
    ),
    cursor: HexCoord.NONE,
};