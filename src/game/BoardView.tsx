import {Map} from 'immutable';
import * as React from 'react';
import {Component, KeyboardEvent} from 'react';
import {Board, Player} from './Board';
import './Board.css';
import {HexCoord} from './Hex';
import Dimension from '../Dimension';

interface BoardViewProps {
    board: Board;
    cursor: HexCoord;
    displaySize: Dimension;

    onMovePlayer: (delta: HexCoord) => void;
    onPlaceCursor: (position: HexCoord) => void;
    onNewGame: (board: Board) => void;
    onChangeDisplaySize: (dim: Dimension) => void;
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

const BOARD_MARGIN = 1; // space between bounding rect and hexes
const INT_MULTIPLE = 30; // how much to multiply by to approximate integers

export const GameView = (props: BoardViewProps) => {
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
        // calculate hex size
        const innerW = this.props.displaySize.w - 2 * BOARD_MARGIN;
        const innerH = this.props.displaySize.h - 2 * BOARD_MARGIN;
        const cartWidth = this.props.board.edges.width;
        const cartHeight = this.props.board.edges.height;
        const widthMaxR = innerW / (cartWidth * 1.5 + 0.5);
        const heightMaxR = innerH / (cartHeight + 1) / HALF_SQRT_3;
        const hexRadius = Math.min(widthMaxR, heightMaxR);

        // calculate margin
        const totalHexWidth = (cartWidth * 1.5 + 0.5) * hexRadius;
        const totalHexHeight = (cartHeight + 1) * HALF_SQRT_3 * hexRadius;

        // margin to center hexes in bounding rect
        const marginX = (this.props.displaySize.w - totalHexWidth) / 2;
        const marginY = (this.props.displaySize.h - totalHexHeight) / 2;

        // TODO consider using SVG viewbox instead of scale & translate
        return (
            <div tabIndex={0} onKeyDown={this.onKeyDown}>
                <svg width={this.props.displaySize.w} height={this.props.displaySize.h}>
                    <rect
                        x="0"
                        y="0"
                        width={this.props.displaySize.w}
                        height={this.props.displaySize.h}
                        className="mapBound"
                    />
                    <g transform={`translate(${marginX},${marginY}) scale(${hexRadius / INT_MULTIPLE})`}>
                        <HexFilterBoardView
                            key={'nobody'}
                            filter={this.filterNobody}
                            hexRadius={INT_MULTIPLE}
                            {...this.props}
                            height={(this.props.board.edges.height + 1) * HALF_SQRT_3 * INT_MULTIPLE}
                        />
                        <HexFilterBoardView
                            key={'players'}
                            filter={this.filterPlayers}
                            hexRadius={INT_MULTIPLE}
                            {...this.props}
                            height={(this.props.board.edges.height + 1) * HALF_SQRT_3 * INT_MULTIPLE}
                        />
                        <HexFilterBoardView
                            key={'cursor'}
                            filter={this.filterCursor}
                            hexRadius={INT_MULTIPLE}
                            {...this.props}
                            height={(this.props.board.edges.height + 1) * HALF_SQRT_3 * INT_MULTIPLE}
                        />
                    </g>
                </svg>
            </div>
        );
    }
}

interface FilterBoardViewProps extends BoardViewProps {
    filter: (hex: HexCoord) => boolean;
    hexRadius: number;
    height: number;
}

const HALF_SQRT_3 = 13 / 15; // 0.866; // 0.8660254;

class HexFilterBoardView extends Component<FilterBoardViewProps> {
    constructor(props: FilterBoardViewProps) {
        super(props);
    }

    render(): React.ReactNode {
        // TODO look into SVGFactory / SVGElement
        return (
            <g id="hexMap"> {
                this.props.board.constraints.all().filter(
                    this.props.filter
                ).map(hex => {
                    const spot = this.props.board.getSpot(hex);
                    const centerX = ((hex.cartX() + 1) * 1.5 - 0.5) * this.props.hexRadius;
                    const centerY = this.props.height - (hex.cartY() + 1)
                        * this.props.hexRadius * HALF_SQRT_3;
                    return (
                        <FlatTopHex
                            key={hex.id}
                            owner={spot.owner}
                            selected={hex === this.props.cursor}
                            centerX={centerX}
                            centerY={centerY}
                            hexRadius={this.props.hexRadius}
                            onSelect={() => this.props.onPlaceCursor(hex)}
                            contents={spot.pop === 0 ? '' : `${spot.pop}`}
                        >
                            {
                                spot.pop === 0 ? undefined :
                                    <text
                                        x={centerX}
                                        y={centerY + 0.35 * HALF_SQRT_3 * this.props.hexRadius}
                                        fontFamily="Sans-Serif"
                                        fontSize={this.props.hexRadius * 0.9}
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
    const hexMid = hexRadius * 0.5;
    const hexHalfHeight = hexRadius * HALF_SQRT_3;
    return ''
        + (x - hexRadius) + ',' + y + ' ' // left
        + (x - hexMid) + ',' + (y - hexHalfHeight) + ' ' // up left
        + (x + hexMid) + ',' + (y - hexHalfHeight) + ' ' // up right
        // TODO only include this if nothing on that side?
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
