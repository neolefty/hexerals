import {HexCoord} from './HexCoord'
import {Range, Seq, Set} from 'immutable'
import * as assert from 'assert'

export class RectEdges {
    readonly left: number
    readonly right: number
    readonly top: number
    readonly bottom: number

    // width and height in cartesian coords
    readonly width: number
    readonly height: number

    readonly lowerLeft: HexCoord // (0, 0)
    readonly lowerRight: HexCoord // (2(w-1), 0)
    readonly upperLeft: HexCoord // (0, h-1)
    readonly upperRight: HexCoord // (2(w-1), h-1)

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
    private allCache?: Set<HexCoord>
    // what's a good place to start if we want to enumerate this board's coordinates?

    // static readonly LTE = (x: number, y: number) => (x <= y)
    static readonly LT = (x: number, y: number) => (x < y)
    // static readonly GTE = (x: number, y: number) => (x >= y)
    static readonly GT = (x: number, y: number) => (x > y)

    // Override to have a constraints class start somewhere else.
    // Needs to be inBounds().
    // noinspection JSMethodCanBeStatic
    start(): HexCoord {
        return HexCoord.ORIGIN
    }

    toString = (): string => 'BoardConstraints'

    // is coord within the constrained area?
    abstract inBounds(coord: HexCoord): boolean

    /**
     * Find coord at extreme value by default, finds the smallest, by
     * using BoardConstraints.LT. To find the largest instead, use
     * BoardConstraints.GT, or negate the sort value, or something.
     *
     * @param {(x: HexCoord) => number} f indexing function
     * @param {(x: number, y: number) => boolean} compare ordering function
     * @returns {HexCoord} that wins in comparison to all the others
     */
    extreme(
        f: (x: HexCoord) => number,
        compare: (x: number, y: number) => boolean = BoardConstraints.LT
    ): HexCoord {
        return this.all().reduce((champ: HexCoord, contender: HexCoord) =>
            compare(f(contender), f(champ)) ? contender : champ
        )
    }

    all(): Set<HexCoord> {
        if (this.allCache === undefined)
            this.allCache = this.buildAll()
        return this.allCache
    }

    // Compile the set of all hexes that are in bounds and connected to this.start().
    private buildAll(): Set<HexCoord> {
        const result = Set<HexCoord>().asMutable()

        let floodEdge = Set<HexCoord>().asMutable()
        assert(this.inBounds(this.start()))
        floodEdge.add(this.start())

        // Could do this recursively but for large boards it overflows the stack

        // Flood out from this.start(), one layer at a time
        while (!floodEdge.isEmpty()) {
            // freeze the old edge
            const oldEdge = floodEdge.asImmutable()
            // start building a new edge
            floodEdge = Set<HexCoord>().asMutable()
            oldEdge.forEach(x => {
                result.add(x)
                x.getNeighbors().map(neighbor => {
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

// Defines a board of hexes with an overall rectangular shape.
// If width and height are w and h, then -- assuming both are odd -- the corners are:
// (0,0,0)      (w-1, -(w-1)/2, -(w-1)/2)
// (0, -(h-1), h-1) (w-1, -(w-1)/2 -(h-1), -(w-1)/2 +(h-1))
//
// General formula: (cx, (cy - cx) / 2, - (cy + cx) / 2)
export class RectangularConstraints extends BoardConstraints {
    constructor(readonly w: number, readonly h: number) {
        super()
    }

    inBounds(coord: HexCoord): boolean {
        const x = coord.cartX
        const y = coord.cartY
        return (
            // vertical: height of 3 means y = { 0, 1, 2 }
            y >= 0 && y < this.h
            // horizontal: make right edge same shape as left edge. E.g. 5x5 would be:
            //   * * * * *
            //    * * * *
            //   * * * * *
            //    * * * *
            //   * * * * *
            // - _ - _ - _ - _ -
            // - _ - _ - _ - _ -
            // -    -   -    -    -
            && x >= 0 && x < this.w * 2 - 1
        )
    }

    toString = (): string => `${this.w} x ${this.h}`
}
