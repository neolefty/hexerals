import {Map} from 'immutable';
import * as React from 'react';
import {Component, KeyboardEvent} from 'react';
import {Board, Player} from './Board';
import './Board.css';
import {HexCoord} from './Hex';
import Dimension from '../Dimension';

export interface BoardViewActions {
    onMovePlayer: (delta: HexCoord) => void;
    onPlaceCursor: (position: HexCoord) => void;
    onNewGame: (board: Board) => void;
}

interface BoardViewProps extends BoardViewActions {
    board: Board;
    cursor: HexCoord;
    displaySize: Dimension;
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
});

const OUTER_BOARD_MARGIN = 1; // space between bounding rect and hex viewbox
const INNER_BOARD_MARGIN = 1; // space between hex viewbox and hexes

export const BoardView = (props: BoardViewProps) => {
    return (
        <div>
            {
                props.board ? (
                    <HexBoardView {...props}/>
                ) : (
                    <button>New Game</button>
                )
            }
        </div>
    );
};

export class BoardViewBase extends Component<BoardViewProps> {
    constructor(props: BoardViewProps) {
        super(props);
        this.onKeyDown = this.onKeyDown.bind(this);
    }

    onKeyDown(e: KeyboardEvent<HTMLDivElement>): void {
        if (this.props.onMovePlayer && this.props.cursor !== HexCoord.NONE) {
            const delta = KEY_CONTROLS.get(e.key, HexCoord.NONE);
            if (delta !== HexCoord.NONE) {
                const dest = this.props.cursor.plus(delta);
                if (this.props.board.inBounds(dest)) {
                    this.props.onMovePlayer(delta);
                    e.preventDefault();
                }
            }
        }
    }
}

export class HexBoardView extends BoardViewBase {
    constructor(props: BoardViewProps) {
        super(props);
        this.filterNobody = this.filterNobody.bind(this);
        this.filterPlayers = this.filterPlayers.bind(this);
        this.filterCursor = this.filterCursor.bind(this);
    }

    filterNobody(hex: HexCoord): boolean {
        return this.props.cursor !== hex
            && this.props.board.getSpot(hex).owner === Player.Nobody;
    }

    filterPlayers(hex: HexCoord): boolean {
        return this.props.cursor !== hex
            && this.props.board.getSpot(hex).owner !== Player.Nobody;
    }

    filterCursor(hex: HexCoord): boolean {
        return this.props.cursor === hex;
    }

    render(): React.ReactNode {
        if (Math.random() < 0.01)
            console.log(this.props);
        // calculate board size
        const innerW = this.props.displaySize.w - 2 * OUTER_BOARD_MARGIN;
        const innerH = this.props.displaySize.h - 2 * OUTER_BOARD_MARGIN;
        const coordsWidth = this.props.board.edges.width;
        const coordsHeight = this.props.board.edges.height;

        // integer approximation of hexes -- half of sqrt 3 ~= 13 / 15
        // coords inside viewport -- hex radius is 15, hex half-height is 13
        // row height is 26, hex diameter is 30

        // horizontally, hex centers are 1.5 diameters apart
        const scaleWidth = coordsWidth * 45 + 15;
        // vertically, hex centers are half a row apart
        const scaleHeight = (coordsHeight + 1) * 26; // hex

        // figure out whether height or width is constraining factor
        const boardAspectRatio = scaleHeight / scaleWidth;
        const screenAspectRatio = innerH / innerW;
        let boardHeight, boardWidth;

        if (boardAspectRatio > screenAspectRatio) {
            // board taller than screen, so constrained by height
            boardHeight = innerH;
            boardWidth = boardHeight / boardAspectRatio;
        } else {
            // constrained by width
            boardWidth = innerW;
            boardHeight = boardWidth * boardAspectRatio;
        }

        return (
            <div tabIndex={0} onKeyDown={this.onKeyDown}>
                <svg
                    className="board"
                    width={boardWidth}
                    height={boardHeight}
                    viewBox={[
                        - INNER_BOARD_MARGIN,
                        - INNER_BOARD_MARGIN,
                        scaleWidth + INNER_BOARD_MARGIN,
                        scaleHeight + INNER_BOARD_MARGIN
                    ].join(',')}
                >
                    <rect width={scaleWidth} height={scaleHeight} stroke="white" strokeWidth="3"/>
                    <HexFilterBoardView
                        key={'nobody'}
                        filter={this.filterNobody}
                        {...this.props}
                    />
                    <HexFilterBoardView
                        key={'players'}
                        filter={this.filterPlayers}
                        {...this.props}
                    />
                    <HexFilterBoardView
                        key={'cursor'}
                        filter={this.filterCursor}
                        {...this.props}
                    />
                </svg>
            </div>
        );
    }
}

interface FilterBoardViewProps extends BoardViewProps {
    filter: (hex: HexCoord) => boolean;
}

class HexFilterBoardView extends Component<FilterBoardViewProps> {
    constructor(props: FilterBoardViewProps) {
        super(props);
    }

    render(): React.ReactNode {
        const height = (this.props.board.edges.height + 1) * 26;
        // TODO look into SVGFactory / SVGElement
        return (
            <g id="hexMap"> {
                this.props.board.constraints.all().filter(
                    this.props.filter
                ).map(hex => {
                    const spot = this.props.board.getSpot(hex);
                    const centerX = hex.cartX() * 45 + 30;
                    const centerY = height - (hex.cartY() + 1) * 26;
                    return (
                        <FlatTopHex
                            key={hex.id}
                            owner={spot.owner}
                            selected={hex === this.props.cursor}
                            centerX={centerX}
                            centerY={centerY}
                            hexRadius={30}
                            onSelect={() => this.props.onPlaceCursor(hex)}
                            contents={spot.pop === 0 ? '' : `${spot.pop}`}
                        >
                            {
                                spot.pop === 0 ? undefined :
                                    <text
                                        x={centerX}
                                        y={centerY + 0.35 * 26}
                                        fontFamily="Sans-Serif"
                                        fontSize={27}
                                        textAnchor="middle"
                                    >
                                        {spot.pop}
                                    </text>
                            }
                        </FlatTopHex>
                    );
                })
            }
            </g>
        );
    }
}

interface FlatTopHexProps {
    owner: Player;
    selected: boolean;
    centerX: number;
    centerY: number;
    hexRadius: number;
    onSelect: () => void;
    contents: string;
    children?: JSX.Element | JSX.Element[]; // could user "any?" instead
}

// a hexagon centered at (x, y)
const hexPoints = (x: number, y: number, hexRadius: number) => {
    const hexMid = 15;
    const hexHalfHeight = 26;
    return ''
        + (x - hexRadius) + ',' + y + ' ' // left
        + (x - hexMid) + ',' + (y - hexHalfHeight) + ' ' // up left
        + (x + hexMid) + ',' + (y - hexHalfHeight) + ' ' // up right
        + (x + hexRadius) + ',' + y + ' ' // right
        + (x + hexMid) + ',' + (y + hexHalfHeight) + ' ' // down right
        + (x - hexMid) + ',' + (y + hexHalfHeight); // down left
};

const FlatTopHex = (props: FlatTopHexProps) => (
    <g
        onClick={(/*e*/) => props.onSelect()}
        className={
            props.owner
            + ' spot'
            + (props.selected ? ' active' : '')
        }
    >
        <polygon
            points={hexPoints(props.centerX, props.centerY, props.hexRadius)}
        />
        {props.children && <g>{props.children}</g>}
    </g>
);
