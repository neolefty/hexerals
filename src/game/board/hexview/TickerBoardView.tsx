import * as React from 'react'
import {BoardView, BoardViewProps} from './BoardView'
import {Ticker} from '../../../common/Ticker'

export interface TickerBoardViewProps extends BoardViewProps {
    tickMillis: number,
    onDoMoves: () => void,
}

export const TickerBoardView = (props: TickerBoardViewProps) => (
    <Ticker
        tick={props.onDoMoves}
        tickMillis={props.tickMillis}
    >
        <BoardView
            {...props}
        />
    </Ticker>
)