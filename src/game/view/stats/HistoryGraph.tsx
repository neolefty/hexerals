import * as React from 'react'
import {List, Map} from 'immutable'

import {CartPair} from '../../../common/CartPair'
import {BoardState} from '../../model/board/BoardState'
import {TurnStat} from '../../model/stats/TurnStat'
import {Player} from '../../model/players/Players'
import {DriftColor} from '../../../color/DriftColor'
import {BoardStat} from '../../model/board/BoardStat'
import {StatsPoly} from './StatsPoly'

export interface HistoryGraphProps {
    boardState: BoardState
    displaySize: CartPair
    colors: Map<Player, DriftColor>
    picker: StatPicker
    stacked: boolean
    area: boolean // if false, draw lines instead
}

type StatPicker = (stat: TurnStat) => BoardStat<Player>

export const HistoryGraph = (props: HistoryGraphProps) => {
    return (
        <>
            {new StatsPoly(props).polys}
            <text
                x={20}
                y={props.displaySize.isVertical ? props.displaySize.y - 30 : 30}
                fill='#ccc'
            >
                {`${props.boardState.turn > 0 ? Math.floor(props.boardState.turn / 2) : ''}`}
            </text>
        </>
    )
}