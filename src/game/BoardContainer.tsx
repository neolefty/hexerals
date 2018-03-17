import {connect} from 'react-redux';
import {Dispatch} from 'redux';
import Dimension from '../Dimension';

import {HexCoord} from './Hex';
import {Board} from './Board';
import {
    movePlayerAction, newGameAction, placeCursorAction,
    BoardReducerImpl, changeDisplaySizeAction,
} from './BoardActions';
import {BoardView} from './BoardView';

export interface BoardContainerState {
    board: Board;
    cursor: HexCoord;
    displaySize: Dimension;
}

const mapStateToBoardProps = (state: BoardContainerState/*, ownProps: BoardViewProps*/) => ({
    board: state.board,
    cursor: state.cursor,
    displaySize: state.displaySize,
});

const mapDispatchToBoardProps = (dispatch: Dispatch<BoardContainerState>) => ({
    onMovePlayer: (delta: HexCoord) => {
        dispatch(movePlayerAction(delta, true));
    },
    onPlaceCursor: (position: HexCoord) => {
        dispatch(placeCursorAction(position));
    },
    onNewGame: (board: Board) => {
        dispatch(newGameAction(board));
    },
    onChangeDisplaySize: (dim: Dimension) => {
        dispatch(changeDisplaySizeAction(dim));
    }
});

export const BoardReducer = BoardReducerImpl;

export const BoardContainer = connect(
    mapStateToBoardProps, mapDispatchToBoardProps/*, mergeProps, options,*/
)(
    BoardView
);
