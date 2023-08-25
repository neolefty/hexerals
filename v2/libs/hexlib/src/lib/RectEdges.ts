import { Hex } from "./Hex"
import { BoardConstraints } from "./Constraints"
import { NumberRange } from "./NumberRange"

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
        this.left = constraints.extreme((h) => h.cartX).cartX // min x
        this.right = constraints.extreme((h) => -h.cartX).cartX // max x
        this.bottom = constraints.extreme((h) => h.cartY).cartY // min y
        this.top = constraints.extreme((h) => -h.cartY).cartY // max y

        this.height = this.top - this.bottom + 1
        this.width = this.right - this.left + 1

        this.lowerLeft = constraints.extreme(
            (h) => h.cartY * this.width + h.cartX // min y, min x
        )
        this.lowerRight = constraints.extreme(
            (h) => h.cartY * this.width - h.cartX // min y, max x
        )
        this.upperLeft = constraints.extreme(
            (h) => -h.cartY * this.width + h.cartX // max y, min x
        )
        this.upperRight = constraints.extreme(
            (h) => -h.cartY * this.width - h.cartX // max y, max x
        )
    }

    xRange(): ReadonlyArray<number> {
        return NumberRange(this.left, this.right + 1)
    }

    yRange(): ReadonlyArray<number> {
        return NumberRange(this.bottom, this.top + 1)
    }

    toString(): string {
        return `left ${this.left}, right ${this.right}, top ${this.top}, bottom ${this.bottom}`
    }
}
