import * as assert from 'assert';
import { Map } from 'immutable';
import { RectEdges, BoardConstraints, HexCoord, RectangularConstraints } from './Hex';

export enum Player {
    Compy = 'Compy', Human = 'Human', Nobody = 'Nobody'
}

export enum Terrain {
    Empty = 'Empty',  // Normal. Plains?
    // Nonexistent = 'Nonexistent',  // not actually part of the map
    /*, Mountain = 'Mountain', Swamp = 'Swamp', City = 'City' */
}

// contents of a space on the board
export class Spot {
    static readonly BLANK: Spot = new Spot(Player.Nobody, 0, Terrain.Empty);
    // static readonly NONEXISTENT: Spot = new Spot(
    //     Player.Nobody, 0, Terrain.Nonexistent);

    constructor(
        readonly owner: Player,
        readonly pop: number,
        readonly terrain: Terrain = Terrain.Empty) {}

    // settle a combination of this and that
    settle(that: Spot): Spot {
        // same owner? combine them
        if (this.owner === that.owner)
            return new Spot(this.owner, this.pop + that.pop);
        // different owners? subtract smaller from larger (this wins a tie)
        else if (this.pop >= that.pop)
            return new Spot(this.owner, this.pop - that.pop);
        else
            return new Spot(that.owner, that.pop - this.pop);
    }

    toString(): string {
        return `Terrain: ${ this.terrain }, Owner: ${ this.owner }, Population: ${ this.pop }`;
    }
}

export class Board {
    static construct(
        constraints: BoardConstraints,
        spots: Map<HexCoord, Spot> = Map()
    ) {
        return new Board(constraints, spots, new RectEdges(constraints));
    }

    static constructSquare(size: number, startingArmy: number = 1) {
        return Board.constructRectangular(size, size, startingArmy);
    }

    static constructRectangular(
        w: number, h: number, startingArmy: number = 1
    ): Board {
        const constraints = new RectangularConstraints(w, h);
        const upperLeft = constraints.extreme(x => x.cartX() + x.cartY() * w);
        const lowerRight = constraints.extreme(x => -(x.cartX() + x.cartY() * w));

        const starts = Map<HexCoord, Spot>()
            .set(upperLeft, new Spot(Player.Compy, startingArmy))
            .set(lowerRight, new Spot(Player.Human, startingArmy));

        return Board.construct(constraints, starts);
    }

    // keep constructor private so that edges doesn't get mis-constructed
    private constructor(
        readonly constraints: BoardConstraints,
        // non-blank spots on the map
        readonly spots: Map<HexCoord, Spot>,
        readonly edges: RectEdges
    ) {}

    // // TODO test
    // superimpose(positions: Map<HexCoord, Spot>): Board {
    //     const newSpots = this.spots.withMutations((mSpots: Map<HexCoord, Spot>) => {
    //         // add each Spot in startPositions
    //         // TODO avoid conflicts? For now just overwrite
    //         // TODO test that overwriting works, at least
    //         positions.map((value: Spot, key: HexCoord) => {
    //             const oldSpot: Spot = mSpots.get(key, Spot.BLANK);
    //             mSpots.set(key, new Spot(value.owner, value.pop, oldSpot.terrain));
    //         });
    //     });
    //     return new Board(this.constraints, newSpots, this.edges);
    // }

    inBounds(coord: HexCoord) {
        return this.constraints.inBounds(coord);
    }

    getSpot(coord: HexCoord): Spot {
        assert(this.inBounds(coord));
        return this.spots.get(coord, Spot.BLANK);
    }

    getCartSpot(cx: number, cy: number): Spot {
        assert((cx + cy) % 2 === 0);
        return this.getSpot(HexCoord.getCart(cx, cy));
    }

    // do a move
    apply(move: Move): Board {
        const origin = this.getSpot(move.coord);

        if (origin.pop <= 1)
            // no effect if 1 or less population in origin
            return this;

        else {
            const dest = this.getSpot(move.dest);
            assert(move.step.maxAbs() === 1);  // a move has distance 1
            const from = new Spot(origin.owner, 1);
            const march = new Spot(origin.owner, origin.pop - 1);
            const to = dest.settle(march);

            return new Board(
                this.constraints,
                this.spots.withMutations((mMap: Map<HexCoord, Spot>) =>
                    mMap.set(move.coord, from).set(move.dest, to)
                ),
                this.edges
            );
        }
    }

    // TODO proper toString()
    toString(): string {
        let result = '';
        this.spots.map((spot) => result += spot.pop + ' ');
        return result;
    }
}

export class Move {
    // where will this Move end?
    readonly dest: HexCoord;
    constructor(readonly coord: HexCoord, readonly step: HexCoord) {
        this.dest = this.coord.plus(this.step);
    }
}