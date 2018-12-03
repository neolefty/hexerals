import * as React from 'react'
import './App.css'
import {MIN_HEIGHT} from './game/board/BoardConstants'
import Dimension from './Dimension'
import {ColorsContainer, ColorsState} from './color/ColorsContainer'
import {CycleState} from './game/cycle/CycleState'
import {CycleContainer} from './game/cycle/CycleContainer'
import {MIN_WIDTH} from './game/board/BoardConstants'
import {Tab, TabList, TabPanel, Tabs} from 'react-tabs'

export interface GenericAction {
    type: string
}

export interface AppProps {}

export interface AppState {
    colors: ColorsState
    cycle: CycleState

    // displaySize is only needed here so that setState in updateDimensions()
    // will trigger rendering of children
    displaySize: Dimension
}

export interface AppProps {
}

class App extends React.Component<AppProps, AppState> {
    private dimensionListener = this.updateDimensions.bind(this)

    updateDimensions() {
        const dim = new Dimension(
            Math.max(window.innerWidth, MIN_WIDTH),
            Math.max(window.innerHeight - 25, MIN_HEIGHT)
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
        const displaySize = this.getDisplaySize().plus(0, -30)
        return (
            <div className="App">
                <Tabs>
                    <TabList>
                        <Tab>Local Game</Tab>
                        <Tab>Color Wheel</Tab>
                    </TabList>
                    <TabPanel>
                        <CycleContainer displaySize={displaySize}/>
                    </TabPanel>
                    <TabPanel>
                        <ColorsContainer displaySize={displaySize}/>
                    </TabPanel>
                </Tabs>
            </div>
        )
    }

    private getDisplaySize() {
        return (this.state && this.state.displaySize)
            ? this.state.displaySize
            : new Dimension(MIN_WIDTH, MIN_HEIGHT)
    }
}

export default App
