import * as assert from 'assert';
import {connect, Dispatch} from 'react-redux';
import {BoardAction, MovePlayer, movePlayerAction, PlaceCursor, placeCursorAction} from './BoardActions';
import {Board, Move} from './Board';
import {BoardView} from './BoardView';
import {INITIAL_STATE, MOVE_PLAYER, PLACE_CURSOR} from './Constants';
import {HexCoord} from './Hex';

export interface BoardState {
    board: Board;
    cursor: HexCoord;
}

const mapStateToBoardProps = (state: BoardState) => ({
    board: state.board,
    cursor: state.cursor,
});

const mapDispatchToBoardProps = (dispatch: Dispatch<BoardState>) => ({
    onMovePlayer: (delta: HexCoord) => {
        dispatch(movePlayerAction(delta, true));
    },
    onPlaceCursor: (position: HexCoord) => {
        dispatch(placeCursorAction(position));
    },
});

// TODO add types -- connect<A,B,C> -- for example, cmd-B on connect or see https://spin.atomicobject.com/2017/04/20/typesafe-container-components/
export const BoardContainer = connect(mapStateToBoardProps, mapDispatchToBoardProps)(
    BoardView
);

// export function boardReducer(state: BoardState, action: BoardAction): BoardState {
//     switch(action.type) {
//         case MOVE_PLAYER:
//             if (action instanceof MovePlayer)
//                 return { ...state, }
//     }
// }

export function BoardReducer(
    state: BoardState = INITIAL_STATE, action: BoardAction
): BoardState {
    // TODO start with blank board?
    // TODO create "Start Game" action & reducers etc
    if (isPlaceCursor(action))
        state = placeCursorReducer(state, action);
    if (isMovePlayer(action))
        state = movePlayerReducer(state, action);
    return state;
}

function isMovePlayer(action: BoardAction): action is MovePlayer {
    return (action.type === MOVE_PLAYER);
}

function isPlaceCursor(action: BoardAction): action is PlaceCursor {
    return (action.type === PLACE_CURSOR);
}

export function placeCursorReducer(state: BoardState, action: PlaceCursor): BoardState {
    assert(state.board.inBounds(action.position));
    return {
        ...state,
        cursor: action.position,
    };
}

export function movePlayerReducer(state: BoardState, action: MovePlayer): BoardState {
    // TODO write tests
    const move = new Move(state.cursor, action.delta);
    assert(state.board.inBounds(move.dest));
    return {
        ...state,
        cursor: (action.alsoCursor ? move.dest : state.cursor),
        board: state.board.apply(move),
    };
}