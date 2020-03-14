import {default as React, useReducer} from "react"
import {initialColorState} from "../../../color/ColorsReducer"
import {CartPair} from "../../../common/CartPair"
import {DisplaySizeProvider} from "../../../common/ViewSizeContext"
import {MainReducer, MainState} from "../../../main/MainReducer"
import {WithMainDispatch, WithMainState} from "../../../main/MainStateContext"
import {INITIAL_CYCLE_STATE} from "../../model/cycle/CycleReducer"
import {CycleContainer} from "../cycle/CycleContainer"

const DEFAULT_STATE: MainState = {
    cycle: INITIAL_CYCLE_STATE,
    colors: initialColorState(),
}
interface MiniProps {
    init?: (state: MainState) => MainState
}

export const Mini = (props: MiniProps) => {
    const [state, dispatch] = useReducer(MainReducer, DEFAULT_STATE)
    const newState = props.init ? props.init(state) : state
    const size = {size: new CartPair(1200, 700)}
    return (
        <WithMainDispatch dispatch={dispatch}>
            <WithMainState state={newState}>
                <DisplaySizeProvider {...size}>
                    <CycleContainer/>
                </DisplaySizeProvider>
            </WithMainState>
        </WithMainDispatch>
    )
}
