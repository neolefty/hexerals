import * as React from "react"
import {NavButton} from "../../common/NavButton"
import {useDisplaySize} from "../../common/ViewSizeContext"
import {ROUTE_ABOUT, ROUTE_COLORS, ROUTE_LOCAL_GAME, ROUTE_TUTORIAL} from "./Main"
import './MainMenu.css'
import {useMainState} from "./MainStateContext"

export const MainMenu = () => {
    const viewSize = useDisplaySize()
    const state = useMainState()
    return (
        <div className="MainMenu" style={viewSize.sizeStyle}>
            <NavButton to={`${ROUTE_LOCAL_GAME}`}>
                {state.cycle.localGame
                    ? "Return to Game"
                    : "Play Locally"
                }
            </NavButton>
            <NavButton to={`${ROUTE_TUTORIAL}`}>Tutorial</NavButton>
            <NavButton to={`${ROUTE_COLORS}`}>Colors</NavButton>
            <NavButton to={`${ROUTE_ABOUT}`}>Controls</NavButton>
        </div>
    )
}
