import * as React from 'react';
import Dimension from '../Dimension';

export interface LocalGameOptions {
    numPlayers: number;
    boardSize: Dimension;
}

export interface LocalGameOptionsViewProps {
    numPlayers: number;
    changeNumPlayers: (x: number) => void;
    newGame: () => void;
}

export const LocalGameOptionsView = (props: LocalGameOptionsViewProps) => (
    <div>
        // TODO input
        <IntInput
            label="Players:"
            value={props.numPlayers}
            onChange={x => props.changeNumPlayers(x)}
        />
        <button onClick={props.newGame}>Start Game</button>
    </div>
);

interface NumPlayersInput {
    label: string;
    value: number;
    onChange: (x: number) => void;
}

const IntInput = (props: NumPlayersInput) => (
    <label>{props.label}:
        <input
            type="number"
            min="0"
            max="10"
            step="1"
            value={props.value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const str = e.currentTarget.value;
                if (str) props.onChange(parseInt(str, 10));
            }}
        />
    </label>
);
