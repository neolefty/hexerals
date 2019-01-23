import {List} from 'immutable';
import {round} from './MathFunctions';

// Cartesian Pair (x, y)
export class CartPair {
    constructor(readonly x: number, readonly y: number) {}

    scale = (scale: number) => this.scaleXY(scale, scale)
    scaleXY = (x: number, y: number) =>
        new CartPair(this.x * x, this.y * y)
    plusXY = (x: number, y: number) =>
        new CartPair(this.x + x, this.y + y)
    plus = (that: CartPair) => this.plusXY(that.x, that.y)
    plusX = (x: number) => this.plusXY(x, 0)
    plusY = (y: number) => this.plusXY(0, y)
    minus = (that: CartPair) => that.scale(-1).plus(this)

    get min() { return Math.min(this.x, this.y) }

    // for destructuring calls e.g. [x,y] = dim.xy
    get xy() { return [this.x, this.y] }

    // don't change — SVG operations depend on exactly this
    toString() { return `${this.x},${this.y}` }

    round = (places: number = 0) =>
        new CartPair(round(this.x, places), round(this.y, places))
}

export type CartPairTransform = (cp: CartPair) => CartPair

export class CartChain {
    static construct = (...cp: CartPair[]): CartChain =>
        new CartChain(List(cp))

    constructor(readonly chain: List<CartPair>) {}

    map = (op: CartPairTransform): CartChain =>
        new CartChain(this.chain.map(op) as List<CartPair>)

    push = (...cp: CartPair[]): CartChain =>
        new CartChain(this.chain.push(...cp))

    scaleXY = (x: number, y: number): CartChain =>
        this.map(cp => cp.scaleXY(x, y))

    plusXY = (x: number, y: number) =>
        this.map(cp => cp.plusXY(x, y))

    round = (places: number = 0) =>
        new CartChain(this.chain.map(
            pair => pair.round(places)
        ))

    toString = () => this.chain.join(' ')
}