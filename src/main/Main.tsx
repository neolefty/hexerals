import * as React from "react"
import {BrowserRouter as Router, Route, Switch} from "react-router-dom"
import {Tab, TabList, TabPanel, Tabs} from 'react-tabs'
import {ColorsContainer} from "../color/ColorsContainer"
import {inDev} from "../common/Analytics"
import {useDisplaySize} from "../common/ViewSizeContext"
import {CycleView, LocalGameOptionsPage} from "../game/view/cycle/CycleView"
import {TestTracking} from "../game/view/test/TestTracking"
import {TutorialContainer} from "../tutorial/TutorialContainer"
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
        <Router>
            <Switch>
                <Route path={`/${ROUTE_ABOUT}`}>
                    <Help displaySize={viewSize}/>
                </Route>
                <Route path={`/${ROUTE_TRACK}`}>
                    <TestTracking/>
                </Route>
                <Route path={`/${ROUTE_TUTORIAL}`}>
                    <TutorialContainer/>
                </Route>
                <Route path={`/${ROUTE_COLORS}`}>
                    <ColorsContainer/>
                </Route>
                <Route path={`/${ROUTE_MENU}`}>
                    <MainMenu/>
                </Route>
                <Route path={`/${ROUTE_LOCAL_GAME}`}>
                    <CycleView/>
                </Route>
                <Route path={`/${ROUTE_LOCAL_OPTIONS}`}>
                    <LocalGameOptionsPage/>
                </Route>
            </Switch>
        </Router>
    )
}
