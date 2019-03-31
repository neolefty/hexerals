import * as React from 'react'

import {BoardState} from '../model/board/BoardState'
import {StatHistory} from '../model/stats/StatHistory'

interface HistoryGraphProps {
    boardState: BoardState
}

export const HistoryGraph = (props: HistoryGraphProps) => {
    const [history, updateHistory] = React.useState(StatHistory.EMPTY)
    const newHistory = history.update(props.boardState)
    if (newHistory !== history)
        updateHistory(newHistory)

    return (
        <text>Graph</text>
    )
}
