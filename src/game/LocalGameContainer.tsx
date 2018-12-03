import {Map} from 'immutable'
import {connect} from 'react-redux'
import {Dispatch} from 'redux'

import {HexCoord} from './Hex'
import {
    queueMoveAction, placeCursorAction, doMovesAction
} from './board/BoardReducer'
import {AppState} from '../App'
import Dimension from '../Dimension'
import {BoardState} from './board/BoardState'
import {DriftColor} from '../color/DriftColor'
import {ColorPodge} from '../color/ColorPodge'
import {Player, PLAYERS} from './Players'
import {PlayerMove} from './MovementQueue'
import {TickerBoardView} from './board/TickerBoardView';

export interface LocalGameProps {
    displaySize: Dimension
    onEndGame: () => void
}

// TODO stop updating if colors stabilize
const playerColors = (colors: ColorPodge): Map<Player, DriftColor> => {
    const im: Map<Player, DriftColor> = Map()
    const result = im.asMutable()
    // console.log(`podge = ${colors} -- ${colors.driftColors}`)
    colors.driftColors.forEach(
        (value: DriftColor, key: number) => {
            // console.log(`   - ${key} -- ${PLAYERS.get(key)} -- ${value.cie}`)
            result.set(PLAYERS.get(key), value)
        }
    )
    return result.asImmutable()
}

const mapStateToTickerBoardViewProps = (
    state: AppState, ownProps: LocalGameProps
) => ({
    boardState: state.cycle.localGame as BoardState, // assert it's not undefined
    displaySize: ownProps.displaySize,
    colors: playerColors(state.colors.colors),
    tickMillis: state.cycle.localOptions.tickMillis,
    onEndGame: ownProps.onEndGame,
})

const mapDispatchToBoardViewProps = (dispatch: Dispatch<BoardState>) => ({
    onQueueMove: (move: PlayerMove) => {
        dispatch(queueMoveAction(move))
    },
    onPlaceCursor: (position: HexCoord) => {
        dispatch(placeCursorAction(position))
    },
    onDoMoves: () => {
        dispatch(doMovesAction())
    },
})

export const LocalGameContainer = connect(
    mapStateToTickerBoardViewProps, mapDispatchToBoardViewProps
)(
    TickerBoardView
)
