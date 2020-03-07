import React from "react"
import {useMainDispatch, useMainState} from "../../../main/MainStateContext"
import {LocalGameOptions} from '../../model/board/LocalGameOptions'
import {changeLocalOptionAction, CycleDispatch, openLocalGameAction,} from '../../model/cycle/CycleReducer'
import {CycleView, CycleViewActions} from './CycleView'

const mapDispatchToCycleViewProps = (dispatch: CycleDispatch): CycleViewActions => ({
    onOpenLocalGame: () => dispatch(openLocalGameAction()),
    onChangeLocalOption: (name: keyof LocalGameOptions, n: number) =>
        dispatch(changeLocalOptionAction(name, n)),
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
