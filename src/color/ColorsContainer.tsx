import React from "react"
import {useDisplaySize} from "../common/ViewSizeContext"
import {useMainDispatch, useMainState} from "../old/main/MainStateContext"

import {ColorsDiv} from './ColorsDiv'
import {addColorAction, ColorsActions, ColorsDispatch, divergeAction, removeColorAction,} from './ColorsReducer'

const TICK = 100 // milliseconds

const mapDispatchToProps = (dispatch: ColorsDispatch): ColorsActions => ({
    onAddColor: () => dispatch(addColorAction()),
    onRemoveColor: (x: number) => dispatch(removeColorAction(x)),
    onDiverge: () => dispatch(divergeAction()),
})

export const ColorsContainer = () => {
    const dispatch = useMainDispatch()
    const podge = useMainState().colors.colors
    const displaySize = useDisplaySize()
    return (
        <ColorsDiv
            {...mapDispatchToProps(dispatch)}
            colors={podge}
            displaySize={displaySize}
            tick={TICK}
        />
    )
}
