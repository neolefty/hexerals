import { Map } from "immutable"

// A statistic about a board, such as how many hexes each player has
export class BoardStat<K> {
    constructor(readonly stats: Map<K, number>, readonly total: number) {}

    get size() {
        return this.stats.size
    }

    get(k: K, defaultValue: number): number {
        return this.stats.get(k, defaultValue)
    }

    set(k: K, v: number): BoardStat<K> {
        if (this.stats.get(k) === v) return this
        else {
            const m = this.stats.set(k, v)
            return new BoardStat(m, this.sum(m))
        }
    }

    has(k: K) {
        return this.stats.has(k)
    }

    toString(): string {
        return `total: ${this.total} — ${JSON.stringify(this.stats.toJS())}`
    }

    private sum(m: Map<K, number>): number {
        // could be static
        let result = 0
        m.forEach((v) => (result += v))
        return result
    }

    max(that: BoardStat<K>): BoardStat<K> {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let result: BoardStat<K> = this
        // all keys in this
        this.stats.forEach((v: number, k: K) => {
            const thatV = that.get(k, v)
            if (v < thatV) result = result.set(k, thatV)
        })
        // all keys in that
        that.stats.forEach((thatV: number, thatK: K) => {
            if (!result.has(thatK)) result = result.set(thatK, thatV)
        })
        return result // note: will be this if no change
    }

    get maxValue(): number {
        return this.stats.reduce((r: number, v: number) => Math.max(r, v), 0)
    }
}
