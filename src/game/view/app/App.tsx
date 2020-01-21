import React from "react"
import {Provider} from "react-redux"
import {combineReducers, createStore} from "redux"
import {ColorsReducer, ColorsState} from "../../../color/ColorsReducer"
import {isIOS} from "../../../common/BrowserUtil"
import {CartPair} from "../../../common/CartPair"
import {useWindowSize} from "../../../common/HookWindowSize"
import {DisplaySizeProvider} from "../../../common/ViewSizeContext"
import {CycleReducer} from "../../model/cycle/CycleReducer"
import {CycleState} from "../../model/cycle/CycleState"
import {Main} from "./Main"

/* eslint-disable no-underscore-dangle */
const store = createStore(
    combineReducers({
        colors: ColorsReducer,
        cycle: CycleReducer,
        /* perf: PerfReducer,*/
    }),
    // preloadedState,
    typeof window !== undefined
    /* tslint:disable:no-any */
    && (window as any).__REDUX_DEVTOOLS_EXTENSION__
    && (window as any).__REDUX_DEVTOOLS_EXTENSION__()
    /* tslint:enable */
)
/* eslint-enable */

const MIN_WIDTH = 300
const MIN_HEIGHT = 300
const MIN_SIZE = new CartPair(MIN_WIDTH, MIN_HEIGHT)

export interface AppState {
    colors: ColorsState
    cycle: CycleState
}

export const App = () => {
    const rawWinSize = useWindowSize(MIN_SIZE)
    const viewSize = new CartPair(
        Math.max(rawWinSize.x, MIN_WIDTH) - (isIOS() ? 48 : 0), // avoid forward & back gesture areas in iOS
        Math.max(window.innerHeight * 0.96 - 30, MIN_HEIGHT)
    )

    return (
        <DisplaySizeProvider size={viewSize}>
            <Provider store={store}>
                <Main/>
            </Provider>
        </DisplaySizeProvider>
    )
}
