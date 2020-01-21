import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {Provider} from 'react-redux'
import {combineReducers, createStore} from 'redux'
import {ColorsReducer} from "../../../color/ColorsReducer"

import {CartPair} from "../../../common/CartPair"
import {DisplaySizeProvider} from "../../../common/ViewSizeContext"
import {changeLocalOptionAction, CycleReducer, openLocalGameAction,} from '../../model/cycle/CycleReducer'
import {CycleContainer} from '../cycle/CycleContainer'

it('renders without crashing', () => {
    const store = createStore(
        combineReducers({
            colors: ColorsReducer,
            cycle: CycleReducer,
        }),
        // {
        //     cycle: INITIAL_CYCLE_STATE,
        // },
    )
    const div = document.createElement('div')
    const size = {size: new CartPair(1200, 700) }

    // render it without a game
    ReactDOM.render(
        <Provider store={store}>
            <DisplaySizeProvider {...size}>
                <CycleContainer/>
            </DisplaySizeProvider>
        </Provider>,
        div)

    // render it with a game
    store.dispatch(changeLocalOptionAction('mountainPercent', 0))
    store.dispatch(openLocalGameAction())
    ReactDOM.render(
        <Provider store={store}>
            <DisplaySizeProvider {...size}>
                <CycleContainer/>
            </DisplaySizeProvider>
        </Provider>,
        div)
})

// TODO test whole redux integration with connect (see Main.tsx) & GUI events (see HexBoardView.test.tsx)
