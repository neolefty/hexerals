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

// TODO stop updating if colors stabilize
/*
const playerColors = (colors: ColorsState): Map<Player, CieColor> => {
    const im: Map<Player, CieColor> = Map();
    const result = im.asMutable();
    colors.colors.driftColors.forEach(
        (value: DriftColor, key: number) =>
            result.set(PLAYERS[key], value.cie)
    );
    return result.asImmutable();
};
*/

const mapStateToBoardViewProps = (
    state: AppState, ownProps: LocalGameProps
) => ({
    ...state.cycle.localGame as BoardState,  // assertion that it's not undefined
    displaySize: ownProps.displaySize,
    // colors: playerColors(state.colors),
    colors: state.colors.colors.driftColors,
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
