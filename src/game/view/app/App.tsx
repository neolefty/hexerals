import * as React from "react"
import {Tab, TabList, TabPanel, Tabs} from 'react-tabs'
import {ColorsContainer} from '../../../color/ColorsContainer'
import {ColorsState} from '../../../color/ColorsReducer'
import {inDev} from '../../../common/Analytics'
import {isIOS} from '../../../common/BrowserUtil'
import {CartPair} from '../../../common/CartPair'
import {useWindowSize} from "../../../common/HookWindowSize"
import {DisplaySizeProvider} from "../../../common/ViewSizeContext"
import {CycleState} from '../../model/cycle/CycleState'
import {CycleContainer} from '../cycle/CycleContainer'
import {TestTracking} from '../test/TestTracking'
import './App.css'
import {Help} from './Help'

export interface AppState {
    colors: ColorsState
    cycle: CycleState
}

const MIN_WIDTH = 300
const MIN_HEIGHT = 300
const MIN_SIZE = new CartPair(MIN_WIDTH, MIN_HEIGHT)

const App = () => {
    const rawWinSize = useWindowSize(MIN_SIZE)
    const viewSize = new CartPair(
        Math.max(rawWinSize.x, MIN_WIDTH) - (isIOS() ? 48 : 0), // avoid forward & back gesture areas in iOS
        Math.max(window.innerHeight * 0.96 - 30, MIN_HEIGHT)
    )

    return (
        <DisplaySizeProvider size={viewSize}>
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
                        <CycleContainer/>
                    </TabPanel>
                    <TabPanel>
                        <Help displaySize={viewSize}/>
                    </TabPanel>
                    <TabPanel>
                        <ColorsContainer displaySize={viewSize}/>
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
        </DisplaySizeProvider>
    )
}

export default App
