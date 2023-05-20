import {List, Range} from "immutable"
import {shuffle} from "./Shuffle"

it('shuffles a list', () => {
    const original = List(Range(1, 1000))
    Range(1, 10).forEach(() => {
        const shuffled = shuffle(original)
        let match = 0
        expect(shuffled).not.toEqual(original)
        Range(1, original.size).forEach(index => {
            if (shuffled.get(index) === original.get(index))
                ++match
        })
        // console.log(`Matches: ${match}`)
        expect(match).toBeLessThan(10)
        const sorted = shuffled.sort()
        expect(sorted).toEqual(original)
    })
})