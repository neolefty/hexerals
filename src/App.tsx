import * as React from 'react';
import './App.css';
import {BoardContainer} from './game/BoardContainer';
import {MIN_HEIGHT, MIN_WIDTH} from './game/Constants';

// const PerfContainer = connect(mapStateToPerf, mapDispatchToPerf)(
//     PerfTest
// )

class App extends React.Component {
    private dimensionListener = this.updateDimensions.bind(this);

    updateDimensions() {
        const updateWidth  = Math.max(window.innerWidth - 100, MIN_WIDTH);
        let updateHeight = Math.max(window.innerHeight - 25, MIN_HEIGHT);
        this.setState({ width: updateWidth, height: updateHeight });
    }

    componentDidMount(): void {
        window.addEventListener('resize', this.dimensionListener);
    }

    componentWillUnmount(): void {
        window.removeEventListener('resize', this.dimensionListener);
    }

    render() {
        return (
            <div className="App">
                <BoardContainer />
            </div>
        );
    }
}

export default App;
