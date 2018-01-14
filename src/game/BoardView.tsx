import { Map } from 'immutable';
import { Component, KeyboardEvent } from 'react';
import * as React from 'react';
import { HexCoord } from './Hex';
import { Spot, HexBoard } from './HexBoard';
import './Board.css';

export interface BoardProps {
    board: HexBoard;
    cursor: HexCoord;

    onMovePlayer: (delta: HexCoord) => void;
    onPlaceCursor: (position: HexCoord) => void;
}

const KEY_CONTROLS: Map<string, HexCoord> = Map({
    'ArrowLeft': HexCoord.LEFT,
    'ArrowRight': HexCoord.RIGHT,
    'a': HexCoord.LEFT,
    'f': HexCoord.RIGHT,
    'w': HexCoord.LEFT_UP,
    'e': HexCoord.RIGHT_UP,
    's': HexCoord.LEFT_DOWN,
    'd': HexCoord.RIGHT_DOWN,
});

// TODO enable way to find SpotView based on coord? Or is that only useful for testing?
export class BoardView extends Component<BoardProps> {
    constructor(props: BoardProps) {
        super(props);
        this.onKeyDown = this.onKeyDown.bind(this);
    }

    render(): React.ReactNode {
        return (
            <div
                className="board"
                tabIndex={0}
                onKeyDown={this.onKeyDown}
            >
                {
                    this.props.board.edges.yRange().map((cy: number) => (
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
                                        <SpotView
                                            spot={this.props.board.getSpot(coord)}
                                            key={coord.id}
                                            selected={coord === this.props.cursor}
                                            onSelect={() => this.props.onPlaceCursor(coord)}
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

interface SpotProps {
    spot: Spot;
    selected: boolean;

    onSelect?: () => void;
}

const spotStyle = (props: SpotProps) =>
    (props.selected ? 'active ' : '') + 'spot ' + props.spot.owner;

export const SpotView = (props: SpotProps) => (
    <span
        className={spotStyle(props)}
        title={props.spot.owner}
        // onClick={props.onSelect}
        onClick={(/*e*/) => props.onSelect && props.onSelect()}
    >
        {props.spot.pop}
    </span>
);
