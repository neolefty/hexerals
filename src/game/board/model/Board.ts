import {List, Map, Set} from 'immutable'

import {RectEdges} from './Constraints'
import {PlayerMove} from './Move'
import {Player} from './players/Players'
import {StatusMessage} from '../../../common/StatusMessage'
import {Arranger} from './Arranger'
import {Tile} from './Tile'
import {Hex} from './Hex'
import {BoardConstraints, RectangularConstraints} from './Constraints'
import {MoveValidator, MoveValidatorOptions} from './MoveValidator';
import {PopStepper} from './PopStepper';
import {RandomPlayerArranger} from './PlayerArranger';
import * as assert from 'assert';

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
export type TileSideEffect = (hex: Hex, tile: Tile) => void

export class Board {
    static readonly DEFAULT_ARRANGERS: Arranger[] = [new RandomPlayerArranger()]

    static construct(
        constraints: BoardConstraints,
        players: List<Player>,
        // there may be blank explicitTiles not listed here -- see allTiles
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
        return Board.constructRectangular(size, size * 2 - 1, players, arrangers)
    }

    static constructRectangular(
        w: number,
        h: number,
        players: List<Player>,
        arrangers: Arranger[] = this.DEFAULT_ARRANGERS,
        messages?: StatusMessage[],
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
        // empty explicitTiles are implied — see this.hexesAll
        readonly explicitTiles: Map<Hex, Tile>,
    ) {}

    get moveValidator(): MoveValidator { return this.rules.validator }
    get constraints(): BoardConstraints { return this.rules.constraints }
    get edges(): RectEdges { return this.rules.edges }
    get popStepper(): PopStepper { return this.rules.stepper }

    inBounds = (hex: Hex | undefined) =>
        !!(hex && this.constraints.inBounds(hex))

    canBeOccupied = (coord: Hex) =>
        this.inBounds(coord) && this.getTile(coord).canBeOccupied

    // All of this board's possible explicitTiles. Note that this.explicitTiles omits some blanks.
    get hexesAll(): Set<Hex> { return this.constraints.all }

    // tslint:disable-next-line:member-ordering
    private _occupiableCache: Set<Hex> | undefined = undefined
    get hexesOccupiable(): Set<Hex> {
        if (!this._occupiableCache)
            this._occupiableCache = this.filterTiles(
                tile => tile.canBeOccupied
            )
        return this._occupiableCache
    }

    // noinspection PointlessBooleanExpressionJS
    filterTiles = (filter: TileFilter): Set<Hex> =>
        this.hexesAll.filter(
            hex => !!(hex && filter(this.getTile(hex)))
        ) as Set<Hex>

    forNeighborsOccupiable(hex: Hex, sideEffect: TileSideEffect) {
        hex.neighbors.filter(
            neighbor => this.hexesOccupiable.has(neighbor)
        ).forEach(
            occ => sideEffect(occ, this.getTile(occ))
        )}

    forOccupiableTiles(sideEffect: TileSideEffect) {
        this.hexesOccupiable.forEach(hex => {
            sideEffect(hex, this.getTile(hex))
        })
    }

    getTile(coord: Hex): Tile {
        assert.ok(this.inBounds(coord))
        return this.explicitTiles.get(coord, Tile.MAYBE_EMPTY)
    }

    getCartTile(cx: number, cy: number): Tile {
        assert.strictEqual(((cx + cy) % 2), 0)
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

    toString(onlyTiles: boolean = false): string {
        let result = ''
        if (!onlyTiles)
            result += `Constraints: ${this.constraints.toString()}\n`
                + `Edges: ${ this.edges.toString()}\n`
                + `Non-blank tiles: (\n`
        this.explicitTiles.forEach((tile, hex) =>
            result += `   ${hex.toCartString()} — ${tile}\n`
        )
        if (!onlyTiles)
            result += ')'
        return result
    }
}