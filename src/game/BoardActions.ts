import * as assert from 'assert';
import Dimension from '../Dimension';
import {Board, Move} from './Board';
import {BoardContainerState} from './BoardContainer';
import {INITIAL_STATE} from './Constants';
import {HexCoord} from './Hex';

// derived from https://github.com/Microsoft/TypeScript-React-Starter#typescript-react-starter
// TODO: try https://www.npmjs.com/package/redux-actions
// TODO: figure out immutable approach too, maybe with immutable.js

export interface GenericAction {
    type: string;
}

export type GameAction = NewGame | MovePlayer | PlaceCursor | ChangeDisplaySize;

export function BoardReducerImpl(
    state: BoardContainerState = INITIAL_STATE, action: GameAction
): BoardContainerState {
    if (isNewGame(action))
        state = newGameReducer(state, action);
    if (isPlaceCursor(action))
        state = placeCursorReducer(state, action);
    if (isMovePlayer(action))
        state = movePlayerReducer(state, action);
    if (isChangeDisplaySize(action))
        state = changeDisplaySizeReducer(state, action);
    return state;
}

const NEW_GAME = 'NEW_GAME';
type NEW_GAME = typeof NEW_GAME;
interface NewGame extends GenericAction {
    type: NEW_GAME;
    board: Board;
}
function isNewGame(action: GameAction): action is NewGame {
    return (action.type === NEW_GAME);
}
export function newGameAction(board: Board): NewGame {
    return {
        type: NEW_GAME,
        board: board,
    };
}
function newGameReducer(state: BoardContainerState, action: NewGame): BoardContainerState {
    return {
        ...state,
        cursor: HexCoord.NONE,
        board: action.board,
    };
}

const CHANGE_DISPLAY_SIZE = 'CHANGE_DISPLAY_SIZE';
type CHANGE_DISPLAY_SIZE = typeof CHANGE_DISPLAY_SIZE;
interface ChangeDisplaySize extends GenericAction {
    type: CHANGE_DISPLAY_SIZE;
    dim: Dimension;
}
function isChangeDisplaySize(action: GameAction): action is ChangeDisplaySize {
    return (action.type === CHANGE_DISPLAY_SIZE);
}
export function changeDisplaySizeAction(dim: Dimension): ChangeDisplaySize {
    return {
        type: CHANGE_DISPLAY_SIZE,
        dim: dim,
    };
}
function changeDisplaySizeReducer(
    state: BoardContainerState, action: ChangeDisplaySize
): BoardContainerState {
    return {
        ...state,
        displaySize: action.dim,
    };
}

const MOVE_PLAYER = 'MOVE_PLAYER';
type MOVE_PLAYER = typeof MOVE_PLAYER;
interface MovePlayer extends GenericAction {
    type: MOVE_PLAYER;
    delta: HexCoord;
    alsoCursor: boolean; // should the cursor move at the end as well?
}
function isMovePlayer(action: GameAction): action is MovePlayer {
    return (action.type === MOVE_PLAYER);
}
export function movePlayerAction(
    delta: HexCoord, alsoCursor: boolean = true
): MovePlayer {
    return {
        type: MOVE_PLAYER,
        delta: delta,
        alsoCursor: alsoCursor,
    };
}
function movePlayerReducer(state: BoardContainerState, action: MovePlayer): BoardContainerState {
    const move = new Move(state.cursor, action.delta);
    assert(state.board.inBounds(move.dest));
    return {
        ...state,
        cursor: (action.alsoCursor ? move.dest : state.cursor),
        board: state.board.apply(move),
    };
}

const PLACE_CURSOR = 'PLACE_CURSOR';
type PLACE_CURSOR = typeof PLACE_CURSOR;
interface PlaceCursor extends GenericAction {
    type: PLACE_CURSOR;
    position: HexCoord;
}
function isPlaceCursor(action: GameAction): action is PlaceCursor {
    return (action.type === PLACE_CURSOR);
}
export function placeCursorAction(position: HexCoord): PlaceCursor {
    return {
        type: PLACE_CURSOR,
        position: position,
    };
}
function placeCursorReducer(state: BoardContainerState, action: PlaceCursor): BoardContainerState {
    assert(state.board.inBounds(action.position));
    return {
        ...state,
        cursor: action.position,
    };
}
