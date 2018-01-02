import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import App from './App';
import {baseReducer} from './reducers';
import {StoreState} from './types';

it('renders without crashing', () => {
    const store = createStore<StoreState>(baseReducer);
    const div = document.createElement('div');
    ReactDOM.render(
        <Provider store={store}>
            <App />
        </Provider>,
        div);
});

// TODO test whole redux integration with connect (see App.tsx) & GUI events (see BoardView.test.tsx)