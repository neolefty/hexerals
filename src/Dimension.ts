export default class Dimension {
    constructor(readonly w: number, readonly h: number) {}
    toString() { return `${this.w}x${this.h}`}
}