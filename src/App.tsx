import * as React from 'react';
import './App.css';
import {GameContainer} from './game/BoardContainer';
import {MIN_HEIGHT, MIN_WIDTH} from './game/Constants';
import Dimension from './Dimension';

export interface AppProps {}

export interface AppState {
    displaySize: Dimension;
}

class App extends React.Component<AppProps, AppState> {
    private dimensionListener = this.updateDimensions.bind(this);

    updateDimensions() {
        const newDim = new Dimension(
            Math.max(window.innerWidth, MIN_WIDTH),
            Math.max(window.innerHeight - 25, MIN_HEIGHT)
        );
        this.setState({
            displaySize: newDim
        });
    }

    componentWillMount(): void {
        this.setState({
            displaySize: new Dimension(0, 0)
        });
    }

    componentDidMount(): void {
        window.addEventListener('resize', this.dimensionListener);
        this.updateDimensions();
    }

    componentWillUnmount(): void {
        window.removeEventListener('resize', this.dimensionListener);
    }

    render() {
        return (
            <div className="App">
                <GameContainer
                    displaySize={this.state.displaySize}
                />
            </div>
        );
    }
}

export default App;
