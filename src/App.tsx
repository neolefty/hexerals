import * as React from 'react';
import './App.css';
import {BoardContainer} from './game/BoardContainer';

// const PerfContainer = connect(mapStateToPerf, mapDispatchToPerf)(
//     PerfTest
// )

class App extends React.Component {
    render() {
        return (
            <div className="App">
                <BoardContainer />
                {/*<PerfTest />*/}
            </div>
        );
    }
}

export default App;
