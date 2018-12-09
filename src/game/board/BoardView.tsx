import * as React from 'react'

import {Map} from 'immutable'
import './Board.css'
import {HexCoord} from './HexCoord'
import Dimension from '../../common/Dimension'
import {DriftColor} from '../../color/DriftColor'
import {Player} from '../players/Players'
import {PlayerMove} from './Move'
import {BoardState} from './BoardState'
import {FilterBoardView} from './HexBoardView';
import {MovementQueueView} from './MovementView';

export interface BoardViewActions {
    onQueueMove: (move: PlayerMove) => void
    onCancelMove: (player: Player) => void
    onPlaceCursor: (position: HexCoord) => void
    onEndGame: () => void
}

export interface BoardViewProps extends BoardViewActions {
    boardState: BoardState
    displaySize: Dimension
    colors?: Map<Player, DriftColor>
}

const KEY_CONTROLS: Map<string, HexCoord> = Map({
    'ArrowLeft': HexCoord.LEFT_UP,
    'ArrowRight': HexCoord.RIGHT_DOWN,
    'ArrowUp': HexCoord.UP,
    'ArrowDown': HexCoord.DOWN,
    'q': HexCoord.LEFT_UP,
    'a': HexCoord.LEFT_DOWN,
    'w': HexCoord.UP,
    's': HexCoord.DOWN,
    'e': HexCoord.RIGHT_UP,
    'd': HexCoord.RIGHT_DOWN,
})

const OUTER_BOARD_MARGIN = 1
const INNER_BOARD_MARGIN = 1

export class BoardViewBase extends React.Component<BoardViewProps> {
    constructor(props: BoardViewProps) {
        super(props)
        this.onKeyDown = this.onKeyDown.bind(this)
    }

    onKeyDown(e: React.KeyboardEvent<HTMLDivElement>): void {
        const bs = this.props.boardState
        if (bs.cursor !== HexCoord.NONE && bs.curPlayer) {
            const delta = KEY_CONTROLS.get(e.key, HexCoord.NONE)
            if (delta !== HexCoord.NONE) {
                this.props.onQueueMove(
                    PlayerMove.construct(bs.curPlayer, bs.cursor, delta)
                )
                this.props.onPlaceCursor(bs.cursor.plus(delta))
                e.preventDefault()
                return
            }
        }

        if (e.key === 'Escape') {
            this.props.onEndGame()
            e.preventDefault()
            return
        }

        if (e.key === 'z' && bs.curPlayer)
            this.props.onCancelMove(bs.curPlayer)
    }
}

export class BoardView extends BoardViewBase {
    constructor(props: BoardViewProps) {
        super(props)
        // console.log(`colors: ${props.colors}`)
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
            <div tabIndex={0} onKeyDown={this.onKeyDown}>
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
                    <MovementQueueView
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
