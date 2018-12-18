import Dimension from '../../common/Dimension'
import {LocalGameOptionsView} from './LocalGameOptions'
import {CycleMode} from './CycleState'
import {LocalGameContainer} from './LocalGameContainer'
import * as React from 'react'
import {CycleState} from './CycleState'

export interface CycleViewProps extends CycleState {
    displaySize: Dimension

    onOpenLocalGame: () => void
    onCloseGame: () => void
    onChangeNumPlayers: (n: number) => void
    onChangeTickMillis: (ms: number) => void
    onChangeBoardSize: (d: Dimension) => void
}

export const CycleView = (props: CycleViewProps) => {
    switch (props.mode) {
        case CycleMode.IN_LOCAL_GAME:
            if (props.localGame)
                return (
                    <LocalGameContainer
                        displaySize={props.displaySize}
                        onEndGame={props.onCloseGame}
                    />
                )
            else
                return (
                    <code>Error: localGame.board is undefined</code>
                )
        case CycleMode.NOT_IN_GAME:
            return (
                <LocalGameOptionsView
                    numPlayers={props.localOptions.numPlayers}
                    tickMillis={props.localOptions.tickMillis}
                    boardSize={props.localOptions.boardSize}
                    displaySize={props.displaySize}

                    newGame={props.onOpenLocalGame}
                    changeNumPlayers={props.onChangeNumPlayers}
                    changeTickMillis={props.onChangeTickMillis}
                    changeBoardSize={props.onChangeBoardSize}
                />
            )
        default:
            return <p>Unknown mode: <code>{props.mode}</code></p>
    } 
}