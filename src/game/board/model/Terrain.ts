export enum Terrain {
    Empty = 'Empty',  // Normal. Plains?
    City = 'City',
    Capital = 'Capital',
    Mountain = 'Mountain',
    Swamp = 'Swamp',
}

export const canBeOccupied = (terrain: Terrain): boolean =>
    terrain !== Terrain.Mountain

export const growsFast = (terrain: Terrain): boolean =>
    terrain === Terrain.City || terrain === Terrain.Capital