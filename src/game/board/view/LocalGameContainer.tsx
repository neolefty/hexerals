import {List, Map} from 'immutable'
import {connect} from 'react-redux'
import {Dispatch} from 'redux'

import {Hex} from '../model/Hex'
import {
    queueMovesAction, placeCursorAction, doMovesAction, cancelMovesAction, stepPopAction, robotsDecideAction
} from '../model/BoardReducer'
import {AppState} from '../../../common/App'
import CartPair from '../../../common/CartPair'
import {BoardState} from '../model/BoardState'
import {DriftColor} from '../../../color/DriftColor'
import {ColorPodge} from '../../../color/ColorPodge'
import {Player, PLAYERS} from '../model/players/Players'
import {PlayerMove} from '../model/Move'
import {TickerBoardView} from './TickerBoardView';
import {LocalGameOptions} from './LocalGameOptions';
import {CacheMap} from '../../../common/CacheMap';
import {setColorsAction} from '../../../color/ColorsReducer';

export interface LocalGameProps {
    displaySize: CartPair
    onEndGame: () => void
    localOptions: LocalGameOptions
}

export const playerColors = (colors: ColorPodge): Map<Player, DriftColor> => {
    const result = Map<Player, DriftColor>().asMutable()
    colors.driftColors.forEach(
        (value: DriftColor, key: number) => {
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
    },
    onResetColors: (n: number) => {
        dispatch(setColorsAction(ColorPodge.construct(n)))
    },
})

export const LocalGameContainer = connect(
    mapStateToTickerBoardViewProps, mapDispatchToBoardViewProps
)(
    TickerBoardView
)
