import {OrderedMap} from 'immutable';

// first-in first-out cache
export class CacheMap<K, V> {
    private cache = OrderedMap<K, V>()

    constructor(readonly n: number) {}

    get = (k: K): V | undefined => this.cache.get(k)

    set = (k: K, v: V) => {
        this.cache = this.cache.delete(k).set(k, v)
        while (this.cache.size > this.n)
            this.cache = this.cache.delete(this.cache.keySeq().first())
    }

    has = (k: K): boolean => this.cache.has(k)
}