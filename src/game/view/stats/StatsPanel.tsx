import * as React from 'react'

import {HistoryGraph} from './HistoryGraph'
import {Map} from 'immutable'
import {DriftColor} from '../../../color/DriftColor'
import {Player} from '../../model/players/Players'
import {CartPair} from '../../../common/CartPair'
import {BoardState} from '../../model/board/BoardState'
import {Faces} from './Faces'
import {CSSProperties} from 'react'

export interface StatsPanelProps {
    boardState: BoardState
    displaySize: CartPair
    colors: Map<Player, DriftColor>
    flipped: boolean
    onTogglePosition: () => void
}

const toggleButtonStyle = (props: StatsPanelProps): CSSProperties => {
    const result: CSSProperties = {
        position: "absolute",
        visibility: "hidden",
    }
    if (props.displaySize.isVertical) {
        result[props.flipped ? 'left' : 'right'] = 0
        result['bottom'] = 0
    }
    else {
        result[props.flipped ? 'top' : 'bottom'] = 0
        result['left'] = 0
    }
    return result
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
            <Faces
                {...props}
                faceText={(stat, player) => `${stat.pop.get(player, 0)}`}
                superTitle={'pop'}
            />
        </svg>
        <button
            onClick={props.onTogglePosition}
            style={toggleButtonStyle(props)}
        >
            toggle
        </button>
    </>
)