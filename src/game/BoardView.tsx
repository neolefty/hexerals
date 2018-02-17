import {Map} from 'immutable';
import * as React from 'react';
import {Component, KeyboardEvent} from 'react';
import {Board} from './Board';
import './Board.css';
import {INITIAL_HEIGHT, INITIAL_WIDTH} from './Constants';
import {HexCoord} from './Hex';
// import {OldGridView} from './OldGridView';

interface BoardProps {
    board: Board;
    cursor: HexCoord;

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

export const BoardView = (props: BoardProps) => (
    <div>
        {/*<OldGridView {...props}/>*/}
        <FlatTopHexView {...props}/>
    </div>
);

export class BoardBase extends Component<BoardProps> {
    constructor(props: BoardProps) {
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

// a hexagon centered at (x, y)
const hexPoints = (
    x: number, y: number, hexRadius: number, hexMid: number, hexHalfHeight: number
) => ''
    + (x - hexRadius) + ',' + y + ' ' // left
    + (x - hexMid) + ',' + (y - hexHalfHeight) + ' ' // up left
    + (x + hexMid) + ',' + (y - hexHalfHeight) + ' ' // up right
    // TODO only include this if nothing on that side?
    + (x + hexRadius) + ',' + y + ' ' // right
    + (x + hexMid) + ',' + (y + hexHalfHeight) + ' ' // down right
    + (x - hexMid) + ',' + (y + hexHalfHeight); // down left

export class FlatTopHexView extends BoardBase {
    readonly w: number;
    readonly h: number;
    readonly hexRadius: number;
    readonly sqrt3half: number;
    readonly hexMid: number;
    readonly hexHalfHeight: number;

    constructor(props: BoardProps) {
        super(props);
        this.sqrt3half = 0.866; // 0.8660254;
        this.w = 600;
        this.h = 1000;
        const widthMaxR = this.w / (INITIAL_WIDTH - 1 / 3) / 3;
        const heightMaxR = this.h / (INITIAL_HEIGHT + 1) / this.sqrt3half;
        this.hexRadius = Math.min(widthMaxR, heightMaxR);
        this.hexMid = this.hexRadius * 0.5;
        this.hexHalfHeight = this.hexRadius * this.sqrt3half;
    }

    render(): React.ReactNode {
        // TODO consider rounding height to integer

        return (
            // div required to receive keyboard events
            <div tabIndex={0} onKeyDown={this.onKeyDown}>
            <svg width={this.w} height={this.h}>
                <rect x="0" y="0" width={this.w} height={this.h} className="mapBound" />
                <g id="hexMap"> {
                    // TODO: draw empty first,  then filled,  then cursor
                    this.props.board.constraints.all().map(hex => {
                        const spot = this.props.board.getSpot(hex);
                        const selected = hex === this.props.cursor;
                        const x = ((hex.cartX() + 1) * 1.5 - 0.5) * this.hexRadius;
                        const y = this.h - (hex.cartY() + 1) * this.hexHalfHeight;
                        return (
                            <g
                                onClick={(/*e*/) => this.props.onPlaceCursor(hex)}
                                className={
                                    spot.owner
                                    + ' spot'
                                    + (selected ? ' active' : '')
                                }
                                key={hex.id}
                            >
                                <polygon
                                    // id={'hex' + hex.id}
                                    points={hexPoints(
                                        x, y, this.hexRadius, this.hexMid, this.hexHalfHeight
                                    )}
                                />
                                <text
                                    x={x}
                                    y={y + 0.35 * this.hexHalfHeight}
                                    fontFamily="Sans-Serif"
                                    fontSize={this.hexRadius * 0.9}
                                    textAnchor="middle"
                                >
                                    {spot.pop}
                                </text>
                            </g>
                        );
                    })
                }
                </g>
            </svg>
            </div>
        );
    }
}