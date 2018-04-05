import * as React from 'react';
import './App.css';
import {
    GameState, GameContainer
} from './game/BoardContainer';
import {MIN_HEIGHT, MIN_WIDTH} from './game/Constants';
import Dimension from './Dimension';

export interface AppProps {}

export interface AppState {
    game: GameState;
    displaySize: Dimension;
}

export interface AppProps {
}

class App extends React.Component<AppProps, AppState> {
    private dimensionListener = this.updateDimensions.bind(this);

    updateDimensions() {
        const dim = new Dimension(
            Math.max(window.innerWidth, MIN_WIDTH),
            Math.max(window.innerHeight - 25, MIN_HEIGHT)
        );
        this.setState({
            ...this.state,
            displaySize: dim,
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
                    displaySize={this.getDisplaySize()}
                />
            </div>
        );
    }

    private getDisplaySize() {
        return (this.state && this.state.displaySize)
            ? this.state.displaySize
            : new Dimension(0, 0);
    }
}

export default App;
