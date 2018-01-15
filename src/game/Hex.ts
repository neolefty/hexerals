import * as assert from 'assert';
import { List, Map, Range, Seq, Set } from 'immutable';

// HexCoord.get(x, y, z)  or HexCoord.getCart(cx, cy) -- constructor is private.
// "Cube coordinates"; for a description, see:
// www.redblobgames.com/grids/hexagons/#coordinates-cube
export class HexCoord {
    // keys are x and then y
    private static readonly instanceCache
        = Map<number, Map<number, HexCoord>>().asMutable();
    private static ID = 0;

    // a HexCoord whose x, y, and z are all NaN
    static readonly NONE = new HexCoord(NaN, NaN);
    static readonly ORIGIN = HexCoord.get(0, 0, 0);

    // neighbor directions
    static readonly RIGHT = HexCoord.get(1, -1, 0);
    static readonly RIGHT_UP = HexCoord.get(1, 0, -1);
    static readonly LEFT_UP = HexCoord.get(0, 1, -1);
    static readonly LEFT = HexCoord.get(-1, 1, 0);
    static readonly LEFT_DOWN = HexCoord.get(-1, 0, 1);
    static readonly RIGHT_DOWN = HexCoord.get(0, -1, 1);

    // TODO test consistency
    static readonly DIRECTIONS: List<HexCoord> = List([
        HexCoord.RIGHT, HexCoord.RIGHT_UP, HexCoord.LEFT_UP,
        HexCoord.LEFT, HexCoord.LEFT_DOWN, HexCoord.RIGHT_DOWN,
    ]);

    // useful as a key in react components
    readonly id = HexCoord.ID++;

    // z: leftUp-rightDown
    readonly z: number;

    private neighborsCache?: List<HexCoord>;

    static get(x: number, y: number, z: number): HexCoord {
        const total = x + y + z;
        if (isNaN(total)) return HexCoord.NONE;
        else {
            assert(total === 0);
            // TODO eliminate memory leak of accumulated cache
            // (tried WeakMap but couldn't get it to work -- see git log)
            let yCache = HexCoord.instanceCache.get(x);
            if (yCache === undefined) {
                yCache = Map<number, HexCoord>().asMutable();
                HexCoord.instanceCache.set(x, yCache);
            }
            let result = yCache.get(y);
            if (result === undefined) {
                result = new HexCoord(x, y);
                yCache.set(y, result);
            }
            return result;
        }
    }

    // Convert from cartesian (rectangular) coordinates.
    // X goes to the right and Y goes down.
    // Hexes are considered 2 wide and 1 high and centered at their coordinates.
    // For example, (0,0,0) is the origin hex whose cartesian coord is (0,0).
    // Its right neighbor at (1, -1, 0) has a cartesian coord (2, 0).
    // There is no hex at (1, 0) since that is on the edge between the two.
    // The origin's lower-left neighbor at (-1, 0, 1) has a cartesian coord (-1, 1).
    // In other words, (x + y) must be even.
    static getCart(cx: number, cy: number): HexCoord {
        assert((cx + cy) % 2 === 0);
        return HexCoord.get((cx - cy) / 2, - (cx + cy) / 2, cy);
    }

    plus(that: HexCoord): HexCoord {
        return HexCoord.get(this.x + that.x, this.y + that.y, this.z + that.z);
    }

    times(n: number): HexCoord {
        return HexCoord.get(this.x * n, this.y * n, this.z * n);
    }

    // Note: Useful for Manhattan hex distance -- a.minus(b).maxAbs().
    maxAbs() {
        // noinspection JSSuspiciousNameCombination
        return Math.max(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z));
    }

    getNeighbors(): List<HexCoord> {
        if (this.neighborsCache === undefined) {
            this.neighborsCache = List<HexCoord>(
                HexCoord.DIRECTIONS.map(c => this.plus(c))
            );
        }
        return this.neighborsCache;
    }

    getRight(): HexCoord { return this.plus(HexCoord.RIGHT); }
    getRightUp(): HexCoord { return this.plus(HexCoord.RIGHT_UP); }
    getRightDown(): HexCoord { return this.plus(HexCoord.RIGHT_DOWN); }
    getLeft(): HexCoord { return this.plus(HexCoord.LEFT); }
    getLeftDown(): HexCoord { return this.plus(HexCoord.LEFT_DOWN); }
    getLeftUp(): HexCoord { return this.plus(HexCoord.LEFT_UP); }

    // TODO test consistency -- maybe randomly create coords and navigate nearby using both hex & cartesian coords
    // convert to rectangular X, assuming flat-topped hexagons twice as wide as high
    cartX(): number { return this.x - this.y; }

    // convert to rectangular Y, assuming flat-topped hexagons twice as wide as high
    cartY(): number { return this.z; }

    toString(includeCart: boolean = false) {
        return `[${ this.x },${ this.y },${ this.z }]${ includeCart ? ' ' + this.toCartString() : '' }`;
    }

    toCartString() {
        return `(${this.cartX()},${this.cartY()})`;
    }

    // Private constructor: access instances through get() or getCart().
    // Instances are interned in HexCoord.instanceCache
    private constructor(readonly x: number, readonly y: number) {
        // x: left-right
        // y: leftDown-rightUp
        this.z = -x - y;
    }
}

export class RectEdges {
    readonly left: number;
    readonly right: number;
    readonly top: number;
    readonly bottom: number;

    readonly width: number;
    readonly height: number;

    readonly upperLeft: HexCoord;
    readonly upperRight: HexCoord;
    readonly lowerLeft: HexCoord;
    readonly lowerRight: HexCoord;

    constructor(constraints: BoardConstraints) {
        this.left = constraints.extreme(x => x.cartX()).cartX();
        this.right = constraints.extreme(x => -x.cartX()).cartX();
        this.top = constraints.extreme(x => x.cartY()).cartY();
        this.bottom = constraints.extreme(x => -x.cartY()).cartY();

        this.height = (this.bottom - this.top) + 1;
        this.width = (this.right - this.left) + 1;

        this.upperLeft = constraints.extreme(
            h => h.cartY() * this.width + h.cartX()
        );
        this.lowerRight = constraints.extreme(
            h => - (h.cartY() * this.width + h.cartX())
        );
        this.upperRight = constraints.extreme(
            h => h.cartY() * this.width - h.cartX()
        );
        this.lowerLeft = constraints.extreme(
            h => - h.cartY() * this.width + h.cartX()
        );
    }

    xRange(): Seq.Indexed<number> {
        return Range(this.left, this.right + 1);
    }

    yRange(): Seq.Indexed<number> {
        return Range(this.top, this.bottom + 1);
    }
}

// The shape of a board -- what hexes are in and not in the board?
export abstract class BoardConstraints {
    private allCache?: Set<HexCoord>;
    // what's a good place to start if we want to enumerate this board's coordinates?

    // static readonly LTE = (x: number, y: number) => (x <= y);
    static readonly LT = (x: number, y: number) => (x < y);
    // static readonly GTE = (x: number, y: number) => (x >= y);
    static readonly GT = (x: number, y: number) => (x > y);

    // Override to have a constraints class start somewhere else.
    // Needs to be inBounds().
    // noinspection JSMethodCanBeStatic
    start(): HexCoord {
        return HexCoord.ORIGIN;
    }

    // is coord within the constrained area?
    abstract inBounds(coord: HexCoord): boolean;

    /**
     * Find coord at extreme value; by default, finds the smallest, by
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
        );
    }

    all(): Set<HexCoord> {
        if (this.allCache === undefined)
            this.allCache = this.buildAll();
        return this.allCache;
    }

    // Compile the set of all hexes that are in bounds and connected to this.start().
    private buildAll(): Set<HexCoord> {
        const result = Set<HexCoord>().asMutable();

        let floodEdge = Set<HexCoord>().asMutable();
        assert(this.inBounds(this.start()));
        floodEdge.add(this.start());

        // Could do this recursively but for large boards it overflows the stack

        // Flood out from this.start(), one layer at a time
        while (!floodEdge.isEmpty()) {
            // freeze the old edge
            const oldEdge = floodEdge.asImmutable();
            // start building a new edge
            floodEdge = Set<HexCoord>().asMutable();
            oldEdge.forEach(x => {
                result.add(x);
                x.getNeighbors().map(neighbor => {
                    // discard any that are out of bounds or already included
                    // conversely: keep those that are in bounds and novel
                    if (this.inBounds(neighbor) && !result.contains(neighbor))
                        floodEdge.add(neighbor);
                });
            });
        }

        return result.asImmutable();
    }
}

// Defines a board of hexes with an overall rectangular shape.
// If height and width are H and W, then the corners are
// (0,0,0)      (w, -w, 0)
// (-h/2, -h/2, h) (w-h/2, w-h/2, h)
export class RectangularConstraints extends BoardConstraints {
    constructor(readonly w: number, readonly h: number) {
        super();
    }

    inBounds(coord: HexCoord): boolean {
        const x = coord.cartX();
        const y = coord.cartY();
        return (
            // vertical: height of 3 means y = { 0, 1, 2 }
            y >= 0 && y < this.h
            // horizontal: make right edge same shape as left edge. E.g. 5x5 would be:
            //   * * * * *
            //    * * * *
            //   * * * * *
            //    * * * *
            //   * * * * *
            && x >= 0 && x < this.w * 2 - 1
        );
    }
}