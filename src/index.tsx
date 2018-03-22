import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
// import {combineReducers, createStore} from 'redux';
import {createStore} from 'redux';
import App from './App';
import {BoardContainerState, GameReducer} from './game/BoardContainer';
// import {PerfState, PerfReducer, PerfContainer} from './game/PerfTest';
import registerServiceWorker from './registerServiceWorker';
import './index.css';

// interface IndexState {
//     game: BoardContainerState,
//     perf: PerfState,
// }
//
// const store = createStore<IndexState>(combineReducers({
//     game: GameReducer,
//     perf: PerfReducer,
// }));
const store = createStore<BoardContainerState>(GameReducer);
// const boardStore = createStore<BoardContainerState>(GameReducer);
// const perfStore = createStore<PerfState>(PerfReducer);

ReactDOM.render(
    <div>
        <Provider store={store}>
            <App/>
            {/*<PerfContainer/>*/}
        </Provider>
    </div>,
    document.getElementById('root') as HTMLElement
);
registerServiceWorker();
