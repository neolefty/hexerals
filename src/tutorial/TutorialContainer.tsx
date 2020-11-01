import * as React from "react"
import {useReducer} from "react"
import {TutorialReducer} from "./TutorialReducer"
import {INITIAL_TUTORIAL_STATE} from "./TutorialState"

export const TutorialContainer = () => {
    const [tutorialState, tutorialDispatch] = useReducer(TutorialReducer, INITIAL_TUTORIAL_STATE)
    return (
        <h1>Tutorial</h1>
    )
}
