import {Dispatch} from 'redux';
import {connect} from 'react-redux';
import {CycleView} from '../../view/CycleView';
import {
    changeLocalOptionAction, closeGameAction, CycleAction, openLocalGameAction,
} from './CycleReducer';
import {CartPair} from '../../../common/CartPair';
import {AppState} from '../../../common/App';
import {AnalyticsAction, AnalyticsCategory, AnalyticsLabel, logAnalyticsEvent} from '../../../common/Analytics';
import {LocalGameOptions} from '../../view/LocalGameOptions';

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
    onCloseGame: () =>  {
        // TODO add local game options
        logAnalyticsEvent(AnalyticsAction.end, AnalyticsCategory.local, AnalyticsLabel.quit)
        dispatch(closeGameAction())
    },
    onChangeLocalOption: (name: keyof LocalGameOptions, n: number) =>
        dispatch(changeLocalOptionAction(name, n)),
});

export const CycleContainer = connect(
    mapStateToCycleViewProps, mapDispatchToCycleViewProps
)(
    CycleView
);