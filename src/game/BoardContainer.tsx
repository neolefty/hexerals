import {connect} from 'react-redux';
import {Dispatch} from 'redux';

import {HexCoord} from './Hex';
import {Board} from './Board';
import {
    movePlayerAction, newGameAction, placeCursorAction,
    BoardReducerImpl,
} from './BoardActions';
import {GameView} from './BoardView';
import {AppState} from '../App';
import Dimension from "../Dimension";

export interface GameState {
    board: Board;
    cursor: HexCoord;
}

export interface GameContainerProps {
    displaySize: Dimension;
}

const mapStateToBoardViewProps = (
    state: AppState, ownProps: GameContainerProps
) => ({
    ...state.game,
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

export const GameContainer = connect(
    mapStateToBoardViewProps, mapDispatchToBoardViewProps
)(
    GameView
);
