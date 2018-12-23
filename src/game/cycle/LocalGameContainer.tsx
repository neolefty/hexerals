import {List, Map} from 'immutable'
import {connect} from 'react-redux'
import {Dispatch} from 'redux'

import {HexCoord} from '../board/model/HexCoord'
import {
    queueMovesAction, placeCursorAction, doMovesAction, cancelMovesAction, stepPopAction, robotsDecideAction
} from '../board/model/BoardReducer'
import {AppState} from '../../common/App'
import Dimension from '../../common/Dimension'
import {BoardState} from '../board/model/BoardState'
import {DriftColor} from '../../color/DriftColor'
import {ColorPodge} from '../../color/ColorPodge'
import {Player, PLAYERS} from '../players/Players'
import {PlayerMove} from '../board/model/Move'
import {TickerBoardView} from '../board/view/TickerBoardView';

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
    onQueueMoves: (moves: List<PlayerMove>) => dispatch(
        queueMovesAction(moves)
    ),
    onCancelMoves: (player: Player, count: number) => dispatch(
        cancelMovesAction(player, count)
    ),
    onPlaceCursor: (position: HexCoord) => dispatch(
        placeCursorAction(position)
    ),
    onStep: () => {
        dispatch(robotsDecideAction())
        dispatch(doMovesAction())
        dispatch(stepPopAction())
    }
})

export const LocalGameContainer = connect(
    mapStateToTickerBoardViewProps, mapDispatchToBoardViewProps
)(
    TickerBoardView
)
