import * as React from 'react'
import {TickerBoardView, TickerBoardViewProps} from './TickerBoardView'
import {Layered} from '../../../common/Layered'
import {Defeat, Victory} from './GamePhaseView'
import {isDefeat, isVictory} from '../model/BoardState';

export const LocalGameView = (
    props: TickerBoardViewProps
) => (
    <Layered>
        <TickerBoardView {...props} />
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
