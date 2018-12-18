import * as React from 'react'
import {Map} from 'immutable'

import './Board.css'
import {HexCoord} from '../model/HexCoord'
import {DriftColor} from '../../../color/DriftColor'
import {Player} from '../../players/Players'
import {FilterBoardView} from './FilterBoardView';
import {MoveQueueView} from './MoveQueueView';
import {BoardViewBase, BoardViewProps} from './BoardViewBase';

// space between bounding rect and hex viewbox
const OUTER_BOARD_MARGIN = 1
// space between hex viewbox and hexes
const INNER_BOARD_MARGIN = 1

export class HexBoardView extends BoardViewBase {
    constructor(props: BoardViewProps) {
        super(props)
        this.filterNobody = this.filterNobody.bind(this)
        this.filterPlayers = this.filterPlayers.bind(this)
        this.filterCursor = this.filterCursor.bind(this)
    }

    filterNobody(hex: HexCoord): boolean {
        return this.props.boardState.cursor !== hex
            && this.props.boardState.board.getSpot(hex).owner === Player.Nobody
    }

    filterPlayers(hex: HexCoord): boolean {
        return this.props.boardState.cursor !== hex
            && this.props.boardState.board.getSpot(hex).owner !== Player.Nobody
    }

    filterCursor(hex: HexCoord): boolean {
        return this.props.boardState.cursor === hex
    }

    render(): React.ReactNode {
        // calculate board size
        const innerW = this.props.displaySize.w - 2 * OUTER_BOARD_MARGIN
        const innerH = this.props.displaySize.h - 2 * OUTER_BOARD_MARGIN
        const coordsWidth = this.props.boardState.board.edges.width
        const coordsHeight = this.props.boardState.board.edges.height

        // integer approximation of hexes -- half of sqrt 3 ~= 13 / 15
        // coords inside viewport -- hex radius is 15, hex half-height is 13
        // row height is 26, hex diameter is 30

        // horizontally, hex centers are 1.5 diameters apart
        const scaleWidth = coordsWidth * 45 + 15
        // vertically, hex centers are half a row apart
        const scaleHeight = (coordsHeight + 1) * 26 // hex

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
            <div tabIndex={0} onKeyDown={this.keyboardController.onKeyDown}>
                <svg
                    className="board"
                    width={boardWidth}
                    height={boardHeight}
                    viewBox={[
                        -INNER_BOARD_MARGIN,
                        -INNER_BOARD_MARGIN,
                        scaleWidth + INNER_BOARD_MARGIN,
                        scaleHeight + INNER_BOARD_MARGIN
                    ].join(',')}
                >
                    <rect
                        width={scaleWidth}
                        height={scaleHeight}
                        stroke="white"
                        strokeWidth="3"
                    />
                    <FilterBoardView
                        key={'nobody'}
                        filter={this.filterNobody}
                        {...this.props}
                    />
                    <FilterBoardView
                        key={'players'}
                        filter={this.filterPlayers}
                        {...this.props}
                    />
                    <FilterBoardView
                        key={'cursor'}
                        filter={this.filterCursor}
                        {...this.props}
                    />
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