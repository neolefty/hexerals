import { List, ValueObject } from "immutable"
import { devAssert } from "../../../common/Environment"

// Hex.get(x, y, z)  or Hex.getCart(cx, cy) -- constructor is private, and instances are interned.
// "Cube coordinates" for a description, see:
// www.redblobgames.com/grids/hexagons/#coordinates-cube
export class Hex implements ValueObject {
    // keys are hex.x and then hex.y
    private static readonly xyCache: Record<number, Record<number, Hex>> = {}
    // array index is hex.id
    private static readonly idCache: Hex[] = []

    private static NEXT_ID = 0

    // a Hex whose x, y, and z are all NaN
    static readonly NONE = new Hex(NaN, NaN)
    static readonly ORIGIN = Hex.get(0, 0, 0)

    // neighbor directions
    static readonly RIGHT_DOWN = Hex.get(1, -1, 0)
    static readonly RIGHT_UP = Hex.get(1, 0, -1)
    static readonly UP = Hex.get(0, 1, -1)
    static readonly DOWN = Hex.get(0, -1, 1)
    static readonly LEFT_UP = Hex.get(-1, 1, 0)
    static readonly LEFT_DOWN = Hex.get(-1, 0, 1)

    static readonly DIRECTIONS = Object.freeze([
        Hex.RIGHT_DOWN,
        Hex.RIGHT_UP,
        Hex.UP,
        Hex.LEFT_UP,
        Hex.LEFT_DOWN,
        Hex.DOWN,
    ])

    // z: leftUp-rightDown
    readonly z: number

    // useful as a key
    readonly id = Hex.NEXT_ID++

    private neighborsCache?: ReadonlyArray<Hex>

    static get(x: number, y: number, z: number): Hex {
        const total = x + y + z
        if (isNaN(total)) return Hex.NONE
        else {
            devAssert(total === 0)
            // TODO eliminate memory leak of accumulated cache
            // (tried WeakMap but couldn't get it to work -- see git log)
            let yCache = Hex.xyCache[x]
            if (!yCache) {
                yCache = {}
                Hex.xyCache[x] = yCache
            }
            let result = yCache[y]
            if (result === undefined) {
                result = new Hex(x, y)
                yCache[y] = result
                Hex.idCache[result.id] = result
            }
            return result
        }
    }

    static getById(id: number): Hex {
        const result: Hex | undefined = Hex.idCache[id]
        if (result) return result
        else if (isNaN(id)) return Hex.NONE
        else throw Error(`Unknown Hex ID ${id}`)
    }

    // Convert from cartesian (rectangular) coordinates.
    // X goes to the right and Y goes down.
    // Hexes are considered 2 wide and 1 high and centered at their coordinates.
    // For example, (0,0,0) is the origin hex whose cartesian coord is (0,0).
    // Its right neighbor at (1, -1, 0) has a cartesian coord (2, 0).
    // There is no hex at (1, 0) since that is on the edge between the two.
    // The origin's lower-left neighbor at (-1, 0, 1) has a cartesian coord (-1, 1).
    // In other words, (x + y) must be even.
    static getCart(cx: number, cy: number): Hex {
        devAssert((cx + cy) % 2 === 0)
        return Hex.get(cx, (cy - cx) / 2, -(cy + cx) / 2)
    }

    plus(that: Hex): Hex {
        return Hex.get(this.x + that.x, this.y + that.y, this.z + that.z)
    }

    minus(that: Hex): Hex {
        return Hex.get(this.x - that.x, this.y - that.y, this.z - that.z)
    }

    times(n: number): Hex {
        return Hex.get(this.x * n, this.y * n, this.z * n)
    }

    // Maximum of absolute values of all three axes — AKA Manhattan distance from origin.
    // Note: Useful for Manhattan hex distance -- a.minus(b).maxAbs().
    maxAbs() {
        // noinspection JSSuspiciousNameCombination
        return Math.max(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z))
    }

    // TODO randomize neighbors order
    get neighbors(): ReadonlyArray<Hex> {
        if (this.neighborsCache === undefined) {
            this.neighborsCache = Hex.DIRECTIONS.map((c) => this.plus(c))
        }
        return this.neighborsCache
    }

    getRightUp(): Hex {
        return this.plus(Hex.RIGHT_UP)
    }

    getRightDown(): Hex {
        return this.plus(Hex.RIGHT_DOWN)
    }

    getDown(): Hex {
        return this.plus(Hex.DOWN)
    }

    getLeftDown(): Hex {
        return this.plus(Hex.LEFT_DOWN)
    }

    getLeftUp(): Hex {
        return this.plus(Hex.LEFT_UP)
    }

    getUp(): Hex {
        return this.plus(Hex.UP)
    }

    // TODO test consistency -- maybe randomly create coords and navigate nearby using both hex & cartesian coords
    // convert to integer rectangular X
    // assuming flat-topped hexagons twice as wide as high
    get cartX(): number {
        return this.x
    }

    // convert to integer rectangular Y
    // assuming flat-topped hexagons twice as wide as high
    get cartY(): number {
        return this.y - this.z
    }

    // tslint:disable-next-line:member-ordering
    static readonly COS_30 = Math.cos(Math.PI / 6)
    // the actual y coordinate, corrected for hexagon heights
    get cartYGeo(): number {
        return this.cartY * 0.5
    }
    get cartXGeo(): number {
        return this.cartX * Hex.COS_30
    }

    // tslint:disable-next-line:member-ordering
    private _degrees = -1000
    // angle from origin to this coordinate, corrected to be hexagonal
    // the unit directions are each a multiple of 60%
    // UP would be 90, UP_RIGHT 30, UP_LEFT 150, etc.
    get degrees(): number {
        if (this._degrees < 360)
            this._degrees =
                ((Math.atan2(this.cartYGeo, this.cartXGeo) * 180) / Math.PI +
                    360) %
                360
        return this._degrees
    }

    toString(
        includeCart = true,
        includeHex = false,
        includeGeo = false
    ): string {
        return `${includeHex ? this.toHexString() + " " : ""}${
            includeCart ? this.toCartString() : ""
        }${includeGeo ? " " + this.toGeoString() : ""}`
    }

    toHexString() {
        return `[${this.x},${this.y},${this.z}]`
    }

    toCartString() {
        return `(${this.cartX},${this.cartY})`
    }

    toGeoString() {
        return `(${this.cartXGeo},${this.cartYGeo})`
    }

    // Private constructor: access instances through get() or getCart().
    // Instances are interned in Hex.xyCache
    private constructor(readonly x: number, readonly y: number) {
        // x: left-right
        // y: leftDown-rightUp
        this.z = -x - y
    }

    // (y, x) lexicographically -- bottom to top then left to right
    compareTo(that: Hex): number {
        const dy = this.cartY - that.cartY
        return dy !== 0 ? dy : this.cartX - that.cartX
    }

    equals(other: unknown): boolean {
        return other === this
    }
    hashCode(): number {
        return this.id
    }
}

export const hexCompare = (a: Hex, b: Hex) => a.compareTo(b)

const sizeOrLength = (collection: ReadonlyArray<unknown> | List<unknown>) => {
    if (Array.isArray(collection)) return collection.length
    else return (collection as List<unknown>).size
}

export const hexesToString = (s?: ReadonlyArray<Hex> | List<Hex>) => {
    if (!s) return "undefined"
    let result = `${sizeOrLength(s)} —`
    s.forEach((hex) => (result += ` ${hex.toCartString()}`))
    return result
}

// How many hexes are in a full rectangular board?
export const countHexes = (w: number, h: number) =>
    // even heights: 1 full zig-zaggy row for every 2 height —> w * h / 2
    // odd heights:
    //   - even width: 1 perforated half-row for every height —> (w / 2) * h
    //   - odd width: 1 more long half-row than short, so round up
    Math.ceil(w * h * 0.5)
