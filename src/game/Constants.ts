import {Board, PLAYABLE_PLAYERS, RandomArranger} from './Board';
import {BoardContainerState} from './BoardContainer';
import {HexCoord} from './Hex';
import Dimension from '../Dimension';

export const INITIAL_WIDTH = 7;
export const INITIAL_HEIGHT = 17;
export const INITIAL_POP = 120;

export const MIN_WIDTH = 450;
export const MIN_HEIGHT = 120;

export const INITIAL_STATE: BoardContainerState = {
    board: Board.constructRectangular(
        INITIAL_WIDTH,
        INITIAL_HEIGHT,
        new RandomArranger(INITIAL_POP, PLAYABLE_PLAYERS),
    ),
    cursor: HexCoord.NONE,
    displaySize: new Dimension(1000, 600),
};