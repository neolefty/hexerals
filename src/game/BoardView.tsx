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
                let move = 0;
                if (e.key === 'ArrowLeft') move = -1;
                else if (e.key === 'ArrowRight') move = 1;
                if (move) {
                    props.onMovePlayer(move);
                    e.preventDefault();
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

export const SpotView = (props: SpotProps) => (
    <span
        className={props.selected ? 'active spot' : 'spot'}
        title={props.spot.owner.name}
        // onClick={props.onSelect}
        onClick={(/*e*/) => props.onSelect && props.onSelect()}
    >
        {props.spot.pop}
    </span>
);
