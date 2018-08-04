import Dimension from '../Dimension';
import {LocalGameOptionsView} from './LocalGameOptions';
import {CycleMode} from './CycleState';
import {LocalGameContainer} from '../game/LocalGameContainer';
import * as React from 'react';
import {CycleState} from './CycleState';

export interface CycleViewProps extends CycleState {
    displaySize: Dimension;

    onOpenLocalGame: () => void;
    onCloseGame: () => void;
    onChangeNumPlayers: (n: number) => void;
}

export const CycleView = (props: CycleViewProps) => {
    switch (props.mode) {
        case CycleMode.IN_LOCAL_GAME:
            return props.localGame 
                ? <LocalGameContainer displaySize={props.displaySize}/>
                : <code>Error: localGame.board is undefined</code>;
        case CycleMode.NOT_IN_GAME:
            return (
                <LocalGameOptionsView
                    numPlayers={props.localOptions.numPlayers}
                    newGame={props.onOpenLocalGame}
                    changeNumPlayers={props.onChangeNumPlayers}
                />
            );
        default:
            return <p>Unknown mode: <code>{props.mode}</code></p>;
    } 
};
