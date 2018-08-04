import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import {BoardContainer, GameReducer} from './game/BoardContainer';
import {GameState} from './game/BoardContainer';
import Dimension from "./Dimension";

it('renders without crashing', () => {
    const store = createStore<GameState>(GameReducer);
    const div = document.createElement('div');
    ReactDOM.render(
        <Provider store={store}>
            <BoardContainer
                displaySize={new Dimension(100, 100)}
            />
        </Provider>,
        div);
});

// TODO test whole redux integration with connect (see App.tsx) & GUI events (see BoardView.test.tsx)