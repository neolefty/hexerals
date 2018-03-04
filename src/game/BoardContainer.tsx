import {connect} from 'react-redux';
import {Dispatch} from 'redux';

import {HexCoord} from './Hex';
import {Board} from './Board';
import {
    movePlayerAction, newGameAction, placeCursorAction,
    BoardReducerImpl,
} from './BoardActions';
import {BoardView} from './BoardView';

export interface BoardState {
    board: Board;
    cursor: HexCoord;
}

const mapStateToBoardProps = (state: BoardState) => ({
    board: state.board,
    cursor: state.cursor,
    // TODO move to window resize events
    width: 600,
    height: 1000,
});

const mapDispatchToBoardProps = (dispatch: Dispatch<BoardState>) => ({
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

export const BoardReducer = BoardReducerImpl;

export const BoardContainer = connect(
    mapStateToBoardProps, mapDispatchToBoardProps
)(
    BoardView
);
