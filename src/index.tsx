import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {combineReducers, createStore} from 'redux';
import App, {AppState} from './App';
import {GameReducer} from './game/BoardContainer';
import registerServiceWorker from './registerServiceWorker';
import './index.css';

/* eslint-disable no-underscore-dangle */
const store = createStore<AppState>(
    combineReducers({
        game: GameReducer,
        /* perf: PerfReducer,*/
    }),
    // preloadedState,
    typeof window !== undefined
    /* tslint:disable:no-any */
        && (window as any).__REDUX_DEVTOOLS_EXTENSION__
        && (window as any).__REDUX_DEVTOOLS_EXTENSION__()
    /* tslint:enable */
);
/* eslint-enable */

// const store = createStore<AppState>(GameReducer);
// const boardStore = createStore<AppState>(GameReducer);
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
