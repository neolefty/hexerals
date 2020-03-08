import * as React from "react"
import {useMemo, useState} from "react"
import {AssertNever} from "../../../common/AssertNever"
import {Layered} from '../../../common/Layered'
import {LocalGameOptions} from '../../model/board/LocalGameOptions'
import {CycleMode, CycleState} from '../../model/cycle/CycleState'
import {LocalGamePreview} from '../preview/LocalGamePreview'
import {LocalGameContainer} from './LocalGameContainer'
import {ChangePreviewOption, LocalGameOptionsView} from './LocalGameOptionsView'

export interface CycleViewProps extends CycleState, CycleViewActions {}

export type ChangeLocalOption = (name: keyof LocalGameOptions, n: number) => void

export interface CycleViewActions {
    onOpenLocalGame: () => void
    onChangeLocalOption: ChangeLocalOption
}

export const CycleView = (props: CycleViewProps) => {
    // Render a detailed preview (true, slow) or a rough one (false, fast)?
    const [ highFidelity, setHighFidelity ] = useState<boolean>(true)
    const makeHandler = (): ChangePreviewOption => (name, n, highFidelity) => {
        setHighFidelity(highFidelity)
        props.onChangeLocalOption(name, n)
    }
    const handleChangePreview = useMemo<ChangePreviewOption>(
        makeHandler,
        [setHighFidelity, props.onChangeLocalOption],
    )

    switch (props.mode) {
        case CycleMode.IN_LOCAL_GAME:
            if (props.localGame)
                return (
                    <LocalGameContainer />
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
                        highFidelity={highFidelity}
                    />
                    <LocalGameOptionsView
                        localOptions={props.localOptions}
                        newGame={props.onOpenLocalGame}
                        changeLocalOption={handleChangePreview}
                    />
                </Layered>
            )
        default:
            return AssertNever(props.mode)
    }
}
