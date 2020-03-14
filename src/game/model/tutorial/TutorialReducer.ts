import {AssertNever} from "../../../common/AssertNever"
import {GenericAction} from "../../../common/GenericAction"
import {TutorialState} from "./TutorialState"

export type TutorialAction = TutorialStepAction

export const isTutorialAction = (action: GenericAction): action is TutorialStepAction =>
    action.type.startsWith('tutorial ')

const TUTORIAL_STEP = 'tutorial step'
interface TutorialStepAction extends GenericAction { type: typeof TUTORIAL_STEP }
export const doTutorialStep = () => ({type: TUTORIAL_STEP})

export const TutorialReducer = (state: TutorialState, action: TutorialStepAction): TutorialState => {
    switch(action.type) {
        case TUTORIAL_STEP:
            return state
        default:
            return AssertNever(action.type)
    }
}
