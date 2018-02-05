import { Map } from 'immutable';
import { Component, KeyboardEvent } from 'react';
import * as React from 'react';
import { HexCoord } from './Hex';
import { Spot, Board } from './Board';
import './Board.css';

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
        <OldGridView {...props}/>
        <FlatTopHexView {...props}/>
    </div>
);

class BoardBase extends Component<BoardProps> {
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
    render(): React.ReactNode {
        const hexRadius = 15, sqrt3half = 0.866; // 0.8660254;
        // TODO consider rounding height to integer
        const hexMid = hexRadius * 0.5, hexHalfHeight = hexRadius * sqrt3half;
        const w = 500, h = 300;
        // console.log('Hex at origin: ' + hexPoints(0, 0, hexRadius, hexMid, hexHalfHeight));
        return (
            <svg width={w} height={h}>
                <line key="g" x1="20" y1="20" x2={w - 20} y2={h - 20} stroke="green" strokeWidth="10" strokeLinecap="round"/>
                <line key="b" x1="20" y2="20" x2={w - 20} y1={h - 20} stroke="blue" strokeWidth="10" strokeLinecap="round"/>
                <g id="hexMap"> {
                    // e[0]: HexCoord, e[1]: Spot
                    this.props.board.spots.entrySeq().map(e => (
                        <polygon
                            key={e[0].id}
                            id={'hex' + e[0].id}
                            points={hexPoints(
                                (e[0].cartX() + 1) * hexRadius, // x
                                h - (e[0].cartY() + 1) * hexHalfHeight, // y
                                hexRadius, hexMid, hexHalfHeight
                            )}
                        />
                    ))
                }
                </g>
            </svg>
        );
    }
}

export class OldGridView extends BoardBase {
    render(): React.ReactNode {
        return (
            <div
                className="board"
                tabIndex={0}
                onKeyDown={this.onKeyDown}
            >
                {
                    this.props.board.edges.yRange().reverse().map((cy: number) => (
                        <div key={cy}>
                            {
                                this.props.board.edges.xRange().filter( // remove nonexistent
                                    (cx: number) => (cx + cy) % 2 === 0
                                ).map( // turn cartesian into hex
                                    (cx: number) => HexCoord.getCart(cx, cy)
                                ).filter( // only in-bounds
                                    (coord: HexCoord) => this.props.board.inBounds(coord)
                                ).map(
                                    (coord: HexCoord) => (
                                        <OldGridSpotView
                                            spot={this.props.board.getSpot(coord)}
                                            key={coord.id}
                                            selected={coord === this.props.cursor}
                                            onSelect={() => this.props.onPlaceCursor(coord)}
                                            coord={coord}
                                        />
                                    )
                                )
                            }
                        </div>
                    ))
                }
            </div>
        );
    }
}

interface SpotProps {
    spot: Spot;
    selected: boolean;
    coord: HexCoord;

    onSelect?: () => void;
}

const spotStyle = (props: SpotProps) =>
    (props.selected ? 'active ' : '') + 'spot ' + props.spot.owner;

export const OldGridSpotView = (props: SpotProps) => (
    <span
        className={spotStyle(props)}
        title={props.spot.owner + ' - ' + props.coord.toString(true)}
        // onClick={props.onSelect}
        onClick={(/*e*/) => props.onSelect && props.onSelect()}
    >
        {props.spot.pop}
    </span>
);
