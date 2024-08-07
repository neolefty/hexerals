import {Dispatch} from 'redux';
import {connect} from 'react-redux';
import {CycleView} from '../view/CycleView';
import CartPair from '../../../common/CartPair';
import {
    changeLocalOptionAction, closeGameAction, openLocalGameAction,
} from './CycleReducer';
import {AppState} from '../../../common/App';
import {CycleState} from './CycleState';

export interface CycleContainerProps {
    displaySize: CartPair;
}

const mapStateToCycleViewProps =
    (state: AppState, ownProps: CycleContainerProps) => ({
        displaySize: ownProps.displaySize,
        ...state.cycle,
    });

const mapDispatchToCycleViewProps = (dispatch: Dispatch<CycleState>) => ({
    onOpenLocalGame: () => dispatch(openLocalGameAction()),
    onCloseGame: () => dispatch(closeGameAction()),
    onChangeLocalOption: (name: string, n: number) =>
        dispatch(changeLocalOptionAction(name, n)),
});

export const CycleContainer = connect(
    mapStateToCycleViewProps, mapDispatchToCycleViewProps
)(
    CycleView
);