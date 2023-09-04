export type OneOrMore<T> = [T, ...T[]]
export type TwoOrMore<T> = [T, T, ...T[]]

// this simpler tuple definition is more usable than type-fest's FixedLengthArray
export type Pair<T> = [T, T] // FixedLengthArray<number, 2>
export type TwoD = Pair<number>
export type Triple<T> = [T, T, T] // FixedLengthArray<number, 3>
export type ThreeD = Triple<number>
