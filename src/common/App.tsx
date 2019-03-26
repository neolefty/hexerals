import * as React from 'react'
import {Tab, TabList, TabPanel, Tabs} from 'react-tabs'

import './App.css'
import {CartPair} from './CartPair'
import {ColorsContainer} from '../color/ColorsContainer'
import {ColorsState} from '../color/ColorsReducer';
import {inDev} from './Analytics';
import {CycleState} from '../game/model/cycle/CycleState';
import {CycleContainer} from '../game/model/cycle/CycleContainer';
import {Help} from '../game/view/Help';
import {TestTracking} from '../game/view/TestTracking';

const MIN_WIDTH = 300
const MIN_HEIGHT = 300

export interface GenericAction {
    type: string
}

export interface AppProps {}

export interface AppState {
    colors: ColorsState
    cycle: CycleState

    // displaySize is only needed here so that setState in updateDimensions()
    // will trigger rendering of children
    displaySize: CartPair
}

export interface AppProps {
}

class App extends React.Component<AppProps, AppState> {
    private dimensionListener = this.updateDimensions.bind(this)

    updateDimensions() {
        const dim = new CartPair(
            Math.max(window.innerWidth, MIN_WIDTH),
            Math.max(window.innerHeight * 0.96, MIN_HEIGHT)
        )
        this.setState({
            ...this.state,
            displaySize: dim,
        })
    }

    componentDidMount(): void {
        window.addEventListener('resize', this.dimensionListener)
        this.updateDimensions()
    }

    componentWillUnmount(): void {
        window.removeEventListener('resize', this.dimensionListener)
    }

    render() {
        const displaySize = this.getDisplaySize().plusXY(0, -30)
        return (
            <div className="App">
                <Tabs>
                    <TabList>
                        <Tab>Play</Tab>
                        <Tab>Controls</Tab>
                        <Tab>Colors</Tab>
                        {
                            inDev() ? (<Tab>Track</Tab>) : undefined
                        }
                    </TabList>
                    <TabPanel>
                        <CycleContainer displaySize={displaySize}/>
                    </TabPanel>
                    <TabPanel>
                        <Help displaySize={displaySize}/>
                    </TabPanel>
                    <TabPanel>
                        <ColorsContainer displaySize={displaySize}/>
                    </TabPanel>
                    {
                        inDev() ? (
                            <TabPanel>
                                <TestTracking/>
                            </TabPanel>
                        ) : undefined
                    }
                </Tabs>
            </div>
        )
    }

    private getDisplaySize() {
        return (this.state && this.state.displaySize)
            ? this.state.displaySize
            : new CartPair(MIN_WIDTH, MIN_HEIGHT)
    }
}

export default App
