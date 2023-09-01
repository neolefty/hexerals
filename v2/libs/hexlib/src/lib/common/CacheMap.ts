import {OrderedMap} from 'immutable';

type Filler<V> = () => V

// first-in first-out cache
export class CacheMap<K, V> {
    private cache = OrderedMap<K, V>()

    constructor(readonly n: number) {}

    get = (k: K, filler: Filler<V>): V => {
        let result = this.cache.get(k)
        if (!result && !this.has(k) && filler) {
            result = filler()
            this.set(k, result)
        }
        return result as V
    }

    set = (k: K, v: V) => {
        this.cache = this.cache.delete(k).set(k, v)
        while (this.cache.size > this.n)
            this.cache = this.cache.delete(this.cache.keySeq().first())
    }

    has = (k: K): boolean => this.cache.has(k)

    get size() {
        return this.cache.size
    }
}