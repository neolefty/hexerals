import {CartPair} from '../../../common/CartPair'
import {LocalGameOptionsView} from './LocalGameOptions'
import {CycleMode} from '../model/CycleState'
import {LocalGameContainer} from './LocalGameContainer'
import * as React from 'react'
import {CycleState} from '../model/CycleState'
import {Layered} from '../../../common/Layered'
import {LocalGamePreview} from './LocalGamePreview'

export interface CycleViewProps extends CycleState {
    displaySize: CartPair

    onOpenLocalGame: () => void
    onCloseGame: () => void
    onChangeLocalOption: (name: string, n: number) => void
}

export const CycleView = (props: CycleViewProps) => {
    switch (props.mode) {
        case CycleMode.IN_LOCAL_GAME:
            if (props.localGame)
                return (
                    <LocalGameContainer
                        displaySize={props.displaySize}
                        onEndGame={props.onCloseGame}
                        localOptions={props.localOptions}
                    />
                )
            else
                return (
                    <code>Error: localGame.board is undefined</code>
                )
        case CycleMode.NOT_IN_GAME:
            return (
                <Layered>
                    <LocalGamePreview
                        localOptions={props.localOptions}
                        displaySize={props.displaySize}
                    />
                    <LocalGameOptionsView
                        localOptions={props.localOptions}
                        displaySize={props.displaySize}
                        newGame={props.onOpenLocalGame}
                        changeLocalOption={props.onChangeLocalOption}
                    />
                </Layered>
            )
        default:
            return <p>Unknown mode: <code>{props.mode}</code></p>
    } 
}
