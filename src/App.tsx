import * as React from 'react';
import './App.css';
import {GameContainer, GameState} from './game/BoardContainer';
import {MIN_HEIGHT, MIN_WIDTH} from './game/BoardConstants';
import Dimension from './Dimension';
import {ColorsContainer, ColorsState} from './color/ColorsContainer';

export interface GenericAction {
    type: string;
}

export interface AppProps {}

export interface AppState {
    game: GameState;
    colors: ColorsState;
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
        // console.log(`${dim.toString()} -- ${window.innerWidth} x ${window.innerHeight}`);
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
                <ColorsContainer
                    displaySize={this.getDisplaySize().scale(0.5)}
                />
            </div>
        );
    }

    private getDisplaySize() {
        return (this.state && this.state.displaySize)
            ? this.state.displaySize
            : new Dimension(MIN_WIDTH, MIN_HEIGHT);
    }
}

export default App;
