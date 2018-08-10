import {Map} from 'immutable';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';

import {HexCoord} from './Hex';
import {Board, Player, PLAYERS} from './Board';
import {
    movePlayerAction, placeCursorAction, newGameAction, } from './BoardReducer';
import {BoardView} from './BoardView';
import {AppState} from '../App';
import Dimension from '../Dimension';
import {BoardState} from './BoardState';
import {DriftColor} from '../color/DriftColor';
import {ColorPodge} from '../color/ColorPodge';

export interface LocalGameProps {
    displaySize: Dimension;
}

// TODO stop updating if colors stabilize
const playerColors = (colors: ColorPodge): Map<Player, DriftColor> => {
    const im: Map<Player, DriftColor> = Map();
    const result = im.asMutable();
    // console.log(`podge = ${colors} -- ${colors.driftColors}`);
    colors.driftColors.forEach(
        (value: DriftColor, key: number) => {
            // console.log(`   - ${key} -- ${PLAYERS.get(key)} -- ${value.cie}`);
            result.set(PLAYERS.get(key), value);
        }
    );
    return result.asImmutable();
};

const mapStateToBoardViewProps = (
    state: AppState, ownProps: LocalGameProps
) => ({
    ...state.cycle.localGame as BoardState,  // assertion that it's not undefined
    displaySize: ownProps.displaySize,
    colors: playerColors(state.colors.colors),
    // colors: state.colors.colors.driftColors,
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
