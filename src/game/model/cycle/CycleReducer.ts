import * as assert from "assert"
import {AnalyticsAction, AnalyticsCategory, AnalyticsLabel, logAnalyticsEvent} from '../../../common/Analytics'
import {BoardStateReducer} from '../board/BoardStateReducer'
import {saveLocalGameOptions} from "../board/peristLocalGameOptions"
import {
    CHANGE_LOCAL_OPTION,
    ChangeLocalOptionAction,
    CLOSE_LOCAL_GAME,
    CloseLocalGameAction,
    CycleAction,
    OPEN_LOCAL_GAME
} from "./CycleAction"
import {CycleState, NOT_IN_GAME} from './CycleState'
import {OpenLocalGameReducer} from "./OpenLocalGameReducer"

export type CycleDispatch = (action: CycleAction) => void

export const CycleReducer = (
    state: CycleState, action: CycleAction,
): CycleState => {
    if (action.type === OPEN_LOCAL_GAME)
        return OpenLocalGameReducer(state)
    else if (action.type === CLOSE_LOCAL_GAME)
        return CloseLocalGameReducer(state, action)
    else if (action.type === CHANGE_LOCAL_OPTION) {
        const result = ChangeLocalOptionReducer(state, action)
        saveLocalGameOptions(result.localOptions)
        return result
    }
    else { // must be a BoardStateAction, by process of elimination
        const localGame = state.localGame
        if (localGame === undefined) {
            console.error(action)
            return state
        }
        else {
            const localBoard = localGame.boardState
            const newLocalBoard = BoardStateReducer(localBoard, action)
            if (newLocalBoard === localBoard)
                return state
            else {
                return Object.freeze({
                    ...state,
                    localGame: {
                        ...localGame,
                        boardState: newLocalBoard,
                    }
                })
            }
        }
    }
}

// noinspection JSUnusedLocalSymbols
const CloseLocalGameReducer =
    (state: CycleState, action: CloseLocalGameAction): CycleState => {
        logAnalyticsEvent(
            AnalyticsAction.end, AnalyticsCategory.local, AnalyticsLabel.quit, undefined,
            state.localOptions,
        )
        return {
            ...state,
            mode: NOT_IN_GAME,
            localGame: undefined,
        }
    }

export const ChangeLocalOptionReducer = (
    state: CycleState, action: ChangeLocalOptionAction
): CycleState => {
    if (state.localOptions[action.name] === action.n)
        return state

    const result = {...state.localOptions}
    assert.ok(result.hasOwnProperty(action.name))
    assert.strictEqual(typeof result[action.name], 'number')
    result[action.name] = action.n
    return {
        ...state,
        localOptions: result,
    }
}
