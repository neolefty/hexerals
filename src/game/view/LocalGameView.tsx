import * as React from 'react'
import {TickerGameView, TickerGameViewProps} from './TickerGameView'
import {Defeat, Victory} from './GamePhaseView'
import {isDefeat, isVictory} from '../model/board/BoardState';
import {Layered} from '../../common/Layered';

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
