export const NumberRange = (a: number, b: number): number[] =>
    Array.from(Array(b - a), (_, i) => i + a)
