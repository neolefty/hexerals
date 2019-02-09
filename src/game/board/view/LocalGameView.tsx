import * as React from 'react'
import {TickerBoardView, TickerBoardViewProps} from './TickerBoardView'
import {Layered} from '../../../common/Layered'
import {GamePhase} from '../model/GamePhase'
import {Ended} from './GamePhaseView'

export const LocalGameView = (
    props: TickerBoardViewProps
) => (
    <Layered>
        <TickerBoardView {...props} />
        {
            props.boardState.phase === GamePhase.Ended
                ? <Ended{...props}/>
                : undefined
        }
    </Layered>
)
