import * as React from 'react'

import {CartPair} from '../../common/CartPair'
import {LocalBoardContainer} from './LocalBoardContainer'
import {CSSProperties} from 'react'

export interface LGDProps {  // props for LocalGameDisplay
    displaySize: CartPair
}

interface LGDState {  // state for LocalGameDisplay
    statsRight: boolean  // is the stats pane on the right if horizontal?
    statsDown: boolean  // is the stats pane on bottom if vertical?
}

const defaultState: LGDState = {
    statsRight: true,
    statsDown: true,
}

const STATS_ASPECT = 0.2  // small side to large side

export class LocalGameDisplay extends React.Component<LGDProps, LGDState> {
    get isVertical() {
        return this.props.displaySize.y > this.props.displaySize.x
    }

    componentWillMount(): void {
        this.setState(defaultState)
    }

    render(): React.ReactNode {
        const containerStyle: CSSProperties = {
            display: 'flex',
            flexDirection: this.isVertical ? 'column' : 'row',
        }
        const boardStyle: CSSProperties = {
            ...this.props.displaySize.sizeStyle,
            // left: 0,
            // right: 0,
            // top: 0,
            // bottom: 0,
            // position: 'absolute',
        }
        const statsStyle: CSSProperties = {
            ...boardStyle,
            border: '4px solid green',
        }

        let boardDisplay = this.props.displaySize
        let statsDisplay = this.props.displaySize
        if (this.isVertical) { // stats is horizontal
            const statsWidth = this.props.displaySize.x
            const statsHeight = statsWidth * STATS_ASPECT
            const boardHeight = this.props.displaySize.y - statsHeight
            statsStyle.height = statsHeight
            boardStyle.height = boardHeight
            boardDisplay = boardDisplay.setY(boardHeight)
            statsDisplay = statsDisplay.setY(statsHeight)
            if (this.state.statsDown) {
                statsStyle.top = boardHeight
                boardStyle.bottom = statsHeight
            }
            else {
                statsStyle.bottom = boardHeight
                boardStyle.top = statsHeight
            }
        }
        else { // stats is vertical
            const statsHeight = this.props.displaySize.y
            const statsWidth = statsHeight * STATS_ASPECT
            const boardWidth = this.props.displaySize.x - statsWidth
            statsStyle.width = statsWidth
            boardStyle.width = boardWidth
            if (this.state.statsRight) {
                statsStyle.left = boardWidth
                boardStyle.right = statsWidth
            }
            else {
                statsStyle.right = boardWidth
                boardStyle.left = statsWidth
            }
        }

        return (
            <div style={containerStyle}>
                <div style={boardStyle}>
                    <LocalBoardContainer displaySize={boardDisplay}/>
                </div>
                <div style={statsStyle}>
                    Stats
                </div>
            </div>
        )
    }
}