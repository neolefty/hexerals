import * as React from 'react'
import {Map} from 'immutable'

import {CartPair} from '../../../common/CartPair'
import {useLocalStorageState} from '../../../common/HookLocalStorage'
import {StatsPanel} from '../stats/StatsPanel'
import {BoardViewProps} from './BoardViewBase'
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

export interface SizeAndStyle {
    displaySize: CartPair,
    style: React.CSSProperties,
}

export interface BoardAndStatsDisplayStuff {
    container: SizeAndStyle,
    board: SizeAndStyle,
    stats: SizeAndStyle,
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
    if (statsVisible) {
        if (displaySize.isVertical) { // stats is horizontal
            // noinspection UnnecessaryLocalVariableJS
            const statsWidth = displaySize.x
            const statsHeight = statsWidth * STATS_ASPECT
            const boardHeight = displaySize.y - statsHeight
            statsStyle.height = statsHeight
            boardStyle.height = boardHeight
            boardDisplay = boardDisplay.setY(boardHeight)
            statsDisplay = statsDisplay.setY(statsHeight)
        }
        else { // stats is vertical
            // noinspection UnnecessaryLocalVariableJS
            const statsHeight = displaySize.y
            const statsWidth = statsHeight * STATS_ASPECT
            const boardWidth = displaySize.x - statsWidth
            statsStyle.width = statsWidth
            boardStyle.width = boardWidth
            boardDisplay = boardDisplay.setX(boardWidth)
            statsDisplay = statsDisplay.setX(statsWidth)
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
        }
    }
}

export const BoardAndStats = (props: BoardAndStatsProps) => {
    const [prefs, setPrefs] = useLocalStorageState('BoardAndStats.state', defaultPrefs)
    const displayStuff = statSizesAndStyles(props.displaySize, props.statsVisible, prefs)
    const screenVertical = props.displaySize.isVertical
    return (
        <div style={displayStuff.container.style}>
            <div style={displayStuff.board.style}>
                <HexBoardView
                    {...props}
                    displaySize={displayStuff.board.displaySize}
                />
            </div>
            {
                props.statsVisible ? (
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
                ) : undefined
            }
        </div>
    )
}