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