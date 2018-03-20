export default class Dimension {
    constructor(readonly w: number, readonly h: number) {}

    toString() {
        return `${this.w}x${this.h}`;
    }

    equals(that: Dimension) {
        return this.w === that.w && this.h === that.h;
    }
}