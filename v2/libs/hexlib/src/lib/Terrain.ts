export type Terrain =
    | "Empty"
    | "City"
    | "Capital"
    | "CapturedCapital"
    | "Mountain"
    | "Swamp"

export const canBeOccupied = (terrain: Terrain): boolean =>
    terrain !== "Mountain"

export const GROWS_FAST: ReadonlyArray<Terrain> = [
    "City",
    "Capital",
    "CapturedCapital",
]

export const growsFast = (terrain: Terrain) => GROWS_FAST.indexOf(terrain) >= 0
