import * as assert from 'assert'
import {List, Map, Set} from 'immutable'

import {RectEdges} from './Constraints'
import {PlayerMove} from './Move'
import {Player} from '../../players/Players'
import {StatusMessage} from '../../../common/StatusMessage'
import {Arranger} from './Arranger'
import {Tile} from './Tile'
import {Hex} from './Hex'
import {BoardConstraints, RectangularConstraints} from './Constraints'
import {MoveValidator, MoveValidatorOptions} from './MoveValidator';
import {PopStepper} from './PopStepper';
import {RandomPlayerArranger} from './PlayerArranger';

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

export type TileFilter = (tile: Tile) => boolean

export class Board {
    static readonly DEFAULT_ARRANGERS: Arranger[] = [new RandomPlayerArranger()]

    static construct(
        constraints: BoardConstraints,
        players: List<Player>,
        // there may be blank tiles not listed here -- see allTiles
        explicitTiles: Map<Hex, Tile> = Map(),
    ) {
        return new Board(
            new BoardRules(constraints),
            players,
            explicitTiles,
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
        messages: StatusMessage[] | undefined = undefined,
    ): Board {
        const constraints = new RectangularConstraints(w, h)
        let result = Board.construct(constraints, players)
        arrangers.forEach(arranger =>
            result = result.overlayTiles(
                arranger.arrange(result, messages)
            )
        )
        return result
    }

    // keep constructor private so that edges doesn't get mis-constructed
    private constructor(
        readonly rules: BoardRules,
        readonly players: List<Player>,
        // empty tiles are implied — see this.allHexes
        readonly explicitTiles: Map<Hex, Tile>,
    ) {}

    get moveValidator(): MoveValidator { return this.rules.validator }
    get constraints(): BoardConstraints { return this.rules.constraints }
    get edges(): RectEdges { return this.rules.edges }
    get popStepper(): PopStepper { return this.rules.stepper }

    inBounds = (coord: Hex) => this.constraints.inBounds(coord)

    canBeOccupied = (coord: Hex) =>
        this.inBounds(coord) && this.getTile(coord).canBeOccupied()

    // All of this board's possible tiles. Note that this.explicitTiles omits some blanks.
    get allHexes(): Set<Hex> {
        return this.constraints.all()
    }

    // noinspection PointlessBooleanExpressionJS
    filterTiles = (filter: TileFilter): Set<Hex> =>
        this.allHexes.filter(
            hex => !!(hex && filter(this.getTile(hex)))
        ) as Set<Hex>

    getTile(coord: Hex): Tile {
        assert(this.inBounds(coord))
        return this.explicitTiles.get(coord, Tile.BLANK)
    }

    getCartTile(cx: number, cy: number): Tile {
        assert((cx + cy) % 2 === 0)
        return this.getTile(Hex.getCart(cx, cy))
    }

    applyMove(move: PlayerMove): BoardAndMessages {
        return this.applyMoves(List([move]))
    }

    setTiles(tiles: Map<Hex, Tile>): Board {
        return (this.explicitTiles.equals(tiles))
            ? this
            : new Board(this.rules, this.players, tiles)
    }

    overlayTiles(overlay: Map<Hex, Tile>): Board {
        return this.setTiles(
            this.explicitTiles.withMutations(
                (mTiles: Map<Hex, Tile>) => {
                    overlay.forEach((value: Tile, key: Hex) => {
                        mTiles.set(key, value)
                    })
                })
        )
    }

    // Do some moves.
    // Illegal moves are skipped -- for example if a player no longer controls a hex.
    applyMoves(moves: List<PlayerMove>): BoardAndMessages {
        const options = new MoveValidatorOptions(this.explicitTiles, [])
        this.moveValidator.applyMoves(moves, options)
        return new BoardAndMessages(
            this.setTiles(options.tiles),
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
        return new MoveValidatorOptions(this.explicitTiles, messages)
    }

    toString(): string {
        let result = `Constraints: ${this.constraints.toString()}\n`
            + `Edges: ${ this.edges.toString()}\n`
            + `Non-blank tiles: (`
        this.explicitTiles.forEach((tile, coord) =>
            result += tile.isBlank() ? '' : `${coord} — ${tile} `
        )
        result += ')'
        return result
    }
}