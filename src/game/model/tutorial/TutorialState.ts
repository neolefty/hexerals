import {Map} from "immutable"
import {CycleState, LocalGameState} from "../cycle/CycleState"

export interface TutorialState {
    stepIndex?: number
    games: Map<number, CycleState>
}

const INITIAL_TUTORIAL_STATE: TutorialState = {
    stepIndex: undefined,
    games: Map()
}

export interface TutorialStep {
    welcome: string
    triggers: GameTrigger[]
    congrats: string
}

export interface GameTrigger {
    detector: (game: LocalGameState) => boolean
    beforeMessage: string
    afterMessage: string
}
