import {Map} from 'immutable'
import {connect} from 'react-redux'
import {Dispatch} from 'redux'

import {HexCoord} from './Hex'
import {Board} from './Board'
import {
    queueMoveAction, placeCursorAction, newGameAction, doMovesAction
} from './BoardReducer'
import {AppState} from '../App'
import Dimension from '../Dimension'
import {BoardState} from './BoardState'
import {DriftColor} from '../color/DriftColor'
import {ColorPodge} from '../color/ColorPodge'
import {Player, PLAYERS} from './Players'
import {PlayerMove} from './MovementQueue'
import {TickerBoardView} from './TickerBoardView';

export interface LocalGameProps {
    displaySize: Dimension
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
    onNewGame: (board: Board) => {
        dispatch(newGameAction(board))
    },
})

export const LocalGameContainer = connect(
    mapStateToTickerBoardViewProps, mapDispatchToBoardViewProps
)(
    TickerBoardView
)
