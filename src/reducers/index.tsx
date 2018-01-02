import { BoardAction, MovePlayer, PlaceCursor } from '../actions';
import { MOVE_PLAYER, PLACE_CURSOR } from '../constants';
import { StoreState } from '../types';
import { Board, Move } from '../game/GameModel';

// export function boardReducer(state: StoreState, action: BoardAction): StoreState {
//     switch(action.type) {
//         case MOVE_PLAYER:
//             if (action instanceof MovePlayer)
//                 return { ...state, }
//     }
// }

export const initialState: StoreState = {
    board: Board.construct(12, 6),
    cursor: NaN,
};

export function baseReducer(state: StoreState = initialState, action: BoardAction): StoreState {
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

export function placeCursorReducer(state: StoreState, action: PlaceCursor): StoreState {
    // TODO write out-of-bounds tests that fail and then fix them
    // if (action.position < 0 || action.position >= state.board.positions.size)
    //     return state;
    // else
        return {
            ...state,
            cursor: action.position,
        };
}

export function movePlayerReducer(state: StoreState, action: MovePlayer): StoreState {
    // TODO write tests
    return {
        ...state,
        cursor: (action.alsoCursor ? state.cursor + action.delta : state.cursor),
        board: state.board.apply(new Move(state.cursor, action.delta)),
    };
}