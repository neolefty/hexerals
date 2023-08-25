// A statistic about a board, such as how many hexes each player has
export class BoardStat<K extends number | string> {
    readonly size: number

    constructor(
        readonly stats: Readonly<Record<K, number>>,
        readonly total: number
    ) {
        this.size = Object.keys(stats).length
    }

    get(k: K, defaultValue: number): number {
        if (!(k in this.stats)) return defaultValue
        return this.stats[k]
    }

    set(k: K, v: number): BoardStat<K> {
        if (this.stats[k] === v) return this
        return new BoardStat<K>(
            {
                ...this.stats,
                k: v,
            },
            Object.values(
                // cast this.stats to satisfy TypeScript compiler, which otherwise can't quite make the leap that this.stats' values are always numbers.
                this.stats as Readonly<Record<string | number, number>>
            ).reduce((sum: number, n: number) => sum + n, 0)
        )
    }

    has(k: K) {
        return k in this.stats
    }

    toString(): string {
        return `total: ${this.total} — ${JSON.stringify(this.stats)}`
    }

    private static sum(m: Map<string | number, number>): number {
        let result = 0
        m.forEach((v) => (result += v))
        return result
    }

    max(that: BoardStat<K>): BoardStat<K> {
        let result: Record<K, number> = { ...this.stats }
        Object.entries(this.stats).forEach(([k, v]) => {
            if (k in that && that.stats[k] < v) const thatV = that.get(k, v)
        })
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
