import * as React from "react"
import {useEffect, useReducer} from "react"
import {useLesson} from "./Lessons"
import {doTutorialStartStep, TutorialReducer} from "./TutorialReducer"
import {INITIAL_TUTORIAL_STATE, LessonState} from "./TutorialState"

// const TUTORIAL_TICKER_PROPS: Partial<TickerGameViewProps> = {
//     tickMillis: 500
// }

export const TutorialContainer = () => {
    const [tutorialState, tutorialDispatch] = useReducer(TutorialReducer, INITIAL_TUTORIAL_STATE)
    const curLesson = useLesson(tutorialState.curLessonId)
    const curLessonState: LessonState | undefined = tutorialState.lessons.get(tutorialState.curLessonId)
    useEffect(() => {
        if (!curLessonState && curLesson)
            tutorialDispatch(doTutorialStartStep(curLesson.id, curLesson.initialState()))
    }, [curLesson, curLessonState])
    return (
        <>
            <h1>Tutorial</h1>
            {curLesson &&
                <h2>{curLesson.title}</h2>
            }
            {curLessonState &&
                <>
                </>
            }
            {!curLesson && <h2>No Lesson Active</h2>}
        </>
    )
}
