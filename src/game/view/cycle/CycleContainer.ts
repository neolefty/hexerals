import {Dispatch} from 'redux'
import {connect} from 'react-redux'

import {
    CycleAction, changeLocalOptionAction, openLocalGameAction,
} from '../../model/cycle/CycleReducer'
import {CartPair} from '../../../common/CartPair'
import {CycleState} from "../../model/cycle/CycleState"
import {AppState} from '../app/App'
import {CycleView, CycleViewActions} from './CycleView'
import {LocalGameOptions} from '../../model/board/LocalGameOptions'

export interface CycleContainerProps {
    displaySize: CartPair
}

const mapStateToCycleViewProps = (state: AppState): CycleState => state.cycle

const mapDispatchToCycleViewProps = (dispatch: Dispatch<CycleAction>): CycleViewActions => ({
    onOpenLocalGame: () => dispatch(openLocalGameAction()),
    onChangeLocalOption: (name: keyof LocalGameOptions, n: number) =>
        dispatch(changeLocalOptionAction(name, n)),
})

export const CycleContainer = connect(
    mapStateToCycleViewProps, mapDispatchToCycleViewProps
)(
    CycleView
)