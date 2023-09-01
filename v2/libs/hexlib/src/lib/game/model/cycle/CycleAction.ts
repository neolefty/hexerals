import {GenericAction} from "../../../common/GenericAction"
import {BoardStateAction, isGameAction} from "../board/BoardStateReducer"
import {LocalGameOptions} from "../board/LocalGameOptions"

export type CycleAction = BoardStateAction
    | OpenLocalGameAction | CloseLocalGameAction | ChangeLocalOptionAction

export const isCycleAction = (action: GenericAction): action is CycleAction =>
    isGameAction(action) || action.type.startsWith('cycle ')

export const OPEN_LOCAL_GAME = 'cycle open local game'
export const CHANGE_LOCAL_OPTION = 'cycle change local option'
export const CLOSE_LOCAL_GAME = 'cycle close local game'

export interface OpenLocalGameAction {
    type: typeof OPEN_LOCAL_GAME
}

export const doOpenLocalGame = (): OpenLocalGameAction =>
    ({type: OPEN_LOCAL_GAME})

export interface CloseLocalGameAction {
    type: typeof CLOSE_LOCAL_GAME
}

export const doCloseLocalGame = (): CloseLocalGameAction => ({type: CLOSE_LOCAL_GAME})

export interface ChangeLocalOptionAction {
    type: typeof CHANGE_LOCAL_OPTION
    name: keyof LocalGameOptions
    n: number  // TODO update string field
}

// TODO split into changeLocalOptionNumberAction and changeLocalOptionStringAction if necessary
export const doChangeLocalOption = (
    name: keyof LocalGameOptions, n: number
): ChangeLocalOptionAction => ({
    type: CHANGE_LOCAL_OPTION,
    name: name,
    n: n,
})
