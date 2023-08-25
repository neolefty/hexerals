import { HexFilter } from "./HexTile"
import { Hex } from "./Hex"

export const filterMapEntries = <K, V>(map: ReadonlyMap<K, V>, filter: (k: K, v: V) => boolean): Map<K, V> => {
  const result = new Map<K, V>
  for (const entry of map.entries()) {
    const [k, v] = entry
    if (filter(k, v)) result.set(k, v)
  }
  return result
}

/**
 * A HexMap is based around a map of hex ID (number generated by interning — see class Hex) to contents.
 * Used primarily to record the tiles in a game.
 * Plus utility methods to convert from numeric ID to hex.
 */
export class HexMap<T> {
    constructor(readonly idMap: ReadonlyMap<number, T> = new Map()) {}

    filter(filter: HexFilter<T>): HexMap<T> {
        const result = new Map<number, T>()
        this.idMap.forEach((value, id) => {
            if (filter(Hex.getById(id), value)) result.set(id, value)
        })
        return new HexMap<T>(result)
    }

    get(hex: Hex) {
        return this.idMap.get(hex.id)
    }

    /** Create a new map with one more element. Warning: Expensive for all but small maps. */
    set(hex: Hex, t: T) {
        if (this.idMap.get(hex.id) === t) return this
        else return new HexMap(new Map([...this.idMap.entries(), [hex.id, t]]))
    }

    // TODO test this
    entries(): IterableIterator<[Hex, T]> {
        const idIterable = this.idMap.entries()
        return {
            [Symbol.iterator](): IterableIterator<[Hex, T]> {
                // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
                return this
            },
            next: (...args) => {
                const idIteratorResult = idIterable.next(...args)
                return {
                    ...idIteratorResult,
                    value: [
                        Hex.getById(idIteratorResult.value[0]),
                        idIteratorResult.value[1],
                    ],
                }
            },
        }
    }
}
