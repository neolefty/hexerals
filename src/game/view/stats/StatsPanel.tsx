import * as React from 'react'

import {HistoryGraph} from './HistoryGraph'
import {Map} from 'immutable'
import {DriftColor} from '../../../color/DriftColor'
import {Player} from '../../model/players/Players'
import {CartPair} from '../../../common/CartPair'
import {BoardState} from '../../model/board/BoardState'
import {Faces} from './Faces'

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
            <text
                x={20}
                y={props.displaySize.isVertical ? props.displaySize.y - 30 : 30}
                fill='#ccc'
            >
                {`${props.boardState.turn > 0 ? Math.floor(props.boardState.turn / 2) : ''}`}
            </text>
            <Faces
                {...props}
                faceText={(stat, player) => `${stat.pop.get(player, 0)}`}
                superTitle={'pop'}
            />
        </svg>
    </>
)