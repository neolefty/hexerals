import * as React from 'react'

import {BoardState} from '../model/board/BoardState'
import {StatHistory} from '../model/stats/StatHistory'
import {CartPair} from '../../common/CartPair'

interface HistoryGraphProps {
    boardState: BoardState
    displaySize: CartPair
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
