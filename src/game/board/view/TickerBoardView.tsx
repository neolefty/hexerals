import * as React from 'react'
import {HexBoardView} from './HexBoardView'
import {Ticker} from '../../../common/Ticker'
import {BoardViewProps} from './BoardViewBase';

export interface TickerBoardViewProps extends BoardViewProps {
    tickMillis: number,
    onDoMoves: () => void,
    onStepPop: () => void,
}

export const TickerBoardView = (props: TickerBoardViewProps) => (
    <Ticker
        tick={() => {
            props.onDoMoves()
            // TODO test that step pop comes after do moves
            props.onStepPop()
        }}
        tickMillis={props.tickMillis}
    >
        <HexBoardView
            {...props}
        />
    </Ticker>
)