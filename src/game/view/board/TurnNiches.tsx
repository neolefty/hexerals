import {BoardViewProps} from './BoardViewBase'
import {NicheText} from '../hex/NicheView'
import * as React from 'react'

export const TurnNiches = (props: BoardViewProps) => {
    const board = props.boardState.board
    const perceivedTurn = board.perceivedTurn(props.boardState.turn)
    const turnDescription = `Turn #${perceivedTurn}`
    const coordsHeight = board.edges.height
    return (
        <>{
            (perceivedTurn <= 0) ? undefined : (
                <>
                    <NicheText
                        hex={board.niches.ll}
                        topHalf={true}
                        boardHeight={coordsHeight}
                        text={perceivedTurn}
                        title={turnDescription}
                    />
                    <NicheText
                        hex={board.niches.ur}
                        topHalf={false}
                        boardHeight={coordsHeight}
                        text={perceivedTurn}
                        title={turnDescription}
                    />
                </>
            )
        }</>
    )
}