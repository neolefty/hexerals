import produce from "immer"
import {GenericAction} from "../../../common/GenericAction"
import {CycleAction} from "../cycle/CycleAction"
import {CycleReducer} from "../cycle/CycleReducer"
import {LessonId} from "./Lessons"
import {TutorialState, LessonState} from "./TutorialState"

export type TutorialAction = TutorialSetStepAction | TutorialGameAction | TutorialStartGameAction | TutorialMessageAction

export const isTutorialAction = (action: GenericAction): action is TutorialSetStepAction =>
    action.type.startsWith('tutorial ')

const TUTORIAL_START_STEP = 'tutorial start step'
interface TutorialStartGameAction {
    type: typeof TUTORIAL_START_STEP
    lessonId: LessonId
    initialState: LessonState
}

const TUTORIAL_SET_STEP = 'tutorial step'
export const doTutorialSetStep = () => ({type: TUTORIAL_SET_STEP})
interface TutorialSetStepAction {
    type: typeof TUTORIAL_SET_STEP
    lessonId: LessonId
}

const TUTORIAL_GAME = 'tutorial game'
interface TutorialGameAction {
    type: typeof TUTORIAL_GAME
    lessonId: LessonId
    cycleAction: CycleAction
}

const TUTORIAL_MESSAGE = 'tutorial message'
interface TutorialMessageAction {
    type: typeof TUTORIAL_MESSAGE
    lessonId: LessonId
    message: string
}

export const TutorialReducer = produce((
    draft: TutorialState, action: TutorialAction
): TutorialState => {
    switch(action.type) {
        case TUTORIAL_START_STEP:
            draft.lessons = draft.lessons.set(action.lessonId, action.initialState)
            return draft
        case TUTORIAL_SET_STEP:
            if (!draft.lessons.has(action.lessonId))
                console.error(`Step ${action.lessonId} hasn't been started`, action)
            else
                draft.curLesson = action.lessonId
            return draft
        case TUTORIAL_GAME:
        case TUTORIAL_MESSAGE:
            const stepState = draft.lessons.get(action.lessonId)
            if (stepState === undefined)
                console.error(`Step #${action.lessonId} uninitialized.`, action)
            else {
                draft.lessons = draft.lessons.set(
                    action.lessonId,
                    TutorialStepReducer(stepState, action)
                )
            }
            return draft
    }
})

export const TutorialStepReducer = produce((
    draft: LessonState, action: TutorialMessageAction | TutorialGameAction
): LessonState => {
    switch(action.type) {
        case TUTORIAL_MESSAGE:
            draft.message = action.message
            return draft
        case TUTORIAL_GAME:
            draft.game = CycleReducer(draft.game, action.cycleAction)
            return draft
    }
})
