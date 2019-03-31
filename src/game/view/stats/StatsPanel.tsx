import * as React from 'react'

import {CartPair} from '../../../common/CartPair'
import {BoardState} from '../../model/board/BoardState'
import {HistoryGraph} from './HistoryGraph'

export interface StatsPanelProps {
    boardState: BoardState
    onTogglePosition: () => void
    displaySize: CartPair
}

export const StatsPanel = (props: StatsPanelProps) => (
    <>
        <button onClick={props.onTogglePosition}>Toggle</button>
        <svg>
            <HistoryGraph {...props} />
        </svg>
    </>
)