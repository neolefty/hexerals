import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {combineReducers, createStore} from 'redux';
import App, {AppState} from './App';
import {GameReducer} from './game/BoardContainer';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import {ColorsReducer} from './color/ColorsContainer';

/* eslint-disable no-underscore-dangle */
const store = createStore<AppState>(
    combineReducers({
        game: GameReducer,
        colors: ColorsReducer,
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

ReactDOM.render(
    <div>
        <Provider store={store}>
            <App/>
        </Provider>
    </div>,
    document.getElementById('root') as HTMLElement
);
registerServiceWorker();
