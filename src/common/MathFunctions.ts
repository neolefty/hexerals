import {Map} from 'immutable';

export const minMax = (
    x: number, min: number, max: number
) =>
    Math.max(min, Math.min(max, x))

export const round = (
    n: number, places: number = 0
) => {
    const factor = places === 0 ? 1 : 10 ** places
    return Math.round(n * factor) / factor
}

export const minRatio = (x: number, y: number): number =>
    Math.min(x / y, y / x)

// find the pair in map whose value's ratio to x is closest to 1
// (aka multiplicative closest match)
// TODO unit tests
export function roundToMap<K>(
    x: number, map: Map<K, number>, defaultValue: K
): [ K, number ] {
    let closest: K | undefined = undefined
    let closestRatio: number = 0
    let valueClosest: number = NaN
    map.forEach((value, key) => {
        const r = minRatio(value, x)
        if (r > closestRatio) {
            closest = key
            closestRatio = r
            valueClosest = value
        }
        // console.log(`${key}: ${value} / ${x} = ${r} — ${closest} ${valueClosest}: ${r}`)
    })
    if (closest === undefined)
        closest = defaultValue
    return [ closest, valueClosest ]
}

