import * as React from 'react';
import './App.css';
import {BoardContainer} from './game/BoardContainer';

// const PerfContainer = connect(mapStateToPerf, mapDispatchToPerf)(
//     PerfTest
// )

class App extends React.Component {
    private dimensionListener = this.updateDimensions.bind(this);

    updateDimensions() {
        if (window.innerWidth < 500) {
            this.setState({ width: 450, height: 102 });
        } else {
            let updateWidth  = window.innerWidth - 100;
            let updateHeight = Math.round(updateWidth / 4.4);
            this.setState({ width: updateWidth, height: updateHeight });
        }
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
                {/*<PerfTest />*/}
            </div>
        );
    }
}

export default App;
