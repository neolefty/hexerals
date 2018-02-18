import {Map} from 'immutable';
import * as React from 'react';
import {Component, KeyboardEvent} from 'react';
import {Board, Player} from './Board';
import './Board.css';
import {HexCoord} from './Hex';

interface BoardViewProps {
    board: Board;
    cursor: HexCoord;

    height: number;
    width: number;

    onMovePlayer: (delta: HexCoord) => void;
    onPlaceCursor: (position: HexCoord) => void;
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
const INT_MULT = 30;
const INT_Y_OFFSET = 1 / 15;

export const BoardView = (props: BoardViewProps) => (
    <div>
        <HexBoardView {...props}/>
    </div>
);

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
    readonly hexRadius: number;

    readonly innerH: number;
    readonly innerW: number;

    // margin to center hexes in bounding rect
    readonly marginX: number;
    readonly marginY: number;

    constructor(props: BoardViewProps) {
        // TODO adapt to window size
        super(props);
        // calculate hex size
        this.innerW = props.width - 2 * BOARD_MARGIN;
        this.innerH = props.height - 2 * BOARD_MARGIN;
        const cartWidth = props.board.edges.width;
        const cartHeight = props.board.edges.height;
        const widthMaxR = this.innerW / (cartWidth * 1.5 + 0.5);
        const heightMaxR = this.innerH / (cartHeight + 1) / HALF_SQRT_3;
        this.hexRadius = Math.min(widthMaxR, heightMaxR);

        // calculate margin
        const totalHexWidth = (cartWidth * 1.5 + 0.5) * this.hexRadius;
        const totalHexHeight = (cartHeight + 1) * HALF_SQRT_3 * this.hexRadius;
        this.marginX = (props.width - totalHexWidth) / 2;
        this.marginY = (props.height - totalHexHeight) / 2;

        this.filterNobody = this.filterNobody.bind(this);
        this.filterPlayer = this.filterPlayer.bind(this);
        this.filterCursor = this.filterCursor.bind(this);
    }

    filterNobody(hex: HexCoord): boolean {
        return this.props.cursor !== hex
            && this.props.board.getSpot(hex).owner === Player.Nobody;
    }

    filterPlayer(hex: HexCoord): boolean {
        return this.props.cursor !== hex
            && this.props.board.getSpot(hex).owner !== Player.Nobody;
    }

    filterCursor(hex: HexCoord): boolean {
        return this.props.cursor === hex;
    }

    render(): React.ReactNode {
        // TODO scale so that hex coords are integers as much as possible
        // hack approximating sqrt3/2 to 13/15
        return (
            <div tabIndex={0} onKeyDown={this.onKeyDown}>
                <svg width={this.props.width} height={this.props.height}>
                    <rect
                        x="0"
                        y="0"
                        width={this.props.width}
                        height={this.props.height}
                        className="mapBound"
                    />
                    <g transform={`translate(${this.marginX},${this.marginY}) scale(${this.hexRadius / INT_MULT})`}>
                        <HexFilterBoardView
                            key={'nobody'}
                            filter={this.filterNobody}
                            hexRadius={INT_MULT}
                            {...this.props}
                            height={(this.props.board.edges.height + 1) * HALF_SQRT_3 * INT_MULT}
                        />
                        <HexFilterBoardView
                            key={'player'}
                            filter={this.filterPlayer}
                            hexRadius={INT_MULT}
                            {...this.props}
                            height={(this.props.board.edges.height + 1) * HALF_SQRT_3 * INT_MULT + INT_Y_OFFSET}
                        />
                        <HexFilterBoardView
                            key={'compy'}
                            filter={this.filterCursor}
                            hexRadius={INT_MULT}
                            {...this.props}
                            height={(this.props.board.edges.height + 1) * HALF_SQRT_3 * INT_MULT + INT_Y_OFFSET}
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
        // TODO consider rounding height to integer
        // TODO look into SVGFactory / SVGElement
        return (
            // div required to receive keyboard events
                <g id="hexMap"> {
                    // empty first
                    this.props.board.constraints.all().filter(
                        this.props.filter
                    ).map(hex => {
                        const spot = this.props.board.getSpot(hex);
                        return (
                            <FlatTopHex
                                key={hex.id}
                                owner={spot.owner}
                                selected={hex === this.props.cursor}
                                centerX={((hex.cartX() + 1) * 1.5 - 0.5) * this.props.hexRadius}
                                centerY={Math.round(this.props.height - (hex.cartY() + 1) * this.props.hexRadius * HALF_SQRT_3)}
                                hexRadius={this.props.hexRadius}
                                onSelect={() => this.props.onPlaceCursor(hex)}
                                contents={spot.pop === 0 ? '' : `${spot.pop}`}
                            />
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
        {
            props.contents &&
                <text
                    x={props.centerX}
                    y={props.centerY + 0.35 * HALF_SQRT_3 * props.hexRadius}
                    fontFamily="Sans-Serif"
                    fontSize={props.hexRadius * 0.9}
                    textAnchor="middle"
                >
                    {props.contents}
                </text>
        }
    </g>
);
