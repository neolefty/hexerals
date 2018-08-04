import {connect} from 'react-redux';
import {Dispatch} from 'redux';

import {HexCoord} from './Hex';
import {Board} from './Board';
import {
    movePlayerAction, placeCursorAction, newGameAction, } from './BoardReducer';
import {BoardView} from './BoardView';
import {AppState} from '../App';
import Dimension from '../Dimension';
import {BoardState} from './BoardState';

export interface LocalGameProps {
    displaySize: Dimension;
}

const mapStateToBoardViewProps = (
    state: AppState, ownProps: LocalGameProps
) => ({
    ...state.cycle.localGame as BoardState,  // assertion that it's not undefined
    displaySize: ownProps.displaySize,
});

const mapDispatchToBoardViewProps = (dispatch: Dispatch<BoardState>) => ({
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

export const LocalGameContainer = connect(
    mapStateToBoardViewProps, mapDispatchToBoardViewProps
)(
    BoardView
);
