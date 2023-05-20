import * as React from 'react'

import {TurnStat} from '../../model/stats/TurnStat'
import {Player} from '../../model/players/Players'
import {BoardStat} from '../../model/board/BoardStat'
import {StatsPoly} from './StatsPoly'
import {StatsPanelProps} from './StatsPanel'

export interface HistoryGraphProps extends StatsPanelProps {
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