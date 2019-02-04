import {CacheMap} from './CacheMap';
import {Map, Record} from 'immutable';

it('caches a certain number of entries', () => {
    const cache = new CacheMap<string, number>(3)
    expect(cache.has('foo')).toBeFalsy()
    expect(cache.get('foo', () => 1)).toEqual(1)
    expect(cache.has('foo')).toBeTruthy()
    expect(cache.get('foo', () => NaN)).toEqual(1)
    cache.set('bar', 2)
    cache.set('baz', 3)
    expect(cache.get('foo', () => NaN)).toEqual(1)
    cache.set('qux', 4)  // push out foo
    expect(cache.has('foo')).toBeFalsy()
    expect(cache.get('bar', () => NaN)).toEqual(2)

    cache.set('baz', 5)  // overwrite a value
    expect(cache.get('bar', () => NaN)).toEqual(2)
    expect(cache.get('qux', () => NaN)).toEqual(4)
    expect(cache.get('baz', () => NaN)).toEqual(5)

    cache.set('foo', 6)  // now bar was the oldest and pushed out
    expect(cache.has('bar')).toBeFalsy()
    expect(cache.get('qux', () => NaN)).toEqual(4)

    cache.set('quux', 7)  // now qux was oldest
    expect(cache.has('qux')).toBeFalsy()
    expect(cache.get('baz', () => NaN)).toEqual(5)
})

it ('regular js objects not good cache keys', () => {
    // console.log('---- regular js types ----')
    const x = { a: 1, b: 2 }
    const y = { a: 1, b: 2 }
    const m = Map<{}, number>([[x, 0]])
    expect(m.has(x)).toBeTruthy()
    expect(m.has(y)).toBeFalsy()
    expect(m.size).toBe(1)
    expect(m.entrySeq().first()[0]).toBe(x)
})

it ('neither are frozen js objects', () => {
    const x = Object.freeze({ a: 1, b: 2 })
    const y = Object.freeze({ a: 1, b: 2 })
    const m = Map<{}, number>([[x, 0]])
    expect(m.has(x)).toBeTruthy()
    expect(m.has(y)).toBeFalsy()
    expect(m.size).toBe(1)
    expect(m.entrySeq().first()[0]).toBe(x)
})

it ('but immutable.js Records are', () => {
    type AB = { a: number, b: number }
    const ABRecord = Record<AB>({ a: 1, b: 2 })
    const x = ABRecord()
    const y = ABRecord()
    const z = ABRecord({ b: 3 })
    const m = Map<Record<AB>, number>([[x, 0]])
    expect(m.has(x)).toBeTruthy()
    expect(m.has(y)).toBeTruthy()
    expect(m.has(z)).toBeFalsy()
    expect(m.size).toBe(1)
    expect(m.entrySeq().first()[0]).toBe(x)
    expect(m.entrySeq().first()[0]).toEqual(y)
})