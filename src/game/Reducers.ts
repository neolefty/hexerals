import * as assert from 'assert';
import { BoardAction} from './Actions';
import { MovePlayer, PlaceCursor } from './Actions';
import { Move } from './Board';
import { INITIAL_STATE, MOVE_PLAYER, PLACE_CURSOR } from './Constants';
import { StoreState } from './Types';

// export function boardReducer(state: StoreState, action: BoardAction): StoreState {
//     switch(action.type) {
//         case MOVE_PLAYER:
//             if (action instanceof MovePlayer)
//                 return { ...state, }
//     }
// }

export function baseReducer(
    // TODO start with blank board?
    // TODO create "Start Game" action & reducers etc
    state: StoreState = INITIAL_STATE, action: BoardAction
): StoreState {
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
    assert(state.board.inBounds(action.position));
    return {
        ...state,
        cursor: action.position,
    };
}

export function movePlayerReducer(state: StoreState, action: MovePlayer): StoreState {
    // TODO write tests
    const move = new Move(state.cursor, action.delta);
    assert(state.board.inBounds(move.dest));
    return {
        ...state,
        cursor: (action.alsoCursor ? move.dest : state.cursor),
        board: state.board.apply(move),
    };
}
