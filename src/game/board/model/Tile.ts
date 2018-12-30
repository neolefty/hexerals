import {Player} from './players/Players'

export enum Terrain {
    Empty = 'Empty',  // Normal. Plains?
    City = 'City',
    Capital = 'Capital',
    Mountain = 'Mountain',
    MaybeMountain = 'MaybeMountain',
    Swamp = 'Swamp',
}

export const canBeOccupied = (terrain: Terrain): boolean =>
    terrain !== Terrain.Mountain

// contents of a space on the board
export class Tile {
    static readonly BLANK: Tile = new Tile(Player.Nobody, 0, Terrain.Empty)
    static readonly SWAMP = new Tile(Player.Nobody, 0, Terrain.Swamp)
    static readonly MOUNTAIN = new Tile(Player.Nobody, 0, Terrain.Mountain)
    static readonly MAYBE_MOUNTAIN = new Tile(
        Player.Nobody, 0, Terrain.MaybeMountain
    )

    constructor(
        readonly owner: Player,
        readonly pop: number,
        readonly terrain: Terrain = Terrain.Empty
    ) {}

    // TODO check whether (this == BLANK) will work instead
    isBlank() {
        return this.owner === Player.Nobody
            && this.pop === 0
            && this.terrain === Terrain.Empty
    }

    fromADistance(): Tile | undefined {
        switch (this.terrain) {

            case Terrain.Mountain:
            case Terrain.MaybeMountain:
            case Terrain.City:
                return Tile.MAYBE_MOUNTAIN

            case Terrain.Capital:
            case Terrain.Empty:
                return undefined

            case Terrain.Swamp:
                return Tile.SWAMP

            default:
                throw Error(this.terrain)
        }
    }

    // member functions instead of function properties to avoid messing up ==
    canBeOccupied(): boolean { return canBeOccupied(this.terrain) }
    setPop(pop: number): Tile { return new Tile(this.owner, pop, this.terrain) }
    incrementPop(): Tile { return this.setPop(this.pop + 1) }
    setOwner(owner: Player): Tile { return new Tile(owner, this.pop, this.terrain) }
    setTerrain(terrain: Terrain) { return new Tile(this.owner, this.pop, terrain) }
    get isOwned(): boolean { return this.owner !== Player.Nobody }

    // settle a combination of this with that, keeping this.terrain
    settle(that: Tile): Tile {
        // same owner? combine them
        if (this.owner === that.owner)
            return this.setPop(this.pop + that.pop)
        // different owners? subtract smaller from larger (this wins a tie)
        else if (this.pop >= that.pop)
            return this.setPop(this.pop - that.pop)
        else
            return this.setPop(that.pop - this.pop).setOwner(that.owner)
    }

    toString(): string {
        return (this.terrain === Terrain.Empty ? '' : `Terrain: ${ this.terrain }, `)
            + `Owner: ${ this.owner }, Pop: ${ this.pop }`
    }
}