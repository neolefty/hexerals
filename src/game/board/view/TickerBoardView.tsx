import * as React from 'react'
import {HexBoardView} from './HexBoardView'
import {Ticker} from '../../../common/Ticker'
import {BoardViewProps} from './BoardViewBase';

export interface TickerBoardViewProps extends BoardViewProps {
    tickMillis: number,
    onStep: () => void,
}

export const TickerBoardView = (props: TickerBoardViewProps) => (
    <Ticker
        tick={() => {
            props.onStep()
        }}
        tickMillis={props.tickMillis}
    >
        <HexBoardView
            {...props}
        />
    </Ticker>
)