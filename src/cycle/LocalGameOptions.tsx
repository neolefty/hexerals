import * as React from 'react';
import Dimension from '../Dimension';

export interface LocalGameOptions {
    boardSize: Dimension;
    numPlayers: number;
    tickMillis: number;
}

export interface LocalGameOptionsViewProps {
    numPlayers: number;
    tickMillis: number;
    changeNumPlayers: (x: number) => void;
    changeTickMillis: (x: number) => void;
    newGame: () => void;
}

export const LocalGameOptionsView = (props: LocalGameOptionsViewProps) => (
    <div>
        <IntInput
            label="Players"
            value={props.numPlayers}
            min={1}
            max={10}
            onChange={x => props.changeNumPlayers(x)}
        />
        <br/>
        <IntInput
            label="Tick"
            value={props.tickMillis}
            min={1}
            max={4000}
            onChange={x => props.changeTickMillis(x)}
        />
        <button onClick={props.newGame}>Start Game</button>
    </div>
);

interface IntInputProps {
    label: string;
    value: number;
    onChange: (x: number) => void;
    min: number,
    max: number,
}

const IntInput = (props: IntInputProps) => (
    <label>{props.label}:
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
