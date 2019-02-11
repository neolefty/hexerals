import * as React from 'react'
import {HexBoardView} from './HexBoardView'
import {Ticker} from '../../../common/Ticker'
import {BoardViewProps} from './BoardViewBase';
import {LocalGameOptions} from './LocalGameOptions';

export interface TickerBoardViewProps extends BoardViewProps {
    tickMillis: number
    localOptions: LocalGameOptions
    onStep: () => void
}

export const TickerBoardView = (props: TickerBoardViewProps) => (
    <Ticker tick={props.onStep} tickMillis={props.tickMillis}>
        <HexBoardView {...props} />
    </Ticker>
)