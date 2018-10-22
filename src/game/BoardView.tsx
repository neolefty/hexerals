import * as React from 'react';
import {List, Map} from 'immutable';
import {Component, KeyboardEvent} from 'react';
import {Board} from './Board';
import './Board.css';
import {HexCoord} from './Hex';
import Dimension from '../Dimension';
import {DriftColor} from '../color/DriftColor';
import {Player} from './Players';
import {HexMove, MovementQueue, PlayerMove} from './MovementQueue';

export interface BoardViewActions {
    onQueueMove: (move: PlayerMove) => void;
    onPlaceCursor: (position: HexCoord) => void;
    onNewGame: (board: Board) => void;
}

interface BoardViewProps extends BoardViewActions {
    board: Board;
    cursor: HexCoord;
    moves: MovementQueue;
    displaySize: Dimension;
    curPlayer: Player | undefined;
    // messages: List<StatusMessage>; // TODO this is provided, but is it relevant to BoardView?
    // colors?: List<DriftColor>;
    // this would be more apropos, but it slows things down with re-computations
    colors?: Map<Player, DriftColor>;
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

export const BoardView = (props: BoardViewProps) =>
    <HexBoardView {...props}/>;

export class BoardViewBase extends Component<BoardViewProps> {
    constructor(props: BoardViewProps) {
        super(props);
        this.onKeyDown = this.onKeyDown.bind(this);
    }

/*
    shouldComponentUpdate(
        nextProps: Readonly<BoardViewProps>,
        nextState: Readonly<{}>,
        nextContext: any,
    ): boolean {
        return (
            nextProps.cursor !== this.props.cursor
            || nextProps.colors !== this.props.colors
            || !nextProps.displaySize.equals(this.props.displaySize)
            || nextProps.board !== this.props.board
        );
    }
*/

    onKeyDown(e: KeyboardEvent<HTMLDivElement>): void {
        if (this.props.cursor !== HexCoord.NONE && this.props.curPlayer) {
            const delta = KEY_CONTROLS.get(e.key, HexCoord.NONE);
            if (delta !== HexCoord.NONE) {
                this.props.onQueueMove(
                    PlayerMove.construct(this.props.curPlayer, this.props.cursor, delta)
                );
                this.props.onPlaceCursor(this.props.cursor.plus(delta));
                e.preventDefault();
            }
        }
    }
}

export class HexBoardView extends BoardViewBase {
    constructor(props: BoardViewProps) {
        super(props);
        // console.log(`colors: ${props.colors}`);
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
                    <rect
                        width={scaleWidth}
                        height={scaleHeight}
                        stroke="white"
                        strokeWidth="3"
                    />
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
                    <MovementQueueView
                        moves={this.props.moves}
                        colors={this.props.colors as Map<Player, DriftColor>}
                        players={this.props.board.players}
                        boardHeight={this.props.board.edges.height}
                    />
                </svg>
            </div>
        );
    }
}

interface FilterBoardViewProps extends BoardViewProps {
    filter: (hex: HexCoord) => boolean;
}

const centerX = (cartX: number): number => 45 * cartX + 30;
const centerY = (height: number, cartY: number): number => height - (cartY + 1) * 26;
const viewBoxHeight = (boardHeight: number): number => (boardHeight + 1) * 26;

class HexFilterBoardView extends Component<FilterBoardViewProps> {
    constructor(props: FilterBoardViewProps) {
        super(props);
    }

    render(): React.ReactNode {
        const height = viewBoxHeight(this.props.board.edges.height);
        // TODO look into SVGFactory / SVGElement
        return (
            <g id="hexMap"> {
                this.props.board.constraints.all().filter(
                    this.props.filter
                ).map(hex => {
                    const spot = this.props.board.getSpot(hex);
                    const ox = centerX(hex.cartX());
                    const oy = centerY(height, hex.cartY());
                    const color: DriftColor | undefined
                        = this.props.colors && this.props.colors.get(spot.owner);
                    return (
                        <FlatTopHex
                            key={hex.id}
                            color={color}
                            owner={spot.owner}
                            selected={hex === this.props.cursor}
                            centerX={ox}
                            centerY={oy}
                            hexRadius={30}
                            onSelect={() => this.props.onPlaceCursor(hex)}
                            contents={spot.pop === 0 ? '' : `${spot.pop}`}
                        >
                            {
                                spot.pop === 0 ? undefined :
                                    <text
                                        x={ox}
                                        y={oy + 0.35 * 26}
                                        fontFamily="Sans-Serif"
                                        fontSize={27}
                                        textAnchor="middle"
                                        fill={color ? color.contrast().toHexString() : '#fff'}
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
    color?: DriftColor;
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
            style={
                props.color && {
                    fill: props.color.toHexString()
                }
            }
        />
        {props.children && <g>{props.children}</g>}
    </g>
);

interface MovementQueueViewProps {
    moves: MovementQueue;
    colors: Map<Player, DriftColor>;
    players: List<Player>;
    boardHeight: number;
}

const MovementQueueView = (props: MovementQueueViewProps) => (
    <g id="movementQueue"> {
        props.moves.playerQueues.map(
            (moveList: List<HexMove>, player: Player) => {
                return (
                    <g key={player.valueOf()}>
                        <MoveListView
                            moveList={moveList}
                            color={props.colors.get(player)}
                            boardHeight={props.boardHeight}
                        />
                    </g>
                );
            }
        ).toArray() // is there a direct way to map to an iterator (like a list) rather than a map?
    }
    </g>
);

interface MoveListViewProps {
    moveList: List<HexMove>;
    color?: DriftColor;
    boardHeight: number;
}

const MoveListView = (props: MoveListViewProps) => (
     <g> {
         props.moveList.map((move: HexMove, key: number) =>
             <MoveView
                 key={key}
                 color={props.color}
                 boardHeight={props.boardHeight}
                 move={move}
             />
         )
     }
     </g>
);

interface MoveViewProps {
    move: HexMove;
    color?: DriftColor;
    boardHeight: number;
}

const MoveView = (props: MoveViewProps) => {
    const x1 = centerX(props.move.source.cartX());
    const x2 = centerX(props.move.dest.cartX());
    const h = viewBoxHeight(props.boardHeight);
    const y1 = centerY(h, props.move.source.cartY());
    const y2 = centerY(h, props.move.dest.cartY());
    return (
        <polygon
            points={`${x1},${y1} ${x2},${y2}`}
            style={props.color && {
                stroke: props.color.toHexString(),
                strokeWidth: 3,
            }}
        />
    );
};
