import * as assert from 'assert'
import {List, Map} from 'immutable'
import {RectEdges} from './Constraints'
import {PlayerMove} from './Move'
import {Player} from '../../players/Players'
import {StatusMessage} from '../../../common/StatusMessage'
import {Arranger, RandomPlayerArranger} from './Arranger'
import {Spot} from './Spot'
import {HexCoord} from './HexCoord'
import {BoardConstraints, RectangularConstraints} from './Constraints'
import {MoveValidator, MoveValidatorOptions} from './MoveValidator';
import {PopStepper} from './PopStepper';

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

export class BoardRules {
    constructor (
        readonly constraints: BoardConstraints,
        readonly edges: RectEdges = new RectEdges(constraints),
        readonly validator: MoveValidator = new MoveValidator(constraints),
        readonly stepper: PopStepper = new PopStepper(),
    ) {}
}

export class Board {
    static readonly DEFAULT_ARRANGERS: Arranger[] = [new RandomPlayerArranger()]

    static construct(
        constraints: BoardConstraints,
        players: List<Player>,
        spots: Map<HexCoord, Spot> = Map(),
    ) {
        return new Board(
            new BoardRules(constraints),
            players,
            spots,
        )
    }

    static constructSquare(
        size: number,
        players: List<Player>,
        arrangers: Arranger[] = this.DEFAULT_ARRANGERS,
    ) {
        return Board.constructRectangular(size, size, players, arrangers)
    }

    static constructRectangular(
        w: number,
        h: number,
        players: List<Player>,
        arrangers: Arranger[] = this.DEFAULT_ARRANGERS,
    ): Board {
        const constraints = new RectangularConstraints(w, h)
        let result = Board.construct(constraints, players)
        arrangers.forEach(arranger =>
            result = result.overlaySpots(arranger.arrange(result))
        )
        return result
    }

    // keep constructor private so that edges doesn't get mis-constructed
    private constructor(
        readonly rules: BoardRules,
        readonly players: List<Player>,
        // non-blank spots on the map
        readonly spots: Map<HexCoord, Spot>,
    ) {}

    get moveValidator(): MoveValidator { return this.rules.validator }
    get constraints(): BoardConstraints { return this.rules.constraints }
    get edges(): RectEdges { return this.rules.edges }
    get popStepper(): PopStepper { return this.rules.stepper }

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

    setSpots(spots: Map<HexCoord, Spot>): Board {
        return (this.spots === spots)
            ? this
            : new Board(this.rules, this.players, spots)
    }

    overlaySpots(overlay: Map<HexCoord, Spot>): Board {
        return this.setSpots(
            this.spots.withMutations(
                (mSpots: Map<HexCoord, Spot>) => {
                    overlay.forEach((value: Spot, key: HexCoord) => {
                        mSpots.set(key, value)
                    })
                })
        )
    }

    // Do some moves.
    // Illegal moves are skipped -- for example if a player no longer controls a hex.
    applyMoves(moves: List<PlayerMove>): BoardAndMessages {
        const options = new MoveValidatorOptions(this.spots, [])
        this.moveValidator.applyMoves(moves, options)
        return new BoardAndMessages(
            this.setSpots(options.spots),
            List(options.status || []),
        )
    }

    stepPop(turn: number): Board {
        return this.popStepper.step(this, turn)
    }

    validate(
        move: PlayerMove,
        options: MoveValidatorOptions = this.validationOptions(),
    ): boolean {
        return this.moveValidator.validate(move, options)
    }

    // factory method
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

    isEmpty(hex: HexCoord) {
        return !this.spots.has(hex) || this.getSpot(hex).isBlank()
    }
}