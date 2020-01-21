import * as React from "react"
import {Tab, TabList, TabPanel, Tabs} from 'react-tabs'
import {ColorsContainer} from '../../../color/ColorsContainer'
import {inDev} from '../../../common/Analytics'
import {useDisplaySize} from "../../../common/ViewSizeContext"
import {CycleContainer} from '../cycle/CycleContainer'
import {TestTracking} from '../test/TestTracking'
import {Help} from './Help'
import './Main.css'

export const Main = () => {
    const viewSize = useDisplaySize()
    return (
        <div className="App">
            <Tabs>
                <TabList>
                    <Tab>Play</Tab>
                    <Tab>Controls</Tab>
                    <Tab>Colors</Tab>
                    { inDev() && <Tab>Track</Tab> }
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
                { inDev() &&
                    <TabPanel>
                        <TestTracking/>
                    </TabPanel>
                }
            </Tabs>
        </div>
    )
}
