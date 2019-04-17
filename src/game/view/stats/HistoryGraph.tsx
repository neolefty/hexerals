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
        </>
    )
}