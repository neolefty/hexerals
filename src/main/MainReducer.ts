import {ColorsReducer, ColorsState} from "../color/ColorsReducer"
import {GenericAction} from "../common/GenericAction"
import {CycleReducer} from "../game/model/cycle/CycleReducer"
import {CycleState} from "../game/model/cycle/CycleState"

export interface MainState {
    colors: ColorsState
    cycle: CycleState
}

export const MainReducer = (state: MainState, action: GenericAction) => {
    return Object.freeze({
        colors: Object.freeze(ColorsReducer(state.colors, action)),
        cycle: Object.freeze(CycleReducer(state.cycle, action)),
    })
}
