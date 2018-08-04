import {Dispatch} from 'redux';
import {connect} from 'react-redux';
import {CycleView} from './CycleView';
import Dimension from '../Dimension';
import {changeNumPlayersAction, closeGameAction, openLocalGameAction} from './CycleReducer';
import {AppState} from '../App';
import {CycleState} from './CycleState';

export interface CycleContainerProps {
    displaySize: Dimension;
}

const mapStateToCycleViewProps =
    (state: AppState, ownProps: CycleContainerProps) => ({
        displaySize: ownProps.displaySize,
        ...state.cycle,
    });

const mapDispatchToCycleViewProps = (dispatch: Dispatch<CycleState>) => ({
    onOpenLocalGame: () => dispatch(openLocalGameAction()),
    onCloseGame: () => dispatch(closeGameAction()),
    onChangeNumPlayers: (n: number) => dispatch(changeNumPlayersAction(n)),
});

export const CycleContainer = connect(
    mapStateToCycleViewProps, mapDispatchToCycleViewProps
)(
    CycleView
);