import {Map} from 'immutable';
import * as React from 'react';
import {Component, KeyboardEvent} from 'react';
import {Board, Player} from './Board';
import './Board.css';
import {INITIAL_HEIGHT, INITIAL_WIDTH} from './Constants';
import {HexCoord} from './Hex';

interface BoardViewProps {
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
    readonly w: number;
    readonly h: number;
    readonly hexRadius: number;

    constructor(props: BoardViewProps) {
        super(props);
        this.w = 600;
        this.h = 1000;
        const widthMaxR = this.w / (INITIAL_WIDTH - 1 / 3) / 3;
        const heightMaxR = this.h / (INITIAL_HEIGHT + 1) / SQRT_3_HALF;
        this.hexRadius = Math.min(widthMaxR, heightMaxR);
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
        return (
            <div tabIndex={0} onKeyDown={this.onKeyDown}>
                <svg width={this.w} height={this.h}>
                    <rect x="0" y="0" width={this.w} height={this.h} className="mapBound" />
                    <HexFilterBoardView
                        filter={this.filterNobody}
                        hexRadius={this.hexRadius}
                        height={this.h}
                        key={'nobody'}
                        {...this.props}
                    />
                    <HexFilterBoardView
                        filter={this.filterPlayer}
                        hexRadius={this.hexRadius}
                        height={this.h}
                        key={'player'}
                        {...this.props}
                    />
                    <HexFilterBoardView
                        filter={this.filterCursor}
                        hexRadius={this.hexRadius}
                        height={this.h}
                        key={'compy'}
                        {...this.props}
                    />
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

const SQRT_3_HALF = 0.866; // 0.8660254;

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
                    // TODO: draw empty first,  then filled,  then cursor
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
                                centerY={this.props.height - (hex.cartY() + 1) * this.props.hexRadius * SQRT_3_HALF}
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
    const hexHalfHeight = hexRadius * SQRT_3_HALF;
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
        <text
            x={props.centerX}
            y={props.centerY + 0.35 * SQRT_3_HALF * props.hexRadius}
            fontFamily="Sans-Serif"
            fontSize={props.hexRadius * 0.9}
            textAnchor="middle"
        >
            {props.contents}
        </text>
    </g>
);
