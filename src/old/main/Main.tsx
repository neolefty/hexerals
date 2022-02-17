import * as React from "react"
import {BrowserRouter, Route, Routes} from "react-router-dom"
import {Tab, TabList, TabPanel, Tabs} from 'react-tabs'
import {ColorsContainer} from "../../color/ColorsContainer"
import {inDev} from "../../common/Environment"
import {useDisplaySize} from "../../common/ViewSizeContext"
import {CycleView, LocalGameOptionsPage} from "../../game/view/cycle/CycleView"
import {TestTracking} from "../../game/view/test/TestTracking"
import {TutorialContainer} from "../../tutorial/TutorialContainer"
import {Help} from './Help'
import './Main.css'
import {MainMenu} from "./MainMenu"

export const OldMain = () => {
    const viewSize = useDisplaySize()
    return (
        <div className="App">
            <Tabs>
                <TabList>
                    <Tab>Play</Tab>
                    <Tab>Controls</Tab>
                    <Tab>Colors</Tab>
                    { inDev() && <Tab>Track</Tab> }
                    { inDev() && <Tab>Tutorial</Tab> }
                </TabList>
                <TabPanel>
                    <CycleView/>
                </TabPanel>
                <TabPanel>
                    <Help displaySize={viewSize}/>
                </TabPanel>
                <TabPanel>
                    <ColorsContainer/>
                </TabPanel>
                { inDev() &&
                    <TabPanel>
                        <TestTracking/>
                    </TabPanel>
                }
                { inDev() &&
                    <TabPanel>
                        <TutorialContainer/>
                    </TabPanel>
                }
            </Tabs>
        </div>
    )
}

export const ROUTE_ABOUT = 'about'
export const ROUTE_TRACK = 'track'
export const ROUTE_TUTORIAL = 'tutorial'
export const ROUTE_COLORS = 'colors'
export const ROUTE_MENU = 'menu'
export const ROUTE_LOCAL_GAME = 'local'
export const ROUTE_LOCAL_OPTIONS = ''

export const Main = () => {
    const viewSize = useDisplaySize()
    return (
        <BrowserRouter>
            <Routes>
                <Route path={`/${ROUTE_ABOUT}`} element={<Help displaySize={viewSize}/>}/>
                <Route path={`/${ROUTE_TRACK}`} element={<TestTracking/>}/>
                <Route path={`/${ROUTE_TUTORIAL}`} element={<TutorialContainer/>}/>
                <Route path={`/${ROUTE_COLORS}`} element={<ColorsContainer/>}/>
                <Route path={`/${ROUTE_MENU}`} element={<MainMenu/>}/>
                <Route path={`/${ROUTE_LOCAL_GAME}`} element={<CycleView/>}/>
                <Route path={`/${ROUTE_LOCAL_OPTIONS}`} element={<LocalGameOptionsPage/>}/>
            </Routes>
        </BrowserRouter>
    )
}
