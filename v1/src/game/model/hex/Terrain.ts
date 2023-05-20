export enum Terrain {
    Empty = 'Empty',  // Normal. Plains?
    City = 'City',
    Capital = 'Capital',
    CapturedCapital = 'CapturedCapital',
    Mountain = 'Mountain',
    Swamp = 'Swamp',
}

export const canBeOccupied = (terrain: Terrain): boolean =>
    terrain !== Terrain.Mountain

export const growsFast = (terrain: Terrain): boolean =>
    terrain === Terrain.City
    || terrain === Terrain.Capital
    || terrain === Terrain.CapturedCapital