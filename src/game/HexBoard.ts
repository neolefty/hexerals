import * as assert from 'assert';
import { Map } from 'immutable';
import { RectEdges, HexBoardConstraints, HexCoord, RectangularConstraints } from './Hex';

export enum Player {
    Compy = 'Compy', Human = 'Human', Nobody = 'Nobody'
}

export enum Terrain {
    Empty = 'Empty',  // Normal. Plains?
    Nonexistent = 'Nonexistent',  // not actually part of the map
    /*, Mountain = 'Mountain', Swamp = 'Swamp', City = 'City' */
}

// contents of a space on the board
export class Spot {
    static readonly BLANK: Spot = new Spot(Player.Nobody, 0, Terrain.Empty);
    static readonly NONEXISTENT: Spot = new Spot(
        Player.Nobody, 0, Terrain.Nonexistent);

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

export class HexBoard {
    static construct(
        constraints: HexBoardConstraints,
        spots: Map<HexCoord, Spot> = Map()
    ) {
        return new HexBoard(constraints, spots, new RectEdges(constraints));
    }

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

        return HexBoard.construct(constraints, starts);
    }

    // keep constructor private so that edges doesn't get mis-constructed
    private constructor(
        readonly constraints: HexBoardConstraints,
        // non-blank spots on the map
        readonly spots: Map<HexCoord, Spot>,
        readonly edges: RectEdges
    ) {}

    // TODO test
    superimpose(positions: Map<HexCoord, Spot>): HexBoard {
        const newSpots = this.spots.withMutations((mSpots: Map<HexCoord, Spot>) => {
            // add each Spot in startPositions
            // TODO avoid conflicts? For now just overwrite
            // TODO test that overwriting works, at least
            positions.map((value: Spot, key: HexCoord) => {
                const oldSpot: Spot = mSpots.get(key, Spot.BLANK);
                mSpots.set(key, new Spot(value.owner, value.pop, oldSpot.terrain));
            });
        });
        return new HexBoard(this.constraints, newSpots, this.edges);
    }

    inBounds(coord: HexCoord) {
        return this.constraints.inBounds(coord);
    }

    getSpot(coord: HexCoord): Spot {
        assert(this.inBounds(coord));
        return this.spots.get(coord, Spot.BLANK);
    }

    getCartSpot(cx: number, cy: number): Spot | undefined {
        if ((cx + cy) % 2 === 1)
            return undefined;
        else {
            const hex = HexCoord.getCart(cx, cy);
            if (this.inBounds(hex))
                return this.getSpot(hex);
            else
                return undefined;
        }
    }

    // do a move
    apply(move: Move): HexBoard {
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

            return new HexBoard(
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

// Lay out a HexBoard on a rectangular grid for efficient access.
//
// Example:
//
// for (let y in wrapper.edges.yRange())
//     for (let x in wrapper.edges.xRange())
//         handleSpot(wrapper.getSpot(x, y));
export class CartesianBoardWrapper {
    private board: HexBoard;
    // HexCoords indexed by rows.get(y).get(x)
    readonly rows: Map<number, Map<number, HexCoord>>;

    constructor(board: HexBoard) {
        this.board = board;
        this.rows = Map<number, Map<number, HexCoord>>();
        this.initializeRows();
    }

    getSpot(cx: number, cy: number): Spot | undefined {
        let row = this.rows.get(cy);
        let c = row ? row.get(cx) : undefined;
        return c === undefined ? undefined : this.board.getSpot(c);
    }

    update(board: HexBoard) {
        // can only update with the same shaped board
        // TODO if needed, could clear state on change
        assert(board.constraints === this.board.constraints);
        this.board = board;
    }

    private initializeRows() {
        assert(this.rows.isEmpty());
        this.board.constraints.all().map(coord => {
            let col = this.rows.get(coord.cartY());
            if (col === undefined) {
                col = Map<number, HexCoord>();
                this.rows.set(coord.cartY(), col);
            }
            assert(!col.has(coord.cartX()));
            col.set(coord.cartX(), coord);
        });
    }
}