import * as React from 'react'
import {Tab, TabList, TabPanel, Tabs} from 'react-tabs'

import './App.css'
import {CartPair} from './CartPair'
import {ColorsContainer} from '../color/ColorsContainer'
import {ColorsState} from '../color/ColorsReducer';
import {CycleState} from '../game/board/model/CycleState'
import {CycleContainer} from '../game/board/model/CycleContainer'
import {Help} from '../game/board/view/Help';
import {TestTracking} from '../game/board/view/TestTracking';

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
        const dev = process.env.NODE_ENV === 'development'
        return (
            <div className="App">
                <Tabs>
                    <TabList>
                        <Tab>Practice</Tab>
                        <Tab>Colors</Tab>
                        <Tab>Controls</Tab>
                        {
                            dev ? (<Tab>Track</Tab>) : undefined
                        }
                    </TabList>
                    <TabPanel>
                        <CycleContainer displaySize={displaySize}/>
                    </TabPanel>
                    <TabPanel>
                        <ColorsContainer displaySize={displaySize}/>
                    </TabPanel>
                    <TabPanel>
                        <Help displaySize={displaySize}/>
                    </TabPanel>
                    {
                        dev ? (
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
