import * as React from 'react'
import {Map} from 'immutable'

import './Board.css'
import {DriftColor} from '../../../color/DriftColor'
import {Player} from '../model/players/Players'
import {HexesView} from './HexesView';
import {MoveQueueView} from './MoveQueueView';
import {BoardViewBase, BoardViewProps} from './BoardViewBase';
import {hexPixelHeight, hexPixelWidth} from './HexConstants';

// space between bounding rect and hex viewbox
const OUTER_BOARD_MARGIN = 1
// space between hex viewbox and hexes
const INNER_BOARD_MARGIN = 1
// flags stick up above the top a bit
const FLAG_CLEARANCE = 5

export class HexBoardView extends BoardViewBase {
    private focusRef = React.createRef<HTMLDivElement>()

    private shouldGrabFocus = () =>
        this.props.grabFocus === undefined
        || this.props.grabFocus

    constructor(props: BoardViewProps) {
        super(props)
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
        if (this.shouldGrabFocus()) {
            console.log(`focusing (${this.props.grabFocus})`)
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

        // figure out whether height or width is constraining factor
        const boardAspectRatio = scaleHeight / scaleWidth
        const screenAspectRatio = innerH / innerW
        let boardHeight, boardWidth

        if (boardAspectRatio > screenAspectRatio) {
            // board taller than screen, so constrained by height
            boardHeight = innerH
            boardWidth = boardHeight / boardAspectRatio
        } else {
            // constrained by width
            boardWidth = innerW
            boardHeight = boardWidth * boardAspectRatio
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
                    width={boardWidth}
                    height={boardHeight}
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
                        boardHeight={this.props.boardState.board.edges.height}
                    />
                </svg>
            </div>
        )
    }
}