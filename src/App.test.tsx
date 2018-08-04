import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import Dimension from "./Dimension";
import {CycleReducer, openLocalGameAction} from './cycle/CycleReducer';
import {CycleState} from './cycle/CycleState';
import {CycleContainer} from './cycle/CycleContainer';

it('renders without crashing', () => {
    const store = createStore<CycleState>(CycleReducer);
    const div = document.createElement('div');

    // render it without a game
    ReactDOM.render(
        <Provider store={store}>
            <CycleContainer
                displaySize={new Dimension(100, 100)}
            />
        </Provider>,
        div);

    // render it with a game
    store.dispatch(openLocalGameAction());
    ReactDOM.render(
        <Provider store={store}>
            <CycleContainer
                displaySize={new Dimension(100, 100)}
            />
        </Provider>,
        div);
});

// TODO test whole redux integration with connect (see App.tsx) & GUI events (see BoardView.test.tsx)