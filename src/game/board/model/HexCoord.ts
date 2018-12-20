import {List, Map} from 'immutable';
import * as assert from 'assert';

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
    static readonly RIGHT_DOWN = HexCoord.get(1, -1, 0);
    static readonly RIGHT_UP = HexCoord.get(1, 0, -1);
    static readonly UP = HexCoord.get(0, 1, -1);
    static readonly DOWN = HexCoord.get(0, -1, 1);
    static readonly LEFT_UP = HexCoord.get(-1, 1, 0);
    static readonly LEFT_DOWN = HexCoord.get(-1, 0, 1);

    // TODO test consistency
    static readonly DIRECTIONS: List<HexCoord> = List([
        HexCoord.RIGHT_DOWN, HexCoord.RIGHT_UP, HexCoord.UP,
        HexCoord.LEFT_UP, HexCoord.LEFT_DOWN, HexCoord.DOWN,
    ]);

    // z: leftUp-rightDown
    readonly z: number;

    // useful as a key in react components
    readonly id = HexCoord.ID++;

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
        return HexCoord.get(cx, (cy - cx) / 2, -(cy + cx) / 2);
    }

    plus(that: HexCoord): HexCoord {
        return HexCoord.get(this.x + that.x, this.y + that.y, this.z + that.z);
    }

    minus(that: HexCoord): HexCoord {
        return HexCoord.get(this.x - that.x, this.y - that.y, this.z - that.z);
    }

    times(n: number): HexCoord {
        return HexCoord.get(this.x * n, this.y * n, this.z * n);
    }

    // Maximum of absolute values of all three axes.
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

    getRightUp(): HexCoord {
        return this.plus(HexCoord.RIGHT_UP);
    }

    getRightDown(): HexCoord {
        return this.plus(HexCoord.RIGHT_DOWN);
    }

    getDown(): HexCoord {
        return this.plus(HexCoord.DOWN);
    }

    getLeftDown(): HexCoord {
        return this.plus(HexCoord.LEFT_DOWN);
    }

    getLeftUp(): HexCoord {
        return this.plus(HexCoord.LEFT_UP);
    }

    getUp(): HexCoord {
        return this.plus(HexCoord.UP);
    }

    // TODO test consistency -- maybe randomly create coords and navigate nearby using both hex & cartesian coords
    // convert to integer rectangular X
    // assuming flat-topped hexagons twice as wide as high
    get cartX(): number {
        return this.x;
    } // was x - y

    // convert to integer rectangular Y
    // assuming flat-topped hexagons twice as wide as high
    get cartY(): number {
        return this.y - this.z;
    } // was z

    // tslint:disable-next-line:member-ordering
    static readonly COS_30 = Math.cos(Math.PI / 6)
    // the actual y coordinate, corrected for hexagon heights
    get cartYExact(): number {
        return this.cartY * 0.5
    }
    get cartXExact(): number {
        return this.cartX * HexCoord.COS_30
    }

    // tslint:disable-next-line:member-ordering
    private _degrees: number = -1000
    // angle from origin to this coordinate, corrected to be hexagonal
    // the unit directions are each a multiple of 60%
    // UP would be 90, UP_RIGHT 30, UP_LEFT 150, etc.
    get degrees(): number {
        if (this._degrees < 360)
            this._degrees =
                (Math.atan2(this.cartYExact, this.cartXExact) * 180 / Math.PI + 360) % 360
        return this._degrees
    }

    toString(includeCart: boolean = true, includeExact: boolean = false): string {
        return `[${ this.x },${ this.y },${ this.z }]${
            includeCart ? ' ' + this.toCartString() : ''
        }${
            includeExact ? ' ' + this.toExactString() : ''
        }`;
    }

    toCartString() {
        return `(${this.cartX},${this.cartY})`;
    }

    toExactString() {
        return `(${this.cartXExact},${this.cartYExact})`;
    }

    // Private constructor: access instances through get() or getCart().
    // Instances are interned in HexCoord.instanceCache
    private constructor(readonly x: number, readonly y: number) {
        // x: left-right
        // y: leftDown-rightUp
        this.z = -x - y;
    }
}