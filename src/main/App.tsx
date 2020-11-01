import React, {useMemo, useReducer} from "react"
import {ColorsState} from "../color/ColorsReducer"
import {isIOS} from "../common/BrowserUtil"
import {CartPair} from "../common/CartPair"
import {useWindowSize} from "../common/HookWindowSize"
import {DisplaySizeProvider} from "../common/ViewSizeContext"
import {CycleState} from "../game/model/cycle/CycleState"
import {Main} from "./Main"
import {initialMainState, MainReducer} from "./MainReducer"
import {WithMainDispatch, WithMainState} from "./MainStateContext"

const MIN_WIDTH = 300
const MIN_HEIGHT = 300
const MIN_SIZE = new CartPair(MIN_WIDTH, MIN_HEIGHT)

export interface AppState {
    colors: ColorsState
    cycle: CycleState
}

export const App = () => {
    const [ state, dispatch ] = useReducer(MainReducer, undefined, initialMainState)
    const rawWinSize = useWindowSize(MIN_SIZE)
    const viewSize = useMemo(() =>
        new CartPair(
            Math.max(rawWinSize.x, MIN_WIDTH) - (isIOS() ? 48 : 0), // avoid forward & back gesture areas in iOS
            Math.max(window.innerHeight, MIN_HEIGHT),
            // Math.max(window.innerHeight * 0.96 - 30, MIN_HEIGHT) // leave room for tabs
        )
    , [rawWinSize])

    return (
        <DisplaySizeProvider size={viewSize}>
            <WithMainDispatch dispatch={dispatch}>
                <WithMainState state={state}>
                    <Main/>
                </WithMainState>
            </WithMainDispatch>
        </DisplaySizeProvider>
    )
}
