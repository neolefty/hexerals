import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import {CartPair} from "./CartPair";
import {changeLocalOptionAction, CycleReducer, openLocalGameAction} from '../game/board/model/CycleReducer';
import {CycleState} from '../game/board/model/CycleState';
import {CycleContainer} from '../game/board/model/CycleContainer';

it('renders without crashing', () => {
    const store = createStore<CycleState>(CycleReducer);
    const div = document.createElement('div');

    // render it without a game
    ReactDOM.render(
        <Provider store={store}>
            <CycleContainer
                displaySize={new CartPair(100, 100)}
            />
        </Provider>,
        div);

    // render it with a game
    store.dispatch(changeLocalOptionAction('mountainPercent', 0))
    store.dispatch(openLocalGameAction());
    ReactDOM.render(
        <Provider store={store}>
            <CycleContainer
                displaySize={new CartPair(100, 100)}
            />
        </Provider>,
        div);
});

// TODO test whole redux integration with connect (see App.tsx) & GUI events (see HexBoardView.test.tsx)