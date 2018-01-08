import { Map } from 'immutable';
import * as React from 'react';
import { HexCoord } from './Hex';
import { Spot, HexBoard } from './HexBoard';
import './Board.css';

export interface BoardProps {
    board: HexBoard;
    cursor: HexCoord;

    onMovePlayer?: (delta: HexCoord) => void;
    onPlaceCursor?: (position: HexCoord) => void;
}

const KEY_CONTROLS: Map<string, HexCoord> = Map({
    'ArrowLeft': HexCoord.LEFT,
    'ArrowRight': HexCoord.RIGHT,
});

// TODO enable way to find SpotView based on coord? Or is that only useful for testing?
export const BoardView = (props: BoardProps) => (
    <div
        className="board"
        tabIndex={0}
        onKeyDown={(e/*: KeyboardEvent*/) => {
            if (props.onMovePlayer) {
                let delta = HexCoord.NONE;
                if (e.key in KEY_CONTROLS)
                    delta = KEY_CONTROLS.get(e.key);
                if (delta !== HexCoord.NONE && props.cursor !== HexCoord.NONE) {
                    const dest = props.cursor.plus(delta);
                    if (props.board.inBounds(dest)) {
                        props.onMovePlayer(delta);
                        e.preventDefault();
                    }
                }
            }
        }}
    >
        // TODO lay out in a hex grid instead of hash-ordered line
        {
            props.board && props.board.spots.map((spot, coord) => (
                <SpotView
                    spot={spot}
                    selected={coord === props.cursor}
                    // TODO consider implementing HexCoord.toString() as [x,y,z] or at least check that it's what we want
                    key={coord.toString()}
                    onSelect={() => props.onPlaceCursor && props.onPlaceCursor(coord)}
                />
            ))
        }
    </div>
);

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
