import { Terrain, growsFast, canBeOccupied } from "./Terrain"
import { Player, PLAYER_NOBODY } from "./Player"

export type TileFilter = (tile: Tile) => boolean

/** The smallest piece of game state, separate from location. */
export class Tile {
    static readonly EMPTY: Tile = new Tile(PLAYER_NOBODY, 0, "Empty")
    static readonly MOUNTAIN = new Tile(PLAYER_NOBODY, 0, "Mountain")
    static readonly CITY = new Tile(PLAYER_NOBODY, 0, "City")

    static readonly MAYBE_EMPTY = new Tile(PLAYER_NOBODY, 0, "Empty", false)
    static readonly MAYBE_CITY = new Tile(PLAYER_NOBODY, 0, "City", false)
    static readonly MAYBE_CAPITAL = new Tile(
        PLAYER_NOBODY,
        0,
        "CapturedCapital",
        false
    )
    static readonly MAYBE_MOUNTAIN = new Tile(
        PLAYER_NOBODY,
        0,
        "Mountain",
        false
    )
    static readonly MAYBE_SWAMP = new Tile(PLAYER_NOBODY, 0, "Swamp", false)

    constructor(
        readonly owner: Player,
        readonly pop: number = 0,
        readonly terrain: Terrain = "Empty",
        readonly known: boolean = true
    ) {}

    // TODO check whether (this == EMPTY) will work instead
    isBlank() {
        return (
            this.owner === PLAYER_NOBODY &&
            this.pop === 0 &&
            this.terrain === "Empty"
        )
    }

    fromADistance(seenBefore: boolean): Tile | undefined {
        switch (this.terrain) {
            case "Empty":
                return undefined
            case "Mountain":
                return seenBefore ? Tile.MOUNTAIN : Tile.MAYBE_MOUNTAIN
            case "City":
                return seenBefore ? Tile.MAYBE_CITY : Tile.MAYBE_MOUNTAIN
            case "Capital":
            case "CapturedCapital":
                return seenBefore ? Tile.MAYBE_CAPITAL : undefined
            case "Swamp":
                return Tile.MAYBE_SWAMP
            default:
                throw Error(this.terrain)
        }
    }

    // using member functions instead of const function properties to avoid messing up .is

    setPop(pop: number): Tile {
        return new Tile(this.owner, pop, this.terrain)
    }
    incrementPop(): Tile {
        return this.setPop(this.pop + 1)
    }
    setOwner(owner: Player): Tile {
        return new Tile(owner, this.pop, this.terrain)
    }
    setTerrain(terrain: Terrain) {
        return new Tile(this.owner, this.pop, terrain)
    }

    // not a mountain
    get canBeOccupied(): boolean {
        return canBeOccupied(this.terrain)
    }
    // city or capital
    get growsFast(): boolean {
        return growsFast(this.terrain)
    }
    get isOwned(): boolean {
        return this.owner !== PLAYER_NOBODY
    }

    // settle a combination of this with that, keeping this.terrain
    settle(that: Tile): Tile {
        // same owner? combine them
        if (this.owner === that.owner) return this.setPop(this.pop + that.pop)
        // different owners? subtract smaller from larger (this wins a tie)
        else if (this.pop >= that.pop) return this.setPop(this.pop - that.pop)
        else
            return this.setPop(that.pop - this.pop)
                .setOwner(that.owner)
                .setTerrain(
                    this.terrain === "Capital"
                        ? "CapturedCapital"
                        : this.terrain
                )
    }

    toString(): string {
        return `${this.owner}'s ${this.terrain}${
            this.pop === 0 ? "" : ` pop ${this.pop}`
        }`
    }

    equals(that: any) {
        return (
            that !== undefined &&
            this.owner === that.owner &&
            this.pop === that.pop &&
            this.terrain === that.terrain &&
            this.known === that.known
        )
    }
}
