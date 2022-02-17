import * as React from "react"
import {useCallback, useMemo, useState} from "react"
import {AssertNever} from "../../../common/AssertNever"
import {Layered} from '../../../common/Layered'
import {useNavTo} from "../../../common/NavButton"
import {ROUTE_LOCAL_GAME} from "../../../old/main/Main"
import {useMainDispatch, useMainState} from "../../../old/main/MainStateContext"
import {LocalGameOptions} from '../../model/board/LocalGameOptions'
import {doChangeLocalOption, doOpenLocalGame} from "../../model/cycle/CycleAction"
import {IN_LOCAL_GAME, NOT_IN_GAME} from '../../model/cycle/CycleState'
import {LocalGamePreview} from '../preview/LocalGamePreview'
import {LocalGameContainer} from './LocalGameContainer'
import {ChangePreviewOption, LocalGameOptionsView} from './LocalGameOptionsView'

export type ChangeLocalOption = (name: keyof LocalGameOptions, n: number) => void

export interface CycleViewActions {
    onOpenLocalGame: () => void
    onChangeLocalOption: ChangeLocalOption
}

export const CycleView = () => {
    const {cycle} = useMainState()

    switch (cycle.mode) {
        case IN_LOCAL_GAME:
            return cycle.localGame
                ? <LocalGameContainer/>
                : <code>Error: localGame.board is undefined</code>
        case NOT_IN_GAME:
            return <LocalGameOptionsPage/>
        default:
            return AssertNever(cycle.mode)
    }
}

export const LocalGameOptionsPage = () => {
    const dispatch = useMainDispatch()
    const {cycle} = useMainState()
    const navToGame = useNavTo(ROUTE_LOCAL_GAME)
    const handleOpenLocalGame = useCallback(() => {
        dispatch(doOpenLocalGame())
        navToGame()
    }, [dispatch, navToGame])
    const handleChangeLocalOption = useCallback((name: keyof LocalGameOptions, n: number) =>
        dispatch(doChangeLocalOption(name, n)), [dispatch])

    // Render a detailed preview (true, slow) or a rough one (false, fast)?
    const [ highFidelity, setHighFidelity ] = useState<boolean>(true)
    const handleChangePreview = useMemo<ChangePreviewOption>(
        (): ChangePreviewOption => (name, n, highFidelity) => {
            setHighFidelity(highFidelity)
            handleChangeLocalOption(name, n)
        },
        [setHighFidelity, handleChangeLocalOption],
    )

    return (
        <Layered>
            <LocalGamePreview
                localOptions={cycle.localOptions}
                highFidelity={highFidelity}
            />
            <LocalGameOptionsView
                localOptions={cycle.localOptions}
                onNewGame={handleOpenLocalGame}
                onResume={cycle.mode === IN_LOCAL_GAME ? navToGame : undefined}
                onChangeLocalOption={handleChangePreview}
            />
        </Layered>

    )
}
