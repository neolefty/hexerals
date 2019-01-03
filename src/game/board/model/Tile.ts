import {Player} from './players/Players'
import {canBeOccupied, growsFast, Terrain} from './Terrain';

// contents of a space on the board
export class Tile {
    static readonly EMPTY: Tile = new Tile(
        Player.Nobody, 0, Terrain.Empty)
    static readonly MOUNTAIN = new Tile(
        Player.Nobody, 0, Terrain.Mountain)
    static readonly CITY = new Tile(
        Player.Nobody, 0, Terrain.City)

    static readonly MAYBE_EMPTY = new Tile(
        Player.Nobody, 0, Terrain.Empty, false)
    static readonly MAYBE_CITY = new Tile(
        Player.Nobody, 0, Terrain.City, false)
    static readonly MAYBE_CAPITAL = new Tile(
        Player.Nobody, 0, Terrain.CapturedCapital, false)
    static readonly MAYBE_MOUNTAIN = new Tile(
        Player.Nobody, 0, Terrain.Mountain, false)
    static readonly MAYBE_SWAMP = new Tile(
        Player.Nobody, 0, Terrain.Swamp, false)

    constructor(
        readonly owner: Player,
        readonly pop: number = 0,
        readonly terrain: Terrain = Terrain.Empty,
        readonly known: boolean = true,
    ) {}

    // TODO check whether (this == EMPTY) will work instead
    isBlank() {
        return this.owner === Player.Nobody
            && this.pop === 0
            && this.terrain === Terrain.Empty
    }

    fromADistance(seenBefore: boolean): Tile | undefined {
        switch (this.terrain) {
            case Terrain.Empty:
                return undefined
            case Terrain.Mountain:
                return Tile.MAYBE_MOUNTAIN
            case Terrain.City:
                return seenBefore ? Tile.MAYBE_CITY : Tile.MAYBE_MOUNTAIN
            case Terrain.Capital:
            case Terrain.CapturedCapital:
                return seenBefore ? Tile.MAYBE_CAPITAL : undefined
            case Terrain.Swamp:
                return Tile.MAYBE_SWAMP
            default:
                throw Error(this.terrain)
        }
    }

    // using member functions instead of const function properties to avoid messing up .equals

    setPop(pop: number): Tile { return new Tile(this.owner, pop, this.terrain) }
    incrementPop(): Tile { return this.setPop(this.pop + 1) }
    setOwner(owner: Player): Tile { return new Tile(owner, this.pop, this.terrain) }
    setTerrain(terrain: Terrain) { return new Tile(this.owner, this.pop, terrain) }

    // not a mountain
    get canBeOccupied(): boolean { return canBeOccupied(this.terrain) }
    // city or capital
    get growsFast(): boolean {return growsFast(this.terrain) }
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
            return this.setPop(that.pop - this.pop)
                .setOwner(that.owner)
                .setTerrain(this.terrain === Terrain.Capital
                    ? Terrain.CapturedCapital
                    : this.terrain)
    }

    toString(): string {
        return `${this.owner}'s ${this.terrain}${
            this.pop === 0 ? '' : ` pop ${this.pop}`}`
    }
}