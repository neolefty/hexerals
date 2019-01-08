// Cartesian Pair (x, y)
import {List} from 'immutable';
import {Comma} from './Comma';

export class CartPair {
    constructor(readonly x: number, readonly y: number) {}

    scale(scale: number) { return this.scaleXY(scale, scale) }

    scaleXY(x: number, y: number) {
        return new CartPair(this.x * x, this.y * y)
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

export type CartPairTransform = (cp: CartPair) => CartPair

export class CartChain {
    static construct = (...cp: CartPair[]): CartChain =>
        new CartChain(List(cp))

    constructor(readonly chain: List<CartPair>) {}

    map(op: CartPairTransform): CartChain {
        return new CartChain(this.chain.map(op) as List<CartPair>)
    }

    push(...cp: CartPair[]): CartChain {
        return new CartChain(this.chain.push(...cp))
    }

    scaleXY(x: number, y: number): CartChain {
        return this.map(cp => cp.scaleXY(x, y))
    }

    plusXY(x: number, y: number) {
        return this.map(cp => cp.plusXY(x, y))
    }

    toString = (): string => {
        const comma = new Comma('', ' ')
        let result = ''
        this.chain.forEach(
            cp => result += `${comma.toString()}${cp.toString()}`
        )
        return result
    }
}