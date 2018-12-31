import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {combineReducers, createStore} from 'redux';
import App, {AppState} from './common/App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import {ColorsReducer} from './color/ColorsReducer';
import {CycleReducer} from './game/board/model/CycleReducer';

/* eslint-disable no-underscore-dangle */
const store = createStore<AppState>(
    combineReducers({
        colors: ColorsReducer,
        cycle: CycleReducer,
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
