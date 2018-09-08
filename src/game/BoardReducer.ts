import * as assert from 'assert';
import {Board, RandomArranger} from './Board';
import {HexCoord} from './Hex';
import {GenericAction} from '../App';
import {BoardState} from './BoardState';
import {INITIAL_HEIGHT, INITIAL_POP, INITIAL_WIDTH} from './BoardConstants';
import {EMPTY_MOVEMENT_QUEUE, HexMove} from './MovementQueue';
import {pickNPlayers, Player, PlayerManager} from './Players';
import {List} from 'immutable';

// derived from https://github.com/Microsoft/TypeScript-React-Starter#typescript-react-starter
// TODO: try https://www.npmjs.com/package/redux-actions
// TODO: figure out immutable approach too, maybe with immutable.js

export type GameAction = NewGame | QueueMove | PlaceCursor | DoMoves;

const INITIAL_PLAYERS = pickNPlayers(0);
export const INITIAL_BOARD_STATE: BoardState = {
    board: Board.constructRectangular(
        INITIAL_WIDTH,
        INITIAL_HEIGHT,
        INITIAL_PLAYERS,
        new RandomArranger(INITIAL_POP, INITIAL_PLAYERS),
    ),
    cursor: HexCoord.NONE,
    players: new PlayerManager(INITIAL_PLAYERS),
    moveQueue: EMPTY_MOVEMENT_QUEUE,
    messages: List([
        // new StatusMessage('foo', 'bar', 'baz'),
        // new StatusMessage('moo', 'mar', 'maz'),
        // new StatusMessage('zoo', 'zar', 'zaz'),
    ]), // empty
};

export function BoardReducer(
    state: BoardState = INITIAL_BOARD_STATE, action: GameAction
): BoardState {
    if (isNewGame(action))
        state = newGameReducer(state, action);
    else if (isPlaceCursor(action))
        state = placeCursorReducer(state, action);
    else if (isQueueMove(action))
        state = queueMoveReducer(state, action);
    else if (isDoMoves(action))
        state = doMovesReducer(state);
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
function newGameReducer(state: BoardState, action: NewGame): BoardState {
    return {
        ...state,
        cursor: HexCoord.NONE,
        board: action.board,
    };
}

// add to the player's movement queue
const QUEUE_MOVE = 'QUEUE_MOVE';
type QUEUE_MOVE = typeof QUEUE_MOVE;
interface QueueMove extends GenericAction {
    type: QUEUE_MOVE;
    source: HexCoord;
    delta: HexCoord;
}
const isQueueMove = (action: GameAction): action is QueueMove =>
    action.type === QUEUE_MOVE;
export const queueMoveAction = (
    source: HexCoord, delta: HexCoord
): QueueMove => ({
    type: QUEUE_MOVE,
    source: source,
    delta: delta,
});
const queueMoveReducer = (state: BoardState, action: QueueMove): BoardState => {
    const move = new HexMove(state.cursor, action.delta);
    if (!state.board.inBounds(move.dest))
        return state;

    const fromSpot = state.board.getSpot(move.source);
    if (fromSpot.owner === Player.Nobody || fromSpot.pop === 1)
        return state;

    return {
        ...state,
        moveQueue: state.moveQueue.add(
            state.board.playerIndex(fromSpot.owner),
            move,
        )
    };
};

// advance one step in the queue of moves for each player
const DO_MOVES = 'DO_MOVES';
type DO_MOVES = typeof DO_MOVES;
interface DoMoves extends GenericAction { type: DO_MOVES; }
const isDoMoves = (action: GameAction): action is DoMoves =>
    action.type === DO_MOVES;
export const doMovesAction = (): DoMoves => ({ type: DO_MOVES });
export const doMovesReducer = (state: BoardState): BoardState => {
    // TODO rotate startPlayerIndex
    const movesAndQ = state.moveQueue.popEach(0, state.board.players.size);
    // console.log(`reducing moves ... ${movesAndQ}`);
    if (movesAndQ) { // undefined if no moves to apply
        const boardAndMessages = state.board.applyMoves(movesAndQ.moves);
        // console.log(`          ... ${boardAndMessages.messages}`);
        return {
            ...state,
            messages: boardAndMessages.addToMessages(state.messages),
            moveQueue: movesAndQ.queue,
            board: boardAndMessages.board,
        }
    }
    else
        return state;
};

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
function placeCursorReducer(state: BoardState, action: PlaceCursor): BoardState {
    assert(state.board.inBounds(action.position));
    return {
        ...state,
        cursor: action.position,
    };
}
