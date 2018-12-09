export default class Dimension {
    constructor(readonly w: number, readonly h: number) {}

    toString() {
        return `${this.w}x${this.h}`
    }

    equals(that: Dimension) {
        return this.w === that.w && this.h === that.h
    }

    scale(x: number) {
        return new Dimension(this.w * x, this.h * x)
    }
    
    plus(w: number, h: number) {
        return new Dimension(this.w + w, this.h + h)
    }

    get min() {
        return Math.min(this.w, this.h)
    }

    // for destructuring calls e.g. [x,y] = dim.wh
    get wh() {
        return [this.w, this.h]
    }
}