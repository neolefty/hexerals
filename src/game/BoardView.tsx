import * as React from 'react';
import { Board, Spot } from './GameModel';
import './Board.css';

export interface BoardProps {
    board?: Board;
    cursor?: number;

    onMovePlayer?: (delta: number) => void;
    onPlaceCursor?: (position: number) => void;
}

export const BoardView = (props: BoardProps) => (
    <div
        className="board"
        tabIndex={0}
        onKeyDown={(e/*: KeyboardEvent*/) => {
            if (props.onMovePlayer) {
                let move = NaN;
                if (e.key === 'ArrowLeft') move = -1;
                else if (e.key === 'ArrowRight') move = 1;
                if (move && (props.cursor === 0 || props.cursor)) {
                    const dest = move + props.cursor;
                    if (dest >= 0 && props.board && dest < props.board.positions.size) {
                        props.onMovePlayer(move);
                        e.preventDefault();
                    }
                }
            }
        }}
    >
        {
            props.board && props.board.positions.map((spot, i) => (
                <SpotView
                    spot={spot}
                    key={i}
                    selected={i === props.cursor}
                    onSelect={() => props.onPlaceCursor && props.onPlaceCursor(i)}
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
