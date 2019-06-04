import {CartPair} from '../../../common/CartPair'
import {Range} from 'immutable'

const cache = new WeakMap<{}, CartPair>()

// n: number of squares
// aspect: width to height
// returns: (rows, columns)
export const packSquares = (n: number, aspect: number): CartPair => {
    const key = {
        n: n,
        aspect: aspect,
    }
    let result = cache.get(key) as CartPair | undefined
    if (!result) {
        let [ bestSide, bestCols, bestRows ] = [ 0, -1, -1 ]
        Range(1, n + 1).forEach(rows => {
            const cols = Math.ceil(n / rows)
            const side = Math.min(aspect / cols, 1 / rows)
            // sometimes there's extra room since we're packing squares
            const betterCols = Math.floor(aspect / side)
            const betterRows = Math.floor(1 / side)
            if (side > bestSide)
                [ bestSide, bestRows, bestCols ] = [ side, betterCols, betterRows ]
        })
        result = new CartPair(bestRows, bestCols)
        cache.set(key, result)
    }
    return result
}
