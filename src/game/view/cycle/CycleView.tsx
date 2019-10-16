import * as React from "react"
import {useState} from "react"
import {AssertNever} from "../../../common/AssertNever"
import {Layered} from '../../../common/Layered'
import {useDisplaySize} from "../../../common/ViewSizeContext"
import {LocalGameOptions} from '../../model/board/LocalGameOptions'
import {CycleMode, CycleState} from '../../model/cycle/CycleState'
import {LocalGamePreview} from '../preview/LocalGamePreview'
import {LocalGameContainer} from './LocalGameContainer'
import {LocalGameOptionsView} from './LocalGameOptionsView'

export interface CycleViewProps extends CycleState {
    onOpenLocalGame: () => void
    onChangeLocalOption: (
        name: keyof LocalGameOptions, n: number
    ) => void
}

export const CycleView = (props: CycleViewProps) => {
    const displaySize = useDisplaySize()
    // Render a detailed preview (true, slow) or a rough one (false, fast)?
    const [ highFidelity, setHighFidelity ] = useState<boolean>(true)

    const changeLocalOption = (
        name: keyof LocalGameOptions, n: number, highFidelity: boolean
    ) => {
        setHighFidelity(highFidelity)
        props.onChangeLocalOption(name, n)
    }

    switch (props.mode) {
        case CycleMode.IN_LOCAL_GAME:
            if (props.localGame)
                return (
                    <LocalGameContainer
                        displaySize={displaySize}
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
                        displaySize={displaySize}
                        highFidelity={highFidelity}
                    />
                    <LocalGameOptionsView
                        localOptions={props.localOptions}
                        displaySize={displaySize}
                        newGame={props.onOpenLocalGame}
                        changeLocalOption={changeLocalOption}
                    />
                </Layered>
            )
        default:
            return AssertNever(props.mode)
    }
}