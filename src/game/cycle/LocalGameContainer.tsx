import {List, Map} from 'immutable'
import {connect} from 'react-redux'
import {Dispatch} from 'redux'

import {Hex} from '../board/model/Hex'
import {
    queueMovesAction, placeCursorAction, doMovesAction, cancelMovesAction, stepPopAction, robotsDecideAction
} from '../board/model/BoardReducer'
import {AppState} from '../../common/App'
import CartPair from '../../common/CartPair'
import {BoardState} from '../board/model/BoardState'
import {DriftColor} from '../../color/DriftColor'
import {ColorPodge} from '../../color/ColorPodge'
import {Player, PLAYERS} from '../players/Players'
import {PlayerMove} from '../board/model/Move'
import {TickerBoardView} from '../board/view/TickerBoardView';
import {LocalGameOptions} from './LocalGameOptions';
import {CacheMap} from '../../common/CacheMap';

export interface LocalGameProps {
    displaySize: CartPair
    onEndGame: () => void
    localOptions: LocalGameOptions
}

// TODO stop updating if colors stabilize
export const playerColors = (colors: ColorPodge): Map<Player, DriftColor> => {
    const result = Map<Player, DriftColor>().asMutable()
    // console.log(`podge = ${colors} -- ${colors.driftColors}`)
    colors.driftColors.forEach(
        (value: DriftColor, key: number) => {
            // console.log(`   - ${key} -- ${PLAYERS.get(key)} -- ${value.cie}`)
            result.set(PLAYERS.get(key), value)
        }
    )
    return result.asImmutable()
}

// is 5 enough?
const playerColorsCache = new CacheMap<ColorPodge, Map<Player, DriftColor>>(5)

export const cachedPlayerColors = (colors: ColorPodge): Map<Player, DriftColor> => {
    if (!playerColorsCache.has(colors))
        playerColorsCache.set(colors, playerColors(colors))
    return playerColorsCache.get(colors) as Map<Player, DriftColor>
}

// export const playerColors = (colors: ColorPodge): Map<Player, DriftColor> => {
//     // use cache to avoid mutating if colors stabilize
//     if (!playerColorsCache.has(colors)) {
//         const result = Map<Player, DriftColor>().asMutable()
//         colors.driftColors.forEach(
//             (value: DriftColor, key: number) =>
//                 result.set(PLAYERS.get(key), value)
//         )
//         playerColorsCache.set(colors, result.asImmutable())
//     }
//     return playerColorsCache.get(colors) as Map<Player, DriftColor>
// }

const mapStateToTickerBoardViewProps = (
    state: AppState, ownProps: LocalGameProps
) => ({
    boardState: state.cycle.localGame as BoardState, // assert it's not undefined
    displaySize: ownProps.displaySize,
    // colors: playerColors(state.colors.colors),
    colors: cachedPlayerColors(state.colors.colors),
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
    onPlaceCursor: (position: Hex) => dispatch(
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
