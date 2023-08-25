import { devAssert } from "./Environment"
import { Hex } from "./Hex"

// The shape of a board -- what hexes are in and not in the board?
export abstract class BoardConstraints {
    // what's a good place to start if we want to enumerate this board's coordinates?

    // static readonly LTE = (x: number, y: number) => (x <= y)
    static readonly LT = (x: number, y: number) => x < y
    // static readonly GTE = (x: number, y: number) => (x >= y)
    static readonly GT = (x: number, y: number) => x > y

    // noinspection JSUnusedGlobalSymbols
    protected constructor(readonly width: number, readonly height: number) {}

    // Override to have a constraints class start somewhere else.
    // Needs to be inBounds().
    // noinspection JSMethodCanBeStatic
    start(): Hex {
        return Hex.ORIGIN
    }

    toString = (): string => "BoardConstraints"

    // is coord within the constrained area?
    abstract inBounds(hex: Hex): boolean

    /**
     * Find coord at extreme value by default, finds the smallest, by
     * using BoardConstraints.LT. To find the largest instead, use
     * BoardConstraints.GT, or negate the sort value, or something.
     *
     * @param {(x: Hex) => number} hexToNumber indexing function
     * @param {(x: number, y: number) => boolean} compare ordering function
     * @returns {Hex} that wins in comparison to all the others
     */
    extreme(
        hexToNumber: (x: Hex) => number,
        compare: (x: number, y: number) => boolean = BoardConstraints.LT
    ): Hex {
        let champ: Hex = Hex.NONE
        this.all.forEach((contender) => {
            if (champ === Hex.NONE)
                // initialize
                champ = contender
            if (compare(hexToNumber(contender), hexToNumber(champ)))
                champ = contender
        })
        return champ
    }

    // tslint:disable-next-line:member-ordering
    private _allHexes?: ReadonlySet<Hex>
    get all(): ReadonlySet<Hex> {
        if (this._allHexes === undefined) this._allHexes = this.buildAll()
        return this._allHexes
    }

    // tslint:disable-next-line:member-ordering
    private _allReverseSorted?: ReadonlyArray<Hex> = undefined
    get allReverseSorted(): ReadonlyArray<Hex> {
        if (this._allReverseSorted === undefined) {
            this._allReverseSorted = Object.freeze(
                Array.from(this.all).sort((a, b) => b.compareTo(a))
            )
        }
        return this._allReverseSorted
    }

    // Compile the set of all hexes that are in bounds and connected to this.start().
    private buildAll(): ReadonlySet<Hex> {
        const result = new Set<Hex>()

        let floodEdge = new Set<Hex>()
        devAssert(this.inBounds(this.start()))
        floodEdge.add(this.start())

        // Could do this recursively but for large boards it overflows the stack
        // Flood out from this.start(), one layer at a time
        const floodNeighbors = (x: Hex) => {
            result.add(x)
            x.neighbors.forEach((neighbor) => {
                // discard any that are out of bounds or already included
                // conversely: keep those that are in bounds and novel
                if (this.inBounds(neighbor) && !result.has(neighbor))
                    floodEdge.add(neighbor)
            })
        }
        while (floodEdge.size !== 0) {
            // freeze the old edge
            const oldEdge = floodEdge
            // start building a new edge
            floodEdge = new Set<Hex>()
            oldEdge.forEach(floodNeighbors)
        }

        return result
    }
}

// Defines a board of flat-top hexes with an overall rectangular shape.
//
// w — number of columns (which overlap slightly)
// h — number of rows, whose hexes alternate between having even & odd cartesian x
//
// For example 5 x 7:
//   - _ - _ -
//   - _ - _ -
//   - _ - _ -
//   -    -   -
//
// Note that w should be an integer, and h can be divisible by 0.5
export class RectangularConstraints extends BoardConstraints {
    static constructDefault(w: number, h: number): RectangularConstraints {
        return new RectangularConstraints(w, h)
    }

    constructor(readonly w: number, readonly h: number) {
        super(w, h)
    }

    inBounds(coord: Hex): boolean {
        const x = coord.cartX
        const y = coord.cartY
        return y >= 0 && y < this.h && x >= 0 && x < this.w
    }

    override toString = (): string => `${this.w} x ${this.h}`
}
