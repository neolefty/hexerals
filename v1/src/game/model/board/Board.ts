import {List, Map, Seq, Set} from 'immutable'
import {devAssert} from "../../../common/Environment"
import {StatusMessage} from '../../../common/StatusMessage'
import {Hex} from '../hex/Hex'
import {HexPaths} from '../hex/ShortestPath'
import {Terrain} from '../hex/Terrain'
import {Tile} from '../hex/Tile'
import {Capture} from '../move/Capture'
import {PlayerMove} from '../move/Move'
import {MoveValidator, MoveValidatorOptions} from '../move/MoveValidator'
import {Player} from '../players/Players'
import {RandomPlayerArranger} from '../setup/PlayerArranger'
import {TileArranger} from '../setup/TileArranger'
import {BoardStat} from './BoardStat'
import {BoardConstraints, RectangularConstraints, RectEdges} from './Constraints'
import {DEFAULT_LOCAL_GAME_OPTIONS, LocalGameOptions} from './LocalGameOptions'
import {Niches} from "./Niches"
import {PopStepper} from './PopStepper'

export class BoardAndMessages {
    constructor(
        readonly board: Board,
        readonly messages: List<StatusMessage>,
        readonly captures: List<Capture>,
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
        readonly stepper: PopStepper = new PopStepper(constraints.opts),
    ) {}

    private _niches?: Niches
    get niches(): Niches {
        if (!this._niches)
            this._niches = new Niches(this)
        return this._niches
    }
}

export type TileFilter = (tile: Tile) => boolean
export type HexTileFilter = (entry: [Hex, Tile]) => boolean
export type TileSideEffect = (hex: Hex, tile: Tile) => void

export class Board {
    static readonly DEFAULT_ARRANGERS: TileArranger[] = [new RandomPlayerArranger()]

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

    static constructDefaultSquare(
        size: number,
        players: List<Player> = List(),
        arrangers: TileArranger[] = this.DEFAULT_ARRANGERS,
        messages?: StatusMessage[],
    ): Board {
        return Board.constructDefaultRectangular(
            size, size * 2 - 1, players, arrangers, messages,
        )
    }

    static constructDefaultRectangular(
        w: number,
        h: number,
        players: List<Player> = List(),
        arrangers: TileArranger[] = this.DEFAULT_ARRANGERS,
        messages?: StatusMessage[],
    ): Board {
        return Board.constructRectangular({
            ...DEFAULT_LOCAL_GAME_OPTIONS,
            boardWidth: w,
            boardHeight: h,
        }, players, arrangers, messages)
    }

    static constructRectangular(
        opts: LocalGameOptions,
        players: List<Player> = List(),
        // TODO replace with LocalGameOptions.randomStart
        arrangers: TileArranger[] = this.DEFAULT_ARRANGERS,
        messages?: StatusMessage[],
    ): Board {
        const constraints = new RectangularConstraints(opts)
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
        // empty tiles are implied — see this.hexesAll
        readonly explicitTiles: Map<Hex, Tile>,
    ) {}

    // change who is playing
    withPlayers = (players: List<Player>) =>
        new Board(this.rules, players, this.explicitTiles)

    get moveValidator(): MoveValidator { return this.rules.validator }
    get constraints(): BoardConstraints { return this.rules.constraints }
    get edges(): RectEdges { return this.rules.edges }
    get popStepper(): PopStepper { return this.rules.stepper }
    get opts(): LocalGameOptions { return this.constraints.opts }
    // half-hexes at top & bottom
    get niches(): Niches { return this.rules.niches }

    perceivedTurn(turn: number): number {
        return Math.floor(turn / this.opts.cityTicks)
    }

    inBounds = (hex: Hex | undefined) =>
        !!(hex && this.constraints.inBounds(hex))

    canBeOccupied = (coord: Hex) =>
        this.inBounds(coord) && this.getTile(coord).canBeOccupied

    // All of this board's possible tiles. Note that this.explicitTiles omits some blanks.
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

    // tslint:disable-next-line:member-ordering
    private _hexPaths?: HexPaths
    // path-finding for this board's empty hexes
    get emptyHexPaths(): HexPaths {
        if (!this._hexPaths)
            this._hexPaths = new HexPaths(
                this.filterTiles(tile => tile.terrain === Terrain.Empty)
            )
        return this._hexPaths
    }

    private _capitals?: Map<Hex, Tile>
    get capitals(): Map<Hex, Tile> {
        if (!this._capitals)
            this._capitals = Map(this.filterOwnedTiles(([hex, tile]) =>
                tile.terrain === Terrain.Capital)
            )
        return this._capitals
    }

    // filter tiles that have an owner
    filterOwnedTiles = (filter: HexTileFilter): Seq.Indexed<[Hex, Tile]> =>
        this.explicitTiles.entrySeq().filter(filter)

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

    // reduce over all explicit tiles, separating by a key
    gatherStatistics<K>(
        initialValue: number,
        keyer: (tile: Tile, hex: Hex) => K,
        extractor: (tile: Tile, hex: Hex) => number,
    ): BoardStat<K> {
        let total = initialValue
        const stats: Map<K, number> = Map<K, number>().withMutations(result =>
            this.explicitTiles.forEach((tile, hex) => {
                if (tile.owner !== Player.Nobody) {
                    const k = keyer(tile, hex)
                    const curV = result.get(k, initialValue)
                    const thisV = extractor(tile, hex)
                    total = total + thisV
                    result.set(k, curV + thisV)
                }
            })
        )
        return new BoardStat<K>(stats, total)
    }

    // tslint:disable-next-line:member-ordering
    private _hexStatistics?: BoardStat<Player>
    // how many hexes each player controls
    getHexStatistics(): BoardStat<Player> {
        if (this._hexStatistics === undefined)
            this._hexStatistics = this.gatherStatistics<Player>(
                0,
                tile => tile.owner,
                (/* tile, hex */) => 1,
            )
        return this._hexStatistics
    }

    // tslint:disable-next-line:member-ordering
    private _popStatistics?: BoardStat<Player>
    // how much total population each player has
    getPopStatistics(): BoardStat<Player> {
        if (this._popStatistics === undefined)
            this._popStatistics = this.gatherStatistics(
                0,
                tile => tile.owner,
                (tile/*, hex*/) => tile.pop,
            )
        return this._popStatistics
    }

    getTile(coord: Hex): Tile {
        devAssert(this.inBounds(coord))
        return this.explicitTiles.get(coord, Tile.MAYBE_EMPTY)
    }

    getCartTile(cx: number, cy: number): Tile {
        devAssert((cx + cy) % 2 === 0)
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
            List(options.captures),
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
