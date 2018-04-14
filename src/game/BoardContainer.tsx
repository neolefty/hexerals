import {connect} from 'react-redux';
import {Dispatch} from 'redux';
import Dimension from '../Dimension';

import {HexCoord} from './Hex';
import {Board} from './Board';
import {
    movePlayerAction, newGameAction, placeCursorAction,
    BoardReducerImpl,
} from './BoardActions';
import {BoardViewActions, GameView} from './BoardView';
import {AppState} from '../App';

export interface GameState {
    board: Board;
    cursor: HexCoord;
}

export interface GameProps {
    displaySize: Dimension;
}

const mapStateToBoardViewProps = (
    state: AppState
) => ({
    ...state.game,
});

// const mergeProps = (
//     state: Object,
//     actions: Object,
//     parentProps: Object,
// ) => Object.assign({}, state, actions, parentProps);
const mergeProps = (
    state: GameState,
    actions: BoardViewActions,
    /* tslint:disable:no-any */
    parentProps: any,
    /* tslint:enable */
) => ({
    ...state,
    ...actions,
    displaySize: parentProps.displaySize,
});

const mapDispatchToBoardViewProps = (dispatch: Dispatch<GameState>) => ({
    onMovePlayer: (delta: HexCoord) => {
        dispatch(movePlayerAction(delta, true));
    },
    onPlaceCursor: (position: HexCoord) => {
        dispatch(placeCursorAction(position));
    },
    onNewGame: (board: Board) => {
        dispatch(newGameAction(board));
    },
});

export const GameReducer = BoardReducerImpl;

export const GameContainer = connect(
    mapStateToBoardViewProps, mapDispatchToBoardViewProps, mergeProps/* , options,*/
)(
    GameView
);
