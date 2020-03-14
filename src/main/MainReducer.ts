import {ColorsAction, ColorsReducer, ColorsState, initialColorState, isColorsAction} from "../color/ColorsReducer"
import {AssertNever} from "../common/AssertNever"
import {CycleAction, CycleReducer, initialCycleState, isCycleAction} from "../game/model/cycle/CycleReducer"
import {CycleState} from "../game/model/cycle/CycleState"

export interface MainState {
    colors: ColorsState
    cycle: CycleState
}

export type MainDispatch = (action: MainAction) => void

export type MainAction = CycleAction | ColorsAction

export const MainReducer = (state: MainState, action: MainAction): MainState => {
    if (isColorsAction(action))
        return Object.freeze({
            ...state,
            colors: Object.freeze(ColorsReducer(state.colors, action))
        })
    else if (isCycleAction(action))
        return Object.freeze({
            ...state,
            cycle: Object.freeze(CycleReducer(state.cycle, action)),
        })
    else
        return AssertNever(action)
}

export const initialMainState = (): MainState => ({
    colors: initialColorState(),
    cycle: initialCycleState(),
})
