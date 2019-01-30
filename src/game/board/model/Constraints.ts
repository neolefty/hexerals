import {Hex} from './Hex'
import {List, Range, Seq, Set} from 'immutable'
import * as assert from 'assert';

export class RectEdges {
    readonly left: number
    readonly right: number
    readonly top: number
    readonly bottom: number

    // width and height in cartesian coords
    readonly width: number
    readonly height: number

    readonly lowerLeft: Hex // (0, 0)
    readonly lowerRight: Hex // (2(w-1), 0)
    readonly upperLeft: Hex // (0, h-1)
    readonly upperRight: Hex // (2(w-1), h-1)

    constructor(constraints: BoardConstraints) {
        this.left = constraints.extreme(h => h.cartX).cartX // min x
        this.right = constraints.extreme(h => -h.cartX).cartX // max x
        this.bottom = constraints.extreme(h => h.cartY).cartY // min y
        this.top = constraints.extreme(h => -h.cartY).cartY // max y

        this.height = (this.top - this.bottom) + 1
        this.width = (this.right - this.left) + 1

        this.lowerLeft = constraints.extreme(
            h => h.cartY * this.width + h.cartX // min y, min x
        )
        this.lowerRight = constraints.extreme(
            h => h.cartY * this.width - h.cartX // min y, max x
        )
        this.upperLeft = constraints.extreme(
            h => -h.cartY * this.width + h.cartX // max y, min x
        )
        this.upperRight = constraints.extreme(
            h => -h.cartY * this.width - h.cartX // max y, max x
        )
    }

    xRange(): Seq.Indexed<number> {
        return Range(this.left, this.right + 1)
    }

    yRange(): Seq.Indexed<number> {
        return Range(this.bottom, this.top + 1)
    }

    toString(): string {
        return `left ${this.left}, right ${this.right}, top ${this.top}, bottom ${this.bottom}`
    }
}

// The shape of a board -- what hexes are in and not in the board?
export abstract class BoardConstraints {
    // what's a good place to start if we want to enumerate this board's coordinates?

    // static readonly LTE = (x: number, y: number) => (x <= y)
    static readonly LT = (x: number, y: number) => (x < y)
    // static readonly GTE = (x: number, y: number) => (x >= y)
    static readonly GT = (x: number, y: number) => (x > y)

    // Override to have a constraints class start somewhere else.
    // Needs to be inBounds().
    // noinspection JSMethodCanBeStatic
    start(): Hex {
        return Hex.ORIGIN
    }

    toString = (): string => 'BoardConstraints'

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
        let champ: Hex = this.all.first()
        this.all.forEach(contender => {
            if (compare(
                hexToNumber(contender),
                hexToNumber(champ)
            ))
                champ = contender
        })
        return champ
    }

    // tslint:disable-next-line:member-ordering
    private _allHexes?: Set<Hex>
    get all(): Set<Hex> {
        if (this._allHexes === undefined)
            this._allHexes = this.buildAll()
        return this._allHexes
    }

    // tslint:disable-next-line:member-ordering
    private _allSorted?: List<Hex> = undefined
    get allSorted(): List<Hex> {
        if (this._allSorted === undefined) {
            this._allSorted = List<Hex>(this.all).sort(
                (a: Hex, b: Hex) =>
                    a.compareTo(b)
            ) as List<Hex>
        }
        return this._allSorted
    }

    // Compile the set of all hexes that are in bounds and connected to this.start().
    private buildAll(): Set<Hex> {
        const result = Set<Hex>().asMutable()

        let floodEdge = Set<Hex>().asMutable()
        assert.ok(this.inBounds(this.start()))
        floodEdge.add(this.start())

        // Could do this recursively but for large boards it overflows the stack

        // Flood out from this.start(), one layer at a time
        while (!floodEdge.isEmpty()) {
            // freeze the old edge
            const oldEdge = floodEdge.asImmutable()
            // start building a new edge
            floodEdge = Set<Hex>().asMutable()
            oldEdge.forEach(x => {
                result.add(x)
                x.neighbors.map(neighbor => {
                    // discard any that are out of bounds or already included
                    // conversely: keep those that are in bounds and novel
                    if (this.inBounds(neighbor) && !result.contains(neighbor))
                        floodEdge.add(neighbor)
                })
            })
        }

        return result.asImmutable()
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
    constructor(readonly w: number, readonly h: number) {
        super()
        assert.strictEqual(w, Math.round(w))
        assert.strictEqual(h, Math.round(h))
    }

    inBounds(coord: Hex): boolean {
        const x = coord.cartX
        const y = coord.cartY
        return (
            y >= 0 && y < this.h && x >= 0 && x < this.w
        )
    }

    toString = (): string => `${this.w} x ${this.h}`
}
