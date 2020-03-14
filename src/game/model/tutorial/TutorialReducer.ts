import produce from "immer"
import {GenericAction} from "../../../common/GenericAction"
import {CycleAction, CycleReducer} from "../cycle/CycleReducer"
import {CycleState} from "../cycle/CycleState"
import {TutorialState} from "./TutorialState"

export type TutorialAction = TutorialStepAction | TutorialGameAction | TutorialStartGameAction

export const isTutorialAction = (action: GenericAction): action is TutorialStepAction =>
    action.type.startsWith('tutorial ')

const TUTORIAL_STEP = 'tutorial step'
export const doTutorialStep = () => ({type: TUTORIAL_STEP})
interface TutorialStepAction {
    type: typeof TUTORIAL_STEP
    stepIndex?: number
}

const TUTORIAL_GAME = 'tutorial game'
interface TutorialGameAction {
    type: typeof TUTORIAL_GAME
    // which step of the tutorial?
    stepIndex: number
    cycleAction: CycleAction
}

const TUTORIAL_START_GAME = 'tutorial start game'
interface TutorialStartGameAction {
    type: typeof TUTORIAL_START_GAME
    stepIndex: number
    initialState: CycleState
}

export const TutorialReducer = produce((
    draft: TutorialState, action: TutorialAction
): TutorialState => {
    switch(action.type) {
        case TUTORIAL_STEP:
            draft.stepIndex = action.stepIndex
            return draft
        case TUTORIAL_GAME:
            const cycle = draft.games.get(action.stepIndex)
            if (cycle === undefined)
                console.error(`Step #${action.stepIndex} uninitialized.`, action)
            else {
                draft.games = draft.games.set(
                    action.stepIndex,
                    CycleReducer(cycle, action)
                )
            }
            return draft
        case TUTORIAL_START_GAME:
            draft.games = draft.games.set(action.stepIndex, action.initialState)
            return draft
    }
})
