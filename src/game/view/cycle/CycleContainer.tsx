import React from "react"
import {useMainDispatch, useMainState} from "../../../main/MainStateContext"
import {LocalGameOptions} from '../../model/board/LocalGameOptions'
import {doChangeLocalOption, doOpenLocalGame} from "../../model/cycle/CycleAction"
import {CycleDispatch, } from '../../model/cycle/CycleReducer'
import {CycleView, CycleViewActions} from './CycleView'

const mapDispatchToCycleViewProps = (dispatch: CycleDispatch): CycleViewActions => ({
    onOpenLocalGame: () => dispatch(doOpenLocalGame()),
    onChangeLocalOption: (name: keyof LocalGameOptions, n: number) =>
        dispatch(doChangeLocalOption(name, n)),
})

export const CycleContainer = () => {
    const dispatch = useMainDispatch()
    const {cycle} = useMainState()
    return (
        <CycleView
            {...cycle}
            {...mapDispatchToCycleViewProps(dispatch)}
        />
    )
}
