import * as React from 'react'

import {Layered} from '../../../common/Layered'
import {isDefeat, isVictory} from '../../model/board/BoardState'
import {TickerGameView, TickerGameViewProps} from '../board/TickerGameView'
import {Defeat, Victory} from './GamePhaseView'

export const LocalGameView = (
    props: TickerGameViewProps
) => (
    <Layered>
        <TickerGameView {...props} />
        {
            isVictory(props.boardState)
                ? <Victory{...props}/>
                : undefined
        }
        {
            isDefeat(props.boardState)
                ? <Defeat{...props}/>
                : undefined
        }
    </Layered>
)
