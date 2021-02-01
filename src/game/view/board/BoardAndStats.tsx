import {Map} from 'immutable'
import * as React from "react"
import {useMemo} from "react"

import {CartPair} from '../../../common/CartPair'
import {useLocalStorageState} from '../../../common/HookLocalStorage'
import {ProvideDisplaySize, useDisplaySize} from "../../../common/ViewSizeContext"
import {HamburgerMenu} from "../../../main/HamburgerMenu"
import {ROUTE_MENU} from "../../../main/Main"
import {StatsPanel} from '../stats/StatsPanel'
import {BoardViewProps} from './BoardViewProps'
import {HexBoardView} from './HexBoardView'

export interface BoardAndStatsProps extends BoardViewProps {
    statsVisible: boolean
}

interface BoardAndStatsState {  // state for BoardAndStats
    statsRight: boolean  // is the stats pane on the right if horizontal?
    statsDown: boolean  // is the stats pane on bottom if vertical?
}

const defaultPrefs: BoardAndStatsState = {
    statsRight: true,
    statsDown: true,
}

const STATS_ASPECT = 0.2  // small side to large side
const STATS_AND_MENU_ASPECT = 1 / ((1 / STATS_ASPECT) + 1) // add room for a square menu: 1/5 —> 1/6

export interface SizeAndStyle {
    displaySize: CartPair,
    style: React.CSSProperties,
}

export interface BoardAndStatsDisplayStuff {
    container: SizeAndStyle,
    board: SizeAndStyle,
    stats: SizeAndStyle,
    menu: SizeAndStyle,
    statsAndMenu: React.CSSProperties,
}

export const statSizesAndStyles = (
    displaySize: CartPair, statsVisible: boolean, state: BoardAndStatsState = defaultPrefs,
): BoardAndStatsDisplayStuff => {
    const containerStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'center',
        // really want graph to be against edge of display
        // width: '100%',
        // height: '100%',
        flexDirection: displaySize.isVertical ?
            (state.statsDown ? 'column' : 'column-reverse'):
            (state.statsRight ? 'row' : 'row-reverse'),
    }
    const boardStyle: React.CSSProperties = {
        ...displaySize.sizeStyle,
        alignSelf: 'center',
    }
    const statsStyle: React.CSSProperties = {
        ...boardStyle,
        alignSelf: 'flex-end',
    }

    let boardDisplay = displaySize
    let statsDisplay = statsVisible ? displaySize : CartPair.ORIGIN
    let menuDisplay = CartPair.NAN
    if (statsVisible) {
        if (displaySize.isVertical) { // stats is horizontal
            // noinspection UnnecessaryLocalVariableJS
            const statsAndMenuWidth = displaySize.x
            const statsHeight = statsAndMenuWidth * STATS_AND_MENU_ASPECT
            const statsWidth = statsAndMenuWidth - statsHeight
            const boardHeight = displaySize.y - statsHeight
            statsStyle.height = statsHeight
            statsStyle.widows = statsWidth
            boardStyle.height = boardHeight
            boardDisplay = boardDisplay.setY(boardHeight)
            statsDisplay = statsDisplay.setY(statsHeight).setX(statsWidth)
            menuDisplay = new CartPair(statsHeight, statsHeight) // small square
        }
        else { // stats is vertical
            // noinspection UnnecessaryLocalVariableJS
            const statsAndMenuHeight = displaySize.y
            const statsWidth = statsAndMenuHeight * STATS_AND_MENU_ASPECT
            const statsHeight = statsAndMenuHeight - statsWidth
            const boardWidth = displaySize.x - statsWidth
            statsStyle.width = statsWidth
            statsStyle.height = statsHeight
            boardStyle.width = boardWidth
            boardDisplay = boardDisplay.setX(boardWidth)
            statsDisplay = statsDisplay.setX(statsWidth).setY(statsHeight)
            menuDisplay = new CartPair(statsWidth, statsWidth) // small square
        }
    }

    return {
        container: {
            displaySize: displaySize,
            style: containerStyle,
        },
        board: {
            displaySize: boardDisplay,
            style: boardStyle,
        },
        stats: {
            displaySize: statsDisplay,
            style: statsStyle,
        },
        menu: {
            displaySize: menuDisplay,
            style: {
                ...menuDisplay.sizeStyle,
                // background: 'grey',
            },
        },
        statsAndMenu: {
            display: 'flex',
            flexDirection: displaySize.isVertical ? 'row' : 'column'
        }
    }
}

export const BoardAndStats = (props: BoardAndStatsProps) => {
    const [prefs, setPrefs] = useLocalStorageState('BoardAndStats.state', defaultPrefs)
    const displaySize = useDisplaySize()
    const displayStuff = useMemo(() =>
        statSizesAndStyles(displaySize, props.statsVisible, prefs),
        [displaySize, prefs, props.statsVisible]
    )
    const screenVertical = displaySize.isVertical
    return (
        <div style={displayStuff.container.style}>
            <div style={displayStuff.board.style}>
                <ProvideDisplaySize size={displayStuff.board.displaySize}>
                    <HexBoardView {...props} />
                </ProvideDisplaySize>
            </div>
            {
                props.statsVisible ? (
                    <div style={displayStuff.statsAndMenu}>
                        <HamburgerMenu
                            style={displayStuff.menu.style}
                            displaySize={displayStuff.menu.displaySize}
                            to={`/${ROUTE_MENU}`}
                        />
                        <div style={displayStuff.stats.style}>
                            <StatsPanel
                                boardState={props.boardState}
                                flipped={screenVertical ? !prefs.statsDown : !prefs.statsRight}
                                onTogglePosition={() => {
                                    setPrefs({
                                        statsRight: screenVertical ? prefs.statsRight : !prefs.statsRight,
                                        statsDown: screenVertical ? !prefs.statsDown : prefs.statsDown,
                                    })
                                }}
                                displaySize={displayStuff.stats.displaySize}
                                colors={props.colors || Map()}
                            />
                        </div>
                    </div>
                ) : undefined
            }
        </div>
    )
}

