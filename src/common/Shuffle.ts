import {List} from "immutable"

// copied shamelessly from the untyped
// https://www.npmjs.com/package/immutable-shuffle

/**
 * Fisher-Yates-shuffle(see https://bost.ocks.org/mike/shuffle) for Immutable.js Lists
 * @param  {[Immutable.List]} list [any immutable.js List]
 * @return {[Immutable.List]} Shuffled-List [the same list shuffled]
 */
export const shuffle = <T>(list: List<T>): List<T> =>
    list.withMutations(result => {
        let cur = result.size;
        let swappedItem = null;
        while (cur > 0) {
            // Pick a remaining element…
            swappedItem = Math.floor(Math.random() * cur--);
            // Swap with current element
            const tmp = result.get(cur) as T;
            result.set(cur, result.get(swappedItem) as T);
            result.set(swappedItem, tmp);
        }
    })