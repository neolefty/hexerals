import {List, Map} from "immutable"
import {CycleState} from "../cycle/CycleState"
import {Hex} from "../hex/Hex"
import {FIRST_TUTORIAL_ID, LessonId} from "./Lessons"

// The tutorial is made up of a web of interconnected lessons
export interface TutorialState {
    curLesson: LessonId
    // map of tutorial chapter to that chapter's game
    lessons: Map<string, LessonState>
}

const INITIAL_TUTORIAL_STATE: TutorialState = {
    curLesson: FIRST_TUTORIAL_ID,
    lessons: Map()
}

export interface LessonState {
    message: string
    game: CycleState
    highlights?: List<Hex>
}

export interface TutorialLesson {
    id: LessonId
    title: string
    // A lesson has multiple steps or hints to move you along
    triggers: LessonTrigger[]
    initialState: () => LessonState
}

interface LessonTriggerResult {
    // some triggers unlock more lessons
    nextLessonId?: LessonId
    // what you just did
    congrats: string
    // what you should do next
    next: string
}

export type LessonTrigger = (
    game: CycleState,
    lastTriggerTurn?: number,
) => LessonTriggerResult | undefined | false
