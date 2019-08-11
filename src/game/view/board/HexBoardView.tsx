import * as React from 'react'
import {Map} from 'immutable'

import './HexBoardView.css'
import {isIOS} from "../../../common/BrowserUtil"
import {Hex} from "../../model/hex/Hex"
import {Player} from '../../model/players/Players'
import {HexesView} from '../hex/HexesView';
import {NicheText} from "../hex/NicheView"
import {MoveQueueView} from './MoveQueueView';
import {BoardViewBase, BoardViewProps} from './BoardViewBase';
import {hexPixelHeight, hexPixelWidth} from '../hex/HexConstants'
import {DriftColor} from '../../../color/DriftColor';

// space between bounding rect and hex viewbox
const OUTER_BOARD_MARGIN = 1
// space between hex viewbox and hexes
const INNER_BOARD_MARGIN = 1
// flags stick up above the top a bit
const FLAG_CLEARANCE = 5

export class HexBoardView extends BoardViewBase {
    private focusRef = React.createRef<HTMLDivElement>()
    readonly needsFocus: boolean

    private shouldGrabFocus = () =>
        this.props.grabFocus === undefined
        || this.props.grabFocus

    constructor(props: BoardViewProps) {
        super(props)
        // Safari seems to work better without grabbing focus
        this.needsFocus = !isIOS()
        // ensure there are enough colors for all the players
        if (
            !this.props.colors
            || this.props.colors.size !== this.props.boardState.players.size
        )
            this.props.onResetColors(this.props.boardState.players.size)
    }

    componentDidMount() { this.focusDiv() }
    componentDidUpdate() { this.focusDiv() }

    focusDiv() {
        if (this.shouldGrabFocus() && this.needsFocus) {
            const node = this.focusRef.current
            if (node)
                node.focus()
        }
    }

    render(): React.ReactNode {
        // calculate board size
        const innerW = this.props.displaySize.x - 2 * OUTER_BOARD_MARGIN
        const innerH = this.props.displaySize.y - 2 * OUTER_BOARD_MARGIN
        const coordsWidth = this.props.boardState.board.edges.width
        const coordsHeight = this.props.boardState.board.edges.height

        // integer approximation of hexes -- half of sqrt 3 ~= 13 / 15
        // coords inside viewport -- hex radius is 15, hex half-height is 13
        // row height is 26, hex diameter is 30

        const scaleWidth = hexPixelWidth(coordsWidth)
        const scaleHeight = hexPixelHeight(coordsHeight)

        const perceivedTurn = this.props.boardState.board.perceivedTurn(this.props.boardState.turn)

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
                onKeyDown={this.keyboardController.onKeyDown}
                ref={this.focusRef}
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
                    <HexesView{...this.props}/>
                    <MoveQueueView
                        moves={this.props.boardState.moves}
                        colors={this.props.colors as Map<Player, DriftColor>}
                        players={this.props.boardState.board.players}
                        boardHeight={coordsHeight}
                    />
                    {
                        perceivedTurn <= 0 ? undefined : (
                            <>
                                <NicheText
                                    hex={Hex.RIGHT_DOWN}
                                    topHalf={true}
                                    boardHeight={coordsHeight}
                                    text={perceivedTurn}
                                />
                                <NicheText
                                    hex={this.props.boardState.board.niches.ur}
                                    topHalf={false}
                                    boardHeight={coordsHeight}
                                    text={perceivedTurn}
                                />
                            </>
                        )
                    }
                    {
                        // TODO Add a turn indicator in upper right too
                    }
                </svg>
            </div>
        )
    }
}