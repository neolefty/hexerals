import {Map} from 'immutable'
import * as React from "react"
import {useEffect, useRef} from "react"
import {DriftColor} from '../../../color/DriftColor'
import {isIOS} from "../../../common/BrowserUtil"
import {useDisplaySize} from "../../../common/ViewSizeContext"
import {Player} from '../../model/players/Players'
import {hexPixelHeight, hexPixelWidth} from '../hex/HexConstants'
import {HexesView} from '../hex/HexesView'
import {BoardKeyboardController} from "./BoardKeyboardController"
import {BoardViewProps} from './BoardViewProps'

import './HexBoardView.css'
import {MoveQueueView} from './MoveQueueView'
import {TurnNiches} from './TurnNiches'

// space between bounding rect and hex viewbox
const OUTER_BOARD_MARGIN = 1
// space between hex viewbox and hexes
const INNER_BOARD_MARGIN = 1
// flags stick up above the top a bit
const FLAG_CLEARANCE = 5

export const HexBoardView = (props: BoardViewProps) => {
    const focusRef = useRef<HTMLDivElement>(null)
    // Safari seems to work better without grabbing focus
    const needsFocus: boolean = !isIOS()

    const shouldGrabFocus = () =>
        props.grabFocus === undefined || props.grabFocus

    // ensure there are enough colors for all the players
    if (!props.colors || props.colors.size !== props.boardState.players.size)
        props.onResetColors(props.boardState.players.size)

    const focusDiv = () => {
        if (shouldGrabFocus() && needsFocus) {
            const node = focusRef.current
            if (node)
                node.focus()
        }
    }
    useEffect(focusDiv)

    const displaySize = useDisplaySize()
    const keyboardController = new BoardKeyboardController(props)

    // calculate board size
    const innerW = displaySize.x - 2 * OUTER_BOARD_MARGIN
    const innerH = displaySize.y - 2 * OUTER_BOARD_MARGIN
    const board = props.boardState.board
    const coordsWidth = board.edges.width
    const coordsHeight = board.edges.height

    // integer approximation of hexes -- half of sqrt 3 ~= 13 / 15
    // coords inside viewport -- hex radius is 15, hex half-height is 13
    // row height is 26, hex diameter is 30

    const scaleWidth = hexPixelWidth(coordsWidth)
    const scaleHeight = hexPixelHeight(coordsHeight)

    // figure out whether height or width is constraining factor
    const boardAspectRatio = scaleHeight / scaleWidth
    const screenAspectRatio = innerH / innerW
    let svgHeight, svgWidth

    if (boardAspectRatio > screenAspectRatio) {
        // board taller than screen, so constrained by height
        svgHeight = innerH
        svgWidth = svgHeight / boardAspectRatio
    } else {
        // constrained by width
        svgWidth = innerW
        svgHeight = svgWidth * boardAspectRatio
    }

    return (
        <div
            tabIndex={0}
            className="board"
            onKeyDown={keyboardController.onKeyDown}
            ref={focusRef}
        >
            <svg
                className="board"
                width={svgWidth}
                height={svgHeight}
                viewBox={[
                    -INNER_BOARD_MARGIN,
                    -INNER_BOARD_MARGIN - FLAG_CLEARANCE,
                    scaleWidth + INNER_BOARD_MARGIN,
                    scaleHeight + INNER_BOARD_MARGIN + FLAG_CLEARANCE,
                ].join(',')}
            >
                {/*<HexesView{...props}/>*/}
                <HexesView {...props}/>
                <MoveQueueView
                    moves={props.boardState.moves}
                    colors={props.colors as Map<Player, DriftColor>}
                    players={board.players}
                    boardHeight={coordsHeight}
                />
                <TurnNiches {...props} />
            </svg>
        </div>
    )
}
