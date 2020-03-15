import {TutorialLesson} from "../TutorialState"
import {initCycle} from "../TutorialUtil"

export const LessonDrag: TutorialLesson = {
    id: 'drag',
    title: 'Going around mountains',
    initialState: () => ({
        message: 'Tap on your castle.',
        game: initCycle({
            mountainPercent: 60,
        })
    }),
    triggers: []
}
