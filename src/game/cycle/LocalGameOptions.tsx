import * as React from 'react'
import Dimension from '../../common/Dimension'
import './LocalGameOptions.css'

export interface LocalGameOptions {
    numPlayers: number;
    tickMillis: number;
    boardSize: Dimension;
}

export interface LocalGameOptionsViewProps extends LocalGameOptions {
    displaySize: Dimension;
    changeNumPlayers: (x: number) => void;
    changeTickMillis: (x: number) => void;
    changeBoardSize: (d: Dimension) => void;
    newGame: () => void;
}

export const LocalGameOptionsView = (props: LocalGameOptionsViewProps) => (
    <div
        className="LocalGameOptionsView"
        style={{
            width: props.displaySize.w,
            height: props.displaySize.h,
        }}
    >
        <IntInput
            label="Players"
            value={props.numPlayers}
            min={1}
            max={10}
            onChange={x => props.changeNumPlayers(x)}
        />
        <IntInput
            label="Tick"
            value={props.tickMillis}
            min={1}
            max={4000}
            onChange={x => props.changeTickMillis(x)}
        />
        <IntInput
            label="Width"
            value={props.boardSize.w}
            min={3}
            max={13}
            onChange={
                w => props.changeBoardSize(new Dimension(w, props.boardSize.h))
            }
        />
        <IntInput
            label="Height"
            value={props.boardSize.h}
            min={3}
            max={25}
            onChange={
                h => props.changeBoardSize(new Dimension(props.boardSize.w, h))
            }
        />
        <button
            onClick={props.newGame}
        >
            Start Game
        </button>
    </div>
);

interface IntInputProps {
    label: string;
    value: number;
    onChange: (x: number) => void;
    min: number;
    max: number;
}

const IntInput = (props: IntInputProps) => (
    <label
        className="IntInput"
    >
        {props.label}
        <input
            type="number"
            min={props.min}
            max={props.max}
            step="1"
            value={props.value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const str = e.currentTarget.value;
                if (str) props.onChange(parseInt(str, 10));
            }}
        />
    </label>
);
