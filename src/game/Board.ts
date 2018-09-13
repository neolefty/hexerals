import * as assert from 'assert';
import {List, Map} from 'immutable';
import {BoardConstraints, HexCoord, RectangularConstraints, RectEdges} from './Hex';
import {INITIAL_POP} from './BoardConstants';
import {PlayerMove} from './MovementQueue';
import {Player} from './Players';
import {StatusMessage} from '../StatusMessage';

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
        return (this.terrain === Terrain.Empty ? '' : `Terrain: ${ this.terrain }, `)
        + `Owner: ${ this.owner }, Pop: ${ this.pop }`;
    }
}

export interface StartingArranger {
    arrange(board: Board): Map<HexCoord, Spot>;
}

export class RandomArranger implements StartingArranger {
    public static construct(players: List<Player>) {
        return new RandomArranger(INITIAL_POP, players);
    }

    constructor(readonly startingArmy: number, readonly players: List<Player>) {}

    public arrange(board: Board): Map<HexCoord, Spot> {
        const allHexes: HexCoord[] = board.constraints.all().toArray();
        let starts = Map<HexCoord, Spot>();
        this.players.forEach((player: Player) => {
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

export class BoardAndMessages {
    constructor(
        readonly board: Board,
        readonly messages: List<StatusMessage>,
    ) {}

    addToMessages = (curMessages: List<StatusMessage>): List<StatusMessage> =>
        this.messages.size > 0
            ? List(curMessages.concat(this.messages))
            : curMessages
}

export class Board {
    static construct(
        constraints: BoardConstraints,
        players: List<Player>,
        spots: Map<HexCoord, Spot> = Map(),
    ) {
        return new Board(constraints, players, spots, new RectEdges(constraints));
    }

    static constructSquare(
        size: number,
        players: List<Player>,
        arranger: StartingArranger,
    ) {
        return Board.constructRectangular(size, size, players, arranger);
    }

    static constructRectangular(
        w: number,
        h: number,
        players: List<Player>,
        arranger: StartingArranger,
    ): Board {
        const constraints = new RectangularConstraints(w, h);
        const blank = Board.construct(constraints, players);
        const starts = arranger.arrange(blank);

        return new Board(blank.constraints, players, starts, blank.edges);
    }

    // keep constructor private so that edges doesn't get mis-constructed
    private constructor(
        readonly constraints: BoardConstraints,
        readonly players: List<Player>,
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

    applyMove(move: PlayerMove): BoardAndMessages {
        return this.applyMoves(List([move]));
    }

    /**
     * Do some moves.
     *
     * @param {List<PlayerMove>} moves the moves to do. If in the course of
     * moving, a player who no longer controls a square has a move queued from that
     * square, that move is skipped and has no effect.
     * @returns {Board} updated
     */
    applyMoves(moves: List<PlayerMove>): BoardAndMessages {
        // note that messages is left unchanged if no messages are added
        let messages: List<StatusMessage> = List();
        // likewise, spots is left unchanged if no spots are added
        let updatedSpots = this.spots;

        moves.forEach((move: PlayerMove) => {
            const player = this.players.get(move.playerIndex);
            const origin = updatedSpots.get(move.source);
            if (origin.pop > 1 && origin.owner === player) {

                // TODO move out into validation func?
                if (move.delta.maxAbs() !== 1)
                    messages = messages.push(
                        new StatusMessage(
                            'illegal move', // TODO use constants for tags
                            `Can't move ${move.delta.maxAbs()} steps.`,
                            `${move}`,
                        ));

                else {
                    const newSourceSpot = new Spot(origin.owner, 1);
                    // TODO support moving only part of a stack (half etc)
                    const oldDestSpot = this.getSpot(move.dest);
                    const march = new Spot(origin.owner, origin.pop - 1);
                    const newDestSpot = oldDestSpot.settle(march);
                    updatedSpots = updatedSpots.withMutations(
                        (m: Map<HexCoord, Spot>) => {
                            m.set(move.source, newSourceSpot);
                            m.set(move.dest, newDestSpot);
                    });
                }
            }
        });

        const board = (this.spots === updatedSpots)
            ? this
            : new Board(
                this.constraints,
                this.players,
                updatedSpots,
                this.edges,
            );
        return new BoardAndMessages(board, messages);
    }

    toString(): string {
        let result = `Constraints: ${this.constraints.toString()}\n`
            + `Edges: ${ this.edges.toString()}\n`
            + `Spots: (`;
        this.spots.map((spot, coord) =>
            result += spot.pop ? `${coord} -- ${spot}; ` : ''
        );
        result += ')';
        return result;
    }

    playerIndex(player: Player) {
        return this.players.indexOf(player);
    }
}