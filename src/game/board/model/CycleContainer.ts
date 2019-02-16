import {Dispatch} from 'redux';
import {connect} from 'react-redux';
import {CycleView} from '../view/CycleView';
import {CartPair} from '../../../common/CartPair';
import {
    changeLocalOptionAction, closeGameAction, CycleAction, openLocalGameAction,
} from './CycleReducer';
import {AppState} from '../../../common/App';
import {LocalGameOptions} from '../view/LocalGameOptions';

export interface CycleContainerProps {
    displaySize: CartPair;
}

const mapStateToCycleViewProps =
    (state: AppState, ownProps: CycleContainerProps) => ({
        displaySize: ownProps.displaySize,
        ...state.cycle,
    });

const mapDispatchToCycleViewProps = (dispatch: Dispatch<CycleAction>) => ({
    onOpenLocalGame: () => dispatch(openLocalGameAction()),
    onCloseGame: () => dispatch(closeGameAction()),
    onChangeLocalOption: (name: keyof LocalGameOptions, n: number) =>
        dispatch(changeLocalOptionAction(name, n)),
});

export const CycleContainer = connect(
    mapStateToCycleViewProps, mapDispatchToCycleViewProps
)(
    CycleView
);