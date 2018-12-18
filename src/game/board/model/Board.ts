import * as assert from 'assert'
import {List, Map} from 'immutable'
import {RectEdges} from './Constraints'
import {PlayerMove} from './Move'
import {Player} from '../../players/Players'
import {StatusMessage} from '../../../common/StatusMessage'
import {StartingArranger} from './Arranger'
import {Spot} from './Spot'
import {HexCoord} from './HexCoord'
import {BoardConstraints, RectangularConstraints} from './Constraints'
import {MoveValidator, MoveValidatorOptions} from './MoveValidator';

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
        return new Board(
            constraints,
            players,
            spots,
            new RectEdges(constraints),
        )
    }

    static constructSquare(
        size: number,
        players: List<Player>,
        arranger: StartingArranger,
    ) {
        return Board.constructRectangular(size, size, players, arranger)
    }

    static constructRectangular(
        w: number,
        h: number,
        players: List<Player>,
        arranger: StartingArranger,
    ): Board {
        const constraints = new RectangularConstraints(w, h)
        const blank = Board.construct(constraints, players)
        const starts = arranger.arrange(blank)

        return new Board(blank.constraints, players, starts, blank.edges)
    }

    // keep constructor private so that edges doesn't get mis-constructed
    private constructor(
        readonly constraints: BoardConstraints,
        readonly players: List<Player>,
        // non-blank spots on the map
        readonly spots: Map<HexCoord, Spot>,
        readonly edges: RectEdges,
        readonly moveValidator: MoveValidator = new MoveValidator(constraints),
    ) {}

    inBounds(coord: HexCoord) {
        return this.constraints.inBounds(coord)
    }

    getSpot(coord: HexCoord): Spot {
        assert(this.inBounds(coord))
        return this.spots.get(coord, Spot.BLANK)
    }

    getCartSpot(cx: number, cy: number): Spot {
        assert((cx + cy) % 2 === 0)
        return this.getSpot(HexCoord.getCart(cx, cy))
    }

    applyMove(move: PlayerMove): BoardAndMessages {
        return this.applyMoves(List([move]))
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
        // likewise, spots is left unchanged if no spots are added
        const status: StatusMessage[] = []
        const options = new MoveValidatorOptions(this.spots, status)

        moves.forEach((move: PlayerMove) => {
            const valid = this.validate(move, options)
            if (valid) {
                const origin = options.spots.get(move.source)
                assert(origin)
                const newSourceSpot = origin.setPop(1)
                // TODO support moving only part of a stack (half etc)
                const oldDestSpot = this.getSpot(move.dest)
                const march = new Spot(origin.owner, origin.pop - 1)
                const newDestSpot = oldDestSpot.settle(march)
                options.spots = options.spots.withMutations(
                    (m: Map<HexCoord, Spot>) => {
                        m.set(move.source, newSourceSpot)
                        m.set(move.dest, newDestSpot)
                })
            }
        })

        const board = (this.spots === options.spots)
            ? this
            : new Board(
                this.constraints,
                this.players,
                options.spots,
                this.edges,
                this.moveValidator,
            )
        return new BoardAndMessages(board, List(status))
    }

    validate(
        move: PlayerMove,
        options: MoveValidatorOptions = this.validationOptions(),
    ): boolean {
        return this.moveValidator.validate(move, options)
    }

    validationOptions(
        messages: StatusMessage[] | undefined = undefined
    ): MoveValidatorOptions {
        return new MoveValidatorOptions(this.spots, messages)
    }

    toString(): string {
        let result = `Constraints: ${this.constraints.toString()}\n`
            + `Edges: ${ this.edges.toString()}\n`
            + `Spots: (`
        this.spots.map((spot, coord) =>
            result += spot.pop ? `${coord} -- ${spot} ` : ''
        )
        result += ')'
        return result
    }

    // // TODO test
    // superimpose(positions: Map<HexCoord, Spot>): Board {
    //     const newSpots = this.spots.withMutations((mSpots: Map<HexCoord, Spot>) => {
    //         // add each Spot in startPositions
    //         // TODO avoid conflicts? For now just overwrite
    //         // TODO test that overwriting works, at least
    //         positions.map((value: Spot, key: HexCoord) => {
    //             const oldSpot: Spot = mSpots.get(key, Spot.BLANK)
    //             mSpots.set(key, new Spot(value.owner, value.contents, oldSpot.terrain))
    //         })
    //     })
    //     return new Board(this.constraints, newSpots, this.edges)
    // }
}