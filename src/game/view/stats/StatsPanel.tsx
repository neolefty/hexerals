import * as React from 'react'

import {HistoryGraph, HistoryGraphProps} from './HistoryGraph'
import {Map} from 'immutable'
import {DriftColor} from '../../../color/DriftColor'
import {Player} from '../../model/players/Players'
import {CartPair} from '../../../common/CartPair'
import {BoardState} from '../../model/board/BoardState'

export interface StatsPanelProps {
    boardState: BoardState
    displaySize: CartPair
    colors: Map<Player, DriftColor>
    onTogglePosition: () => void
}

export const StatsPanel = (props: StatsPanelProps) => (
    <>
        <svg
            {...props.displaySize.sizeStyle}
            style={{
                position: 'relative',
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
            }}
        >
            <HistoryGraph
                {...props}
                picker={(stat) => stat.hexes}
                stacked={true}
                area={true}
            />
        </svg>
    </>
)