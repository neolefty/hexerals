import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import App from './App';
import { BoardContainerState, GameReducer } from './game/BoardContainer';
import { PerfState, PerfReducer, PerfContainer } from './game/PerfTest';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import Dimension from './Dimension';

const boardStore = createStore<BoardContainerState>(GameReducer);
const perfStore = createStore<PerfState>(PerfReducer);

ReactDOM.render(
    <div>
        <Provider store={boardStore}>
            <App
                displaySize={new Dimension(1200, 800)}
            />
        </Provider>
        <Provider store={perfStore}>
            <PerfContainer />
        </Provider>
    </div>,
    document.getElementById('root') as HTMLElement
);
registerServiceWorker();
