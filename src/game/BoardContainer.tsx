import {connect} from 'react-redux';
import {Dispatch} from 'redux';
import Dimension from '../Dimension';

import {HexCoord} from './Hex';
import {Board} from './Board';
import {
    movePlayerAction, newGameAction, placeCursorAction,
    BoardReducerImpl,
} from './BoardActions';
import {GameView} from './BoardView';

export interface BoardContainerState {
    board: Board;
    cursor: HexCoord;
}

export interface BoardContainerProps {
    displaySize: Dimension;
}

const mapStateToBoardViewProps = (
    state: BoardContainerState
) => ({
    ...state,
});

const mergeProps = (
    state: BoardContainerState,
    actions: any,
    parentProps: any,
) => ({
    ...state,
    ...actions,
    ...parentProps,
});

const mapDispatchToBoardViewProps = (dispatch: Dispatch<BoardContainerState>) => ({
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
