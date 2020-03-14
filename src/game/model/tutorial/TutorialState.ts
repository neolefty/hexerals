import {Map} from "immutable"
import {CycleState} from "../cycle/CycleState"

const FIRST_TUTORIAL_ID = 'start'


export interface TutorialState {
    curStep: string
    // map of tutorial chapter to that chapter's game
    steps: Map<string, TutorialStepState>
}

export interface TutorialStepState {
    game: CycleState
    message?: string
}

const INITIAL_TUTORIAL_STATE: TutorialState = {
    curStep: FIRST_TUTORIAL_ID,
    steps: Map()
}

export interface TutorialStep {
    id: string
    title: string
    triggers: TutorialTrigger[]
    initialState: TutorialStepState
}

interface TutorialTriggerResult {
    nextTutorialStep?: string
    message?: string
}

export type TutorialTrigger = (game: CycleState) => TutorialTriggerResult | undefined
