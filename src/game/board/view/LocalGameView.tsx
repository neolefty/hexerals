import * as React from 'react'
import {TickerBoardView, TickerBoardViewProps} from './TickerBoardView'
import {Layered} from '../../../common/Layered'
import {GamePhase} from '../model/GamePhase'
import {Defeat, Victory} from './GamePhaseView'

const curPlayerTileCount = (props: TickerBoardViewProps) => (
    props.boardState.curPlayer !== undefined
    && props.boardState.board.getTileStatistics()
        .get(props.boardState.curPlayer, 0)
) || 0

export const LocalGameView = (
    props: TickerBoardViewProps
) => (
    <Layered>
        <TickerBoardView {...props} />
        {
            props.boardState.phase === GamePhase.Ended
            && curPlayerTileCount(props) > 0
                ? <Victory{...props}/>
                : undefined
        }
        {
            curPlayerTileCount(props) === 0
                ? <Defeat{...props}/>
                : undefined
        }
    </Layered>
)
