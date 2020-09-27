import {List} from "immutable"
import {LessonDrag} from "./lessons/LessonDrag"
import {LessonMove} from "./lessons/LessonMove"
import {TutorialLesson} from "./TutorialState"

export const FIRST_TUTORIAL_ID = 'move'

export type LessonId = 'move' | 'drag'

export const Lessons: List<TutorialLesson> = List([LessonMove, LessonDrag])
