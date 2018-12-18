import {Player} from '../../players/Players'

export enum Terrain {
    Empty = 'Empty',  // Normal. Plains?
    City = 'City',
    // Nonexistent = 'Nonexistent',  // not actually part of the map
    /*, Mountain = 'Mountain', Swamp = 'Swamp', City = 'City' */
}

// contents of a space on the board
export class Spot {
    static readonly BLANK: Spot = new Spot(Player.Nobody, 0, Terrain.Empty)
    // static readonly NONEXISTENT: Spot = new Spot(
    //     Player.Nobody, 0, Terrain.Nonexistent)

    constructor(
        readonly owner: Player,
        readonly pop: number,
        readonly terrain: Terrain = Terrain.Empty
    ) {}

    setPop(pop: number): Spot {
        return new Spot(this.owner, pop, this.terrain)
    }

    incrementPop(): Spot {
        return this.setPop(this.pop + 1)
    }

    setOwner(owner: Player): Spot {
        return new Spot(owner, this.pop, this.terrain)
    }

    // settle a combination of this with that, keeping this.terrain
    settle(that: Spot): Spot {
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