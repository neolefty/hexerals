import produce from "immer"
import {GenericAction} from "../../../common/GenericAction"
import {CycleAction, CycleReducer} from "../cycle/CycleReducer"
import {TutorialState, TutorialStepState} from "./TutorialState"

export type TutorialAction = TutorialSetStepAction | TutorialGameAction | TutorialStartGameAction | TutorialMessageAction

export const isTutorialAction = (action: GenericAction): action is TutorialSetStepAction =>
    action.type.startsWith('tutorial ')

const TUTORIAL_START_STEP = 'tutorial start step'
interface TutorialStartGameAction {
    type: typeof TUTORIAL_START_STEP
    stepId: string
    initialState: TutorialStepState
}

const TUTORIAL_SET_STEP = 'tutorial step'
export const doTutorialSetStep = () => ({type: TUTORIAL_SET_STEP})
interface TutorialSetStepAction {
    type: typeof TUTORIAL_SET_STEP
    stepId: string
}

const TUTORIAL_GAME = 'tutorial game'
interface TutorialGameAction {
    type: typeof TUTORIAL_GAME
    stepId: string
    cycleAction: CycleAction
}

const TUTORIAL_MESSAGE = 'tutorial message'
interface TutorialMessageAction {
    type: typeof TUTORIAL_MESSAGE
    stepId: string
    message: string
}

export const TutorialReducer = produce((
    draft: TutorialState, action: TutorialAction
): TutorialState => {
    switch(action.type) {
        case TUTORIAL_START_STEP:
            draft.steps = draft.steps.set(action.stepId, action.initialState)
            return draft
        case TUTORIAL_SET_STEP:
            if (!draft.steps.has(action.stepId))
                console.error(`Step ${action.stepId} hasn't been started`, action)
            else
                draft.curStep = action.stepId
            return draft
        case TUTORIAL_GAME:
        case TUTORIAL_MESSAGE:
            const stepState = draft.steps.get(action.stepId)
            if (stepState === undefined)
                console.error(`Step #${action.stepId} uninitialized.`, action)
            else {
                draft.steps = draft.steps.set(
                    action.stepId,
                    TutorialStepReducer(stepState, action)
                )
            }
            return draft
    }
})

export const TutorialStepReducer = produce((
    draft: TutorialStepState, action: TutorialMessageAction | TutorialGameAction
): TutorialStepState => {
    switch(action.type) {
        case TUTORIAL_MESSAGE:
            draft.message = action.message
            return draft
        case TUTORIAL_GAME:
            draft.game = CycleReducer(draft.game, action.cycleAction)
            return draft
    }
})
