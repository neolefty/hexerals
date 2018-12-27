import * as React from 'react'
import {HexBoardView} from './HexBoardView'
import {Ticker} from '../../../common/Ticker'
import {BoardViewProps} from './BoardViewBase';
import {LocalGameOptions} from '../../cycle/LocalGameOptions';
import {FogBoardView} from './FogBoardView';

export interface TickerBoardViewProps extends BoardViewProps {
    tickMillis: number
    localOptions: LocalGameOptions
    onStep: () => void
}

export const TickerBoardView = (props: TickerBoardViewProps) => (
    <Ticker tick={props.onStep} tickMillis={props.tickMillis}>{
        props.localOptions.fog > 0
            ? (<FogBoardView {...props} />)
            : (<HexBoardView {...props} />)
    }</Ticker>
)