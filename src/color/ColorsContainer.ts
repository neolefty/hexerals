import {connect} from 'react-redux'
import {Dispatch} from 'redux'
import {AppState} from "../game/view/app/App"

import {ColorsDiv} from './ColorsDiv'
import {
    ColorsActions, ColorsState,
    addColorAction, removeColorAction, divergeAction, ColorsAction,
} from './ColorsReducer';

const TICK = 100 // milliseconds

const mapStateToProps = (state: AppState) => ({...state.colors})

const mapDispatchToProps = (dispatch: Dispatch<ColorsAction>): ColorsActions => ({
    onAddColor: () => dispatch(addColorAction()),
    onRemoveColor: (x: number) => dispatch(removeColorAction(x)),
    onDiverge: () => dispatch(divergeAction()),
})

/* tslint:disable:no-any */
const mergeProps =
    // TODO investigate typing parentProps
    (state: ColorsState, actions: ColorsActions, parentProps: any) => ({
        ...state,
        ...actions,
        displaySize: parentProps.displaySize,
        tick: TICK,
    })
/* tslint:enable */

export const ColorsContainer = connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps,
)(
    ColorsDiv
)
