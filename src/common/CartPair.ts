// Cartesian Pair (x, y)
export default class CartPair {
    constructor(readonly x: number, readonly y: number) {}

    scale(scale: number) {
        return new CartPair(this.x * scale, this.y * scale)
    }

    plusXY(x: number, y: number) {
        return new CartPair(this.x + x, this.y + y)
    }
    plus(that: CartPair) { return this.plusXY(that.x, that.y) }
    plusX(x: number) { return this.plusXY(x, 0) }
    plusY(y: number) { return this.plusXY(0, y) }

    get min() { return Math.min(this.x, this.y) }

    // for destructuring calls e.g. [x,y] = dim.xy
    get xy() { return [this.x, this.y] }

    // don't change — SVG operations depend on exactly this
    toString() { return `${this.x},${this.y}` }
}