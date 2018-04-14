import * as assert from 'assert';
import {Board, Move} from './Board';
import {INITIAL_GAME_STATE} from './BoardConstants';
import {HexCoord} from './Hex';
import {GameState} from './BoardContainer';
import {GenericAction} from '../App';

// derived from https://github.com/Microsoft/TypeScript-React-Starter#typescript-react-starter
// TODO: try https://www.npmjs.com/package/redux-actions
// TODO: figure out immutable approach too, maybe with immutable.js

export type GameAction = NewGame | MovePlayer | PlaceCursor;

export function BoardReducerImpl(
    state: GameState = INITIAL_GAME_STATE, action: GameAction
): GameState {
    if (isNewGame(action))
        state = newGameReducer(state, action);
    if (isPlaceCursor(action))
        state = placeCursorReducer(state, action);
    if (isMovePlayer(action))
        state = movePlayerReducer(state, action);
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
function newGameReducer(state: GameState, action: NewGame): GameState {
    return {
        ...state,
        cursor: HexCoord.NONE,
        board: action.board,
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
function movePlayerReducer(state: GameState, action: MovePlayer): GameState {
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
function placeCursorReducer(state: GameState, action: PlaceCursor): GameState {
    assert(state.board.inBounds(action.position));
    return {
        ...state,
        cursor: action.position,
    };
}
