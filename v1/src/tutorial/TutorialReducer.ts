import produce from "immer"
import {CycleAction} from "../game/model/cycle/CycleAction"
import {CycleReducer} from "../game/model/cycle/CycleReducer"
import {LessonId} from "./Lessons"
import {LessonState, TutorialState} from "./TutorialState"

export type TutorialAction = TutorialSetStepAction | TutorialGameAction | TutorialStartGameAction | TutorialMessageAction

const TUTORIAL_START_STEP = 'tutorial start step'
export const doTutorialStartStep = (lessonId: LessonId, initialState: LessonState): TutorialStartGameAction =>
    ({type: TUTORIAL_START_STEP, lessonId, initialState})
interface TutorialStartGameAction {
    type: typeof TUTORIAL_START_STEP
    lessonId: LessonId
    initialState: LessonState
}

const TUTORIAL_SET_STEP = 'tutorial step'
export const doTutorialSetStep = (lessonId: LessonId): TutorialSetStepAction =>
    ({type: TUTORIAL_SET_STEP, lessonId})
interface TutorialSetStepAction {
    type: typeof TUTORIAL_SET_STEP
    lessonId: LessonId
}

const TUTORIAL_GAME = 'tutorial game'
export const doTutorialGame = (lessonId: LessonId, cycleAction: CycleAction): TutorialGameAction =>
    ({type: TUTORIAL_GAME, lessonId, cycleAction})
interface TutorialGameAction {
    type: typeof TUTORIAL_GAME
    lessonId: LessonId
    cycleAction: CycleAction
}

const TUTORIAL_MESSAGE = 'tutorial message'
export const doTutorialMessage = (lessonId: LessonId, message: string): TutorialMessageAction =>
    ({type: TUTORIAL_MESSAGE, lessonId, message})
interface TutorialMessageAction {
    type: typeof TUTORIAL_MESSAGE
    lessonId: LessonId
    message: string
}

export const TutorialReducer = produce((
    draft: TutorialState, action: TutorialAction,
): TutorialState => {
    switch(action.type) {
        case TUTORIAL_START_STEP:
            draft.lessons = draft.lessons.set(action.lessonId, action.initialState)
            return draft
        case TUTORIAL_SET_STEP:
            if (!draft.lessons.has(action.lessonId))
                console.error(`Step ${action.lessonId} hasn't been started`, action)
            else
                draft.curLessonId = action.lessonId
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
    draft: LessonState, action: TutorialMessageAction | TutorialGameAction,
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
