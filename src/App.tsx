import * as React from 'react';
import './App.css';
import {MIN_HEIGHT} from './game/BoardConstants';
import Dimension from './Dimension';
import {ColorsContainer, ColorsState} from './color/ColorsContainer';
import {CycleState} from './cycle/CycleState';
import {CycleContainer} from './cycle/CycleContainer';
import {MIN_WIDTH} from './game/BoardConstants';

export interface GenericAction {
    type: string;
}

export interface AppProps {}

export interface AppState {
    colors: ColorsState;
    cycle: CycleState;

    // displaySize is only needed here so that setState in updateDimensions()
    // will trigger rendering of children
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
                <CycleContainer
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
