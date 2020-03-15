import {Player} from "../../players/Players"
import {TutorialLesson} from "../TutorialState"
import {cursorTiles, hasCapital, initCycle, tilesOwnedBy} from "../TutorialUtil"

export const LessonMove: TutorialLesson = {
    id: 'move',
    title: 'Move your population around.',
    initialState: () => ({
        message: 'Tap on your castle.',
        game: initCycle({
            mountainPercent: 5,
        }),
    }),
    triggers: [
        // select your capital
        (game, last) => {
            if (last !== undefined) return false
            return hasCapital(cursorTiles(game.localGame?.boardState)) && {
                congrats: "That's the one!",
                next: "Now, try dragging it to a nearby hex.",
            }
        },
        // add to the queue
        (game, last) => {
            if (last !== undefined) return false
            return tilesOwnedBy(Player.Zero).size > 1 && {
                congrats: "Way to go.",
                next: "Ready for longer trips?",
                nextLessonId: 'drag',
            }
        },
    ]
}
