import {List, Map} from 'immutable'
import React, {useCallback} from "react"
import {useNavigate} from "react-router-dom"
import {ColorPodge} from '../../../color/ColorPodge'
import {setColorsAction} from '../../../color/ColorsReducer'
import {DriftColor} from '../../../color/DriftColor'
import {AnalyticsAction, AnalyticsCategory, logAnalyticsEvent} from '../../../common/Analytics'
import {CacheMap} from '../../../common/CacheMap'
import {AppState} from "../../../old/main/AppOld"
import {ROUTE_LOCAL_OPTIONS} from "../../../old/main/Main"
import {MainDispatch} from "../../../old/main/MainReducer"
import {useMainDispatch, useMainState} from "../../../old/main/MainStateContext"
import {
    doApplyMoves,
    doCancelMoves,
    doGameDrag,
    doGameTick,
    doPlaceCursor,
    doQueueMoves,
    doRobotsDecide,
} from '../../model/board/BoardStateReducer'
import {doCloseLocalGame, doOpenLocalGame} from "../../model/cycle/CycleAction"
import {LocalGameState} from '../../model/cycle/CycleState'
import {Hex} from '../../model/hex/Hex'
import {PlayerMove} from '../../model/move/Move'
import {Player, PLAYERS} from '../../model/players/Players'
import {LocalGameView} from './LocalGameView'

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

const mapStateToTickerBoardViewProps = (state: AppState) => {
    // assert localGame is not undefined
    const game = state.cycle.localGame as LocalGameState
    const options = state.cycle.localOptions
    const board = options.fog && game.boardState.curPlayer
        ? game.fogs.getFog(game.boardState.curPlayer).fog(game.boardState)
        : game.boardState

    return ({
        boardState: board,
        localOptions: options,
        // colors: playerColors(state.colors.colors),
        colors: cachedPlayerColors(state.colors.colors),
        tickMillis: state.cycle.localOptions.tickMillis,
    })
}

const mapDispatchToBoardViewProps = (
    dispatch: MainDispatch,
    navTo: (path: string) => void
) => ({
    onQueueMoves: (moves: List<PlayerMove>) => dispatch(doQueueMoves(moves)),
    onDrag: (
        player: Player, cursorIndex: number, source: Hex, dest: Hex
    ) => dispatch(doGameDrag(player, cursorIndex, source, dest)),
    onCancelMoves: (
        player: Player, cursorIndex: number, count: number
    ) => dispatch(doCancelMoves(player, cursorIndex, count)),
    onPlaceCursor: (
        index: number, position: Hex, clearOthers: boolean
    ) => dispatch(doPlaceCursor(position, index, clearOthers)),
    onStep: () => {
        dispatch(doRobotsDecide())
        dispatch(doApplyMoves())
        dispatch(doGameTick())
    },
    onResetColors: (n: number) => dispatch(setColorsAction(ColorPodge.construct(n))),
    onEndGame: () => {
        dispatch(doCloseLocalGame())
        navTo(ROUTE_LOCAL_OPTIONS)
    },
    onRestartGame: () => {
        logAnalyticsEvent(AnalyticsAction.again, AnalyticsCategory.local)
        dispatch(doOpenLocalGame())
    },
})

export const LocalGameContainer = () => {
    const dispatch = useMainDispatch()
    const state = useMainState()
    const navigate = useNavigate()
    const navTo = useCallback((path: string) => navigate(path), [navigate])
    // TODO Memoize these mapping functions
    return (
        <LocalGameView
            {...mapStateToTickerBoardViewProps(state)}
            {...mapDispatchToBoardViewProps(dispatch, navTo)}
        />
    )
}
