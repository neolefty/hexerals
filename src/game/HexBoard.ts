import * as assert from 'assert';
import { Map } from 'immutable';
import { HexBoardConstraints, HexCoord, RectangularConstraints } from './Hex';

export enum Player {
    Compy = 'Compy', Human = 'Human', Nobody = 'Nobody'
}

export enum Terrain {
    Empty = 'Empty', Mountain = 'Mountain', Swamp = 'Swamp', City = 'City'
}

// contents of a space on the board
export class Spot {
    static readonly EMPTY: Spot = new Spot(Player.Nobody, 0);

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
}

export class HexBoard {
    constructor(
        readonly constraints: HexBoardConstraints = new RectangularConstraints(10, 10),
        readonly spots: Map<HexCoord, Spot> = Map()
    ) {}

    static constructSquare(size: number, startingArmy: number = 1) {
        return HexBoard.constructRectangular(size, size, startingArmy);
    }

    static constructRectangular(
        w: number, h: number, startingArmy: number = 1
    ): HexBoard {
        const constraints = new RectangularConstraints(w, h);
        const upperLeft = constraints.extreme(x => x.cartX() + x.cartY() * w);
        const lowerRight = constraints.extreme(x => -(x.cartX() + x.cartY() * w));

        const starts = Map<HexCoord, Spot>()
            .set(upperLeft, new Spot(Player.Compy, startingArmy))
            .set(lowerRight, new Spot(Player.Human, startingArmy));

        return new HexBoard(constraints, starts);
    }

    // TODO test
    superimpose(positions: Map<HexCoord, Spot>): HexBoard {
        const newSpots = this.spots.withMutations((mSpots: Map<HexCoord, Spot>) => {
            // add each Spot in startPositions
            // TODO avoid conflicts? For now just overwrite
            // TODO test that overwriting works, at least
            positions.map((value: Spot, key: HexCoord) => {
                const oldSpot: Spot = mSpots.get(key, Spot.EMPTY);
                mSpots.set(key, new Spot(value.owner, value.pop, oldSpot.terrain));
            });
        });
        return new HexBoard(this.constraints, newSpots);
    }

    inBounds(coord: HexCoord) {
        return this.constraints.inBounds(coord);
    }

    getSpot(coord: HexCoord): Spot {
        assert(this.inBounds(coord));
        return this.spots.get(coord, Spot.EMPTY);
    }

    // do a move
    apply(move: Move): HexBoard {
        const origin = this.getSpot(move.coord);

        if (origin.pop <= 1)
            // no effect if 1 or less population in origin
            return this;

        else {
            const dest = this.getSpot(move.dest);
            assert(move.step.abs() === 1);  // a move has distance 1
            const from = new Spot(origin.owner, 1);
            const march = new Spot(origin.owner, origin.pop - 1);
            const to = dest.settle(march);

            return new HexBoard(
                this.constraints,
                this.spots.withMutations((mMap: Map<HexCoord, Spot>) =>
                    mMap.set(move.coord, from).set(move.dest, to)
                )
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