import * as React from 'react';
import './App.css';
import {BoardContainer} from './game/BoardContainer';

// const PerfContainer = connect(mapStateToPerf, mapDispatchToPerf)(
//     PerfTest
// )

class App extends React.Component {
    updateDimensions() {

        if(window.innerWidth < 500) {
            this.setState({ width: 450, height: 102 });
        } else {
            let update_width  = window.innerWidth-100;
            let update_height = Math.round(update_width/4.4);
            this.setState({ width: update_width, height: update_height });
        }
    }

    componentDidMount(): void {
        window.addEventListener("resize", this.updateDimensions.bind(this));
    }

    componentWillUnmount(): void {
        window.removeEventListener(this.updateDimensions.bind(this));
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
