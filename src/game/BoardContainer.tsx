import {connect} from 'react-redux';
import {Dispatch} from 'redux';

import {HexCoord} from './Hex';
import {Board} from './Board';
import {
    movePlayerAction, placeCursorAction, newGameAction,
    BoardReducerImpl,
} from './BoardActions';
import {BoardView} from './BoardView';
import {AppState} from '../App';
import Dimension from "../Dimension";

export interface GameState {
    board: Board;
    cursor: HexCoord;
}

export interface BoardContainerProps {
    displaySize: Dimension;
}

const mapStateToBoardViewProps = (
    state: AppState, ownProps: BoardContainerProps
) => ({
    ...state.localGame,
    displaySize: ownProps.displaySize,
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

export const BoardContainer = connect(
    mapStateToBoardViewProps, mapDispatchToBoardViewProps
)(
    BoardView
);
