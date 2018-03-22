import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import App from './App';
import {GameReducer} from './game/BoardContainer';
import {BoardContainerState} from './game/BoardContainer';

it('renders without crashing', () => {
    const store = createStore<BoardContainerState>(GameReducer);
    const div = document.createElement('div');
    ReactDOM.render(
        <Provider store={store}>
            <App />
        </Provider>,
        div);
});

// TODO test whole redux integration with connect (see App.tsx) & GUI events (see GameView.test.tsx)