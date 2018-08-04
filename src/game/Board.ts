import * as assert from 'assert';
import {Map} from 'immutable';
import {RectEdges, BoardConstraints, HexCoord, RectangularConstraints} from './Hex';
import {INITIAL_POP} from './BoardConstants';

export enum Player {
    Nobody = 'Nobody',
    Zero = 'Zero',
    One = 'One',
    Two = 'Two',
    Three = 'Three',
    Four = 'Four',
    Five = 'Five',
    Six = 'Six',
    Seven = 'Seven',
    Eight = 'Eight',
}

export const PLAYERS: Map<number, Player> = Map([
    [ -1, Player.Nobody ],
    [ 0, Player.Zero ],
    [ 1, Player.One ],
    [ 2, Player.Two ],
    [ 3, Player.Three ],
    [ 4, Player.Four ],
    [ 5, Player.Five ],
    [ 6, Player.Six ],
    [ 7, Player.Seven ],
    [ 8, Player.Eight ],
]);

export const PLAYABLE_PLAYERS = [
    Player.Zero, Player.One, Player.Two, Player.Three, Player.Four ];

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

export interface StartingArranger {
    arrange(board: Board): Map<HexCoord, Spot>;
}

export class RandomArranger implements StartingArranger {
    public static construct(numPlayers: number) {
        return new RandomArranger(
            INITIAL_POP,
            PLAYABLE_PLAYERS.slice(0, numPlayers),
        );
    }

    constructor(readonly startingArmy: number, readonly players: Iterable<Player>) {}

    public arrange(board: Board): Map<HexCoord, Spot> {
        const allHexes: HexCoord[] = board.constraints.all().toArray();
        let starts = Map<HexCoord, Spot>();
        PLAYERS.map((player: Player) => {
            if (player !== Player.Nobody && allHexes.length > 0) {
                const i = Math.floor(Math.random() * allHexes.length);
                const hex = allHexes.splice(i, 1)[0];
                starts = starts.set(hex, new Spot(player, this.startingArmy));
            }
        });
        return starts;
    }
}

export class CornersArranger implements StartingArranger {
    constructor(readonly startingArmy: number, readonly players: Iterable<Player>) {}

    public arrange(board: Board): Map<HexCoord, Spot> {
        let starts = Map<HexCoord, Spot>();
        const corners = [
            (b: Board) => b.edges.lowerLeft,
            (b: Board) => b.edges.upperRight,
            (b: Board) => b.edges.upperLeft,
            (b: Board) => b.edges.lowerRight,
        ];
        let i = 0;
        for (let p in this.players) { // not sure why we can't use of instead of in
            if (p && this.players[p]) {
                const hex = corners[i++](board);
                starts = starts.set(hex, new Spot(this.players[p], this.startingArmy));
            }
        }
        return starts;
    }
}

export class TwoCornersArranger extends CornersArranger {
    constructor(startingArmy: number = 1) {
        super(startingArmy, [Player.Zero, Player.One]);
    }
}

export class Board {
    static construct(
        constraints: BoardConstraints,
        spots: Map<HexCoord, Spot> = Map()
    ) {
        return new Board(constraints, spots, new RectEdges(constraints));
    }

    static constructSquare(size: number, arranger: StartingArranger) {
        return Board.constructRectangular(size, size, arranger);
    }

    static constructRectangular(
        w: number, h: number, arranger: StartingArranger
    ): Board {
        const constraints = new RectangularConstraints(w, h);
        const blank = Board.construct(constraints);
        const starts = arranger.arrange(blank);

        return new Board(blank.constraints, starts, blank.edges);
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
    //             mSpots.set(key, new Spot(value.owner, value.contents, oldSpot.terrain));
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