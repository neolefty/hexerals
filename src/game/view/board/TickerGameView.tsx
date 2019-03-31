import * as React from 'react'

import {Ticker} from '../../../common/Ticker'
import {LocalGameOptions} from '../../model/cycle/LocalGameOptions'
import {BoardViewProps} from './BoardViewBase'
import {BoardAndStats} from './BoardAndStats'

export interface TickerGameViewProps extends BoardViewProps {
    tickMillis: number
    localOptions: LocalGameOptions
    onStep: () => void
}

export const TickerGameView = (props: TickerGameViewProps) => (
    <Ticker tick={props.onStep} tickMillis={props.tickMillis}>
        <BoardAndStats
            {...props}
            statsVisible={props.localOptions.statsVisible !== 0}
        />
    </Ticker>
)