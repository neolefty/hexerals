import {default as React, useReducer} from "react"
import {initialColorState} from "../color/ColorsReducer"
import {CartPair} from "../common/CartPair"
import {ProvideDisplaySize} from "../common/ViewSizeContext"
import {DEFAULT_CYCLE_STATE} from "../game/model/cycle/CycleState"
import {CycleView} from "../game/view/cycle/CycleView"
import {MainReducer, MainState} from "./MainReducer"
import {ProvideMainDispatch, ProvideMainState} from "./MainStateContext"

const DEFAULT_STATE: MainState = {
    cycle: DEFAULT_CYCLE_STATE,
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
        <ProvideMainDispatch dispatch={dispatch}>
            <ProvideMainState state={newState}>
                <ProvideDisplaySize {...size}>
                    <CycleView/>
                </ProvideDisplaySize>
            </ProvideMainState>
        </ProvideMainDispatch>
    )
}
