import * as React from 'react'
import {TickerBoardView, TickerBoardViewProps} from './TickerBoardView'
import {Layered} from '../../../common/Layered'
import {GamePhase} from '../model/GamePhase'
import {BeforeStart, Ended} from './GamePhaseView'

export const LocalGameView = (
    props: TickerBoardViewProps
) => (
    <Layered>
        {
            props.boardState.phase === GamePhase.BeforeStart
                ? <BeforeStart{...props}/> : undefined
        }
        {
            props.boardState.phase === GamePhase.Ended
                ? <Ended{...props}/> : undefined
        }
        <TickerBoardView {...props} />
    </Layered>
)
