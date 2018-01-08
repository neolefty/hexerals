import * as assert from 'assert';
import {List, Record, Set} from 'immutable';

class HexCoordCacheKey extends Record({x: NaN, y: NaN}) {}

// HexCoord.get(x, y, z)  or HexCoord.getCart(cx, cy) -- constructor is private.
// "Cube coordinates"; for a description, see:
// www.redblobgames.com/grids/hexagons/#coordinates-cube
export class HexCoord {
    // intern instances in a GC-safe way, so we can use ===
    // key is [x,y]
    // (must be declared before being use)
    /*private*/ static instanceCache = new WeakMap();

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

    // z: leftUp-rightDown
    readonly z: number;

    private neighborsCache?: List<HexCoord>;

    static get(x: number, y: number, z: number): HexCoord {
        assert(x + y + z === 0);
        const key = {x: x, y: y};
        if (HexCoord.instanceCache.has(key))
            return HexCoord.instanceCache.get(key);
        else
            return new HexCoord(x, y);
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
        return HexCoord.get((cx - cy) / 2, (cx + cy) / 2, cy);
    }

    plus(that: HexCoord): HexCoord {
        return HexCoord.get(this.x + that.x, this.y + that.y, this.z + that.z);
    }

    times(n: number): HexCoord {
        return HexCoord.get(this.x * n, this.y * n, this.z * n);
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

    abs() {
        // noinspection JSSuspiciousNameCombination
        return Math.max(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z));
    }

    toString(includeCart: boolean=false) {
        return `[${this.x},${this.y},${this.z}${includeCart?' ' + this.toCartString():''}]`;
    }

    toCartString() {
        return `(${this.cartX()},${this.cartY()})`;
    }

    private cacheKey: HexCoordCacheKey;

    // Private constructor: access instances through get() or getCart().
    // Instances are interned in HexCoord.instanceCache
    private constructor(readonly x: number, readonly y: number) {
        // x: left-right
        // y: leftDown-rightUp
        this.z = -x - y;
        // Keep a reference to this key so that as long as this object isn't gc'd, its key
        // stays in the WeakMap. In other words, once this hex coord has no more
        // references, it is subject to gc and therefore its key is too, so it can be removed
        // from the cache.
        this.cacheKey = new HexCoordCacheKey({x: x, y: y});
        HexCoord.instanceCache.set(this.cacheKey, this);
    }
}

// The shape of a board -- what hexes are in and not in the board?
export abstract class HexBoardConstraints {
    private allCache?: Set<HexCoord>;
    // what's a good place to start if we want to enumerate this board's coordinates?

    static readonly LTE = (x: number, y: number) => (x <= y);
    static readonly LT = (x: number, y: number) => (x < y);
    static readonly GTE = (x: number, y: number) => (x >= y);
    static readonly GT = (x: number, y: number) => (x > y);

    // Override to have a constraints class start somewhere else.
    // Needs to be inBounds().
    // noinspection JSMethodCanBeStatic
    start(): HexCoord {
        return HexCoord.ORIGIN;
    }

    // is coord within the constrained area?
    abstract inBounds(coord: HexCoord): boolean;

    // Find an extreme value
    extreme(
        f: (x: HexCoord) => number,
        compare: (x: number, y: number) => boolean = HexBoardConstraints.LT
    ): HexCoord {
        return this.all().reduce((champ: HexCoord, contender: HexCoord) =>
            compare(f(contender), f(champ)) ? contender : champ
        );
    }

    all(): Set<HexCoord> {
        if (this.allCache === undefined)
            this.allCache = Set<HexCoord>().withMutations(this.buildAll.bind(this));
        return this.allCache;
    }

    /**
     * Compile the set of all hexes that are in bounds and connected to this.start().
     * @param {Set<HexCoord>} inBounds the set so far; any hexes in this set
     * will not be revisited
     * @param {Set<HexCoord>} oob (aka outOfBounds: any hexes visited but found
     * to be not within bounds. Keep track of these so that we can avoid re-checking them.
     * // TODO seems like we shouldn't really need oob?
     * @param {HexCoord} x the current hex whose neighbors we're checking.
     */
    private buildAll(
        inBounds: Set<HexCoord>,
        // oob: Set<HexCoord> = Set<HexCoord>().asMutable(),
        x?: HexCoord
    ) {
        assert(inBounds.asMutable() === inBounds); // must be mutable
        // assert(oob.asMutable() === oob);
        if (x === undefined) {
            x = this.start();
            assert(this.inBounds(x));
            inBounds.add(x);
        }

        const ic = HexCoord.instanceCache;
        console.log(`${inBounds.size} considering ${x.toString()} (${this.inBounds(x) ? 'in' : 'OOB'})`);
        ic.get(x);
        x.getNeighbors().map(neighbor => {
            // have we found one that isn't yet visited?
            // TODO test that we visit each position exactly once?
            if (!inBounds.contains(neighbor) /* && !oob.contains(neighbor) */) {
                if (this.inBounds(neighbor)) {
                    inBounds.add(neighbor);
                    this.buildAll(inBounds, /* oob, */neighbor);
                }
                // keep track of boundary but avoid revisiting
                // else
                //     oob.add(neighbor);
            }
        });
    }
}

// Defines a board of hexes with an overall rectangular shape.
// If height and width are H and W, then the corners are
// (0,0,0)      (w, -w, 0)
// (-h/2, -h/2, h) (w-h/2, w-h/2, h)
export class RectangularConstraints extends HexBoardConstraints {
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