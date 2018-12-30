import {CacheMap} from './CacheMap';

it('caches a certain number of entries', () => {
    const cache = new CacheMap<string, number>(3)
    expect(cache.has('foo')).toBeFalsy()
    expect(cache.get('foo')).toBeUndefined()

    cache.set('foo', 1)
    expect(cache.has('foo')).toBeTruthy()
    expect(cache.get('foo')).toEqual(1)
    cache.set('bar', 2)
    cache.set('baz', 3)
    expect(cache.get('foo')).toEqual(1)
    cache.set('qux', 4)  // push out foo
    expect(cache.has('foo')).toBeFalsy()
    expect(cache.get('foo')).toBeUndefined()
    expect(cache.get('bar')).toEqual(2)

    cache.set('baz', 5)  // overwrite a value
    expect(cache.get('bar')).toEqual(2)
    expect(cache.get('qux')).toEqual(4)
    expect(cache.get('baz')).toEqual(5)

    cache.set('foo', 6)  // now bar was the oldest and pushed out
    expect(cache.get('bar')).toBeUndefined()
    expect(cache.get('qux')).toEqual(4)

    cache.set('quux', 7)  // now qux was oldest
    expect(cache.get('qux')).toBeUndefined()
    expect(cache.get('baz')).toEqual(5)
})