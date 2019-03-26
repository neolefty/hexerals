import {List, Map} from 'immutable'
import {connect} from 'react-redux'
import {Dispatch} from 'redux'

import {Hex} from '../model/hex/Hex'
import {
    queueMovesAction,
    placeCursorAction,
    doMovesAction,
    cancelMovesAction,
    gameTickAction,
    robotsDecideAction,
    dragAction,
} from '../model/board/BoardReducer'
import {AppState, GenericAction} from '../../common/App'
import {CartPair} from '../../common/CartPair'
import {DriftColor} from '../../color/DriftColor'
import {ColorPodge} from '../../color/ColorPodge'
import {Player, PLAYERS} from '../model/players/Players'
import {PlayerMove} from '../model/move/Move'
import {LocalGameOptions} from './LocalGameOptions'
import {CacheMap} from '../../common/CacheMap'
import {setColorsAction} from '../../color/ColorsReducer'
import {LocalBoardView} from './LocalBoardView';
import {LocalGameState} from '../model/cycle/CycleState';

export interface LocalBoardProps {
    displaySize: CartPair
    onEndGame: () => void
    localOptions: LocalGameOptions
}

export const playerColors = (colors: ColorPodge): Map<Player, DriftColor> =>
    Map<Player, DriftColor>().withMutations(result =>
        colors.driftColors.forEach(
            (value: DriftColor, key: number) => {
                const player: Player | undefined = PLAYERS.get(key)
                if (player)
                    result.set(player, value)
            }
        )
    )

// call onResetColors() if the number doesn't match
const playerColorsCache = new CacheMap<ColorPodge, Map<Player, DriftColor>>(5)

export const cachedPlayerColors = (colors: ColorPodge): Map<Player, DriftColor> =>
    playerColorsCache.get(colors, () => playerColors(colors))

const mapStateToTickerBoardViewProps = (
    state: AppState, ownProps: LocalBoardProps
) => {
    // assert localGame is not undefined
    const game = state.cycle.localGame as LocalGameState
    const options = state.cycle.localOptions
    const board = options.fog && game.boardState.curPlayer
        ? game.fogs.getFog(game.boardState.curPlayer).fog(game.boardState)
        : game.boardState

    return ({
        boardState: board,
        displaySize: ownProps.displaySize,
        // colors: playerColors(state.colors.colors),
        colors: cachedPlayerColors(state.colors.colors),
        tickMillis: state.cycle.localOptions.tickMillis,
        onEndGame: ownProps.onEndGame,
    })
}

const mapDispatchToBoardViewProps = (
    dispatch: Dispatch<GenericAction>
) => ({
    onQueueMoves: (moves: List<PlayerMove>) => dispatch(
        queueMovesAction(moves)
    ),

    onDrag: (
        player: Player, cursorIndex: number, source: Hex, dest: Hex
    ) => dispatch(
        dragAction(player, cursorIndex, source, dest)
    ),

    onCancelMoves: (
        player: Player, cursorIndex: number, count: number
    ) => dispatch(
        cancelMovesAction(player, cursorIndex, count)
    ),

    onPlaceCursor: (
        index: number, position: Hex, clearOthers: boolean
    ) => dispatch(
        placeCursorAction(position, index, clearOthers)
    ),

    onStep: () => {
        dispatch(robotsDecideAction())
        dispatch(doMovesAction())
        dispatch(gameTickAction())
    },

    onResetColors: (n: number) => dispatch(
        setColorsAction(ColorPodge.construct(n))
    ),
})

export const LocalBoardContainer = connect(
    mapStateToTickerBoardViewProps, mapDispatchToBoardViewProps
)(
    LocalBoardView
)
