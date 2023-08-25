import { Hex } from "./Hex"
import { Tile } from "./Tile"

/** A location (hex) plus unit of game state (tile). */
export interface HexTile {
    hex: Hex
    tile: Tile
}

export type HexFilter<T> = (hex: Hex, t: T) => boolean
export type HexSideEffect<T> = (hex: Hex, t: T) => void
