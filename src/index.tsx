import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import App from './App';
import { BoardState, BoardReducer } from './game/BoardContainer';
import { PerfState, PerfReducer, PerfContainer } from './game/PerfTest';
import registerServiceWorker from './registerServiceWorker';
import './index.css';

const boardStore = createStore<BoardState>(BoardReducer);
const perfStore = createStore<PerfState>(PerfReducer);

ReactDOM.render(
    <div>
        <Provider store={boardStore}>
            <App />
        </Provider>
        <Provider store={perfStore}>
            <PerfContainer />
        </Provider>
    </div>,
    document.getElementById('root') as HTMLElement
);
registerServiceWorker();
