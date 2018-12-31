import {connect} from 'react-redux'
import {Dispatch} from 'redux'
import {AppState} from '../common/App'
import {ColorsDiv} from './ColorsDiv'
import {
    ColorsActions, ColorsState,
    addColorAction, removeColorAction, divergeAction,
} from './ColorsReducer';

const TICK = 100 // milliseconds

export const ColorsContainer = connect(
    (state: AppState) => ({...state.colors}),
    (dispatch: Dispatch<ColorsState>) => ({
        onAddColor: () => dispatch(addColorAction()),
        onRemoveColor: (x: number) => dispatch(removeColorAction(x)),
        onDiverge: () => dispatch(divergeAction()),
    }),
    /* tslint:disable:no-any */
    (state: ColorsState, actions: ColorsActions, parentProps: any) => ({
        ...state,
        ...actions,
        displaySize: parentProps.displaySize,
        tick: TICK,
    })
    /* tslint:enable */
)(
    ColorsDiv
)
