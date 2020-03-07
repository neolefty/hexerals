import {ColorsReducer, ColorsState, initialColorState} from "../color/ColorsReducer"
import {GenericAction} from "../common/GenericAction"
import {CycleReducer, initialCycleState} from "../game/model/cycle/CycleReducer"
import {CycleState} from "../game/model/cycle/CycleState"

export interface MainState {
    colors: ColorsState
    cycle: CycleState
}

export type MainDispatch = (action: GenericAction) => void

export const MainReducer = (state: MainState, action: GenericAction) => {
    return Object.freeze({
        colors: Object.freeze(ColorsReducer(state.colors, action)),
        cycle: Object.freeze(CycleReducer(state.cycle, action)),
    })
}

export const initialMainState = (): MainState => ({
    colors: initialColorState(),
    cycle: initialCycleState(),
})
