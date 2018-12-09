import { List, Iterable } from 'immutable';

// Patch immutable type file to remove (mis-typed?) optionals, as described at:
// https://github.com/facebook/immutable-js/issues/1246
declare module "immutable" {
    export interface Iterable<K, V> {
        map<M>(
            mapper: (value: V, key: K, iter: /*this*/Iterable<K, V>) => M,
            context?: any
        ): /*this*/Iterable<K, M>;
        forEach(
            sideEffect: (value: V, key: K, iter: /*this*/Iterable<K, V>) => any,
            context?: any
        ): number;
    }

    export interface List<T> {
        filter(
            predicate: (value: T) => boolean,
            context?: any
        ): /*this*/Iterable<number, T>;
        filterNot(
            predicate: (value: T) => boolean,
            context?: any
        ): /*this*/Iterable<number, T>;
    }
}