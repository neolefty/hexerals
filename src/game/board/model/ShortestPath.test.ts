import {List} from 'immutable';

import {Board} from './Board';
import {CacheDistance, floodShortestPath} from './ShortestPath';
import {Hex} from './Hex';
import {Terrain, Tile} from './Tile';

it ('finds a simple shortest path', () => {
    const ten = Board.constructSquare(10, List())
    // edges.lowerRight is not the rightmost; it's (8, 0)
    const [ ll, ul, lr, ur ] = [ ten.edges.lowerLeft, ten.edges.upperLeft, Hex.getCart(9, 1), ten.edges.upperRight ]
    expect(ll === Hex.ORIGIN).toBeTruthy()
    expect(ul === Hex.getCart(0, 18)).toBeTruthy()
    expect(ul.minus(ll).maxAbs()).toBe(9)
    expect(lr.minus(ll).maxAbs()).toBe(9)
    expect(lr.minus(ul).maxAbs()).toBe(13)
    const cache = new CacheDistance(ten.allHexes)

    const simpleShortest = (a: Hex, b: Hex) => {
        // console.log(`path from ${a.toString()} to ${b.toString()} — manhattan ${a.minus(b).maxAbs()}`)
        const path = floodShortestPath(ten.allHexes, a, b)
        // console.log(`  --> ${hexesToString(path)}`)
        const manhattan = b.minus(a).maxAbs() + 1
        expect(path.size).toBe(manhattan)
        expect(path.first() === a).toBeTruthy()
        expect(path.last() === b).toBeTruthy()
        expect(cache.distance(a, b)).toBe(manhattan)
    }

    simpleShortest(ll, ul)
    simpleShortest(ul, ll)
    simpleShortest(ll, lr)
    simpleShortest(lr, ul)
    simpleShortest(lr, ur)
})

it ('finds a slightly more complex shortest path', () => {
    let ten = Board.constructSquare(10, List())
    const setMountain = (hex: Hex) =>
        ten = ten.setTiles(ten.explicitTiles.set(hex, Tile.MOUNTAIN))
    List(Array(8).keys()).forEach(index => {
        // line up from the bottom
        setMountain(Hex.getCart(3, index * 2 + 1))
        // line down from the top
        setMountain(Hex.getCart(7, 17 - index * 2))
    })
    const [ ll, ur ] = [ ten.edges.lowerLeft, ten.edges.upperRight ]
    const hexes = ten.filterTiles(tile => tile.terrain === Terrain.Empty)
    expect(floodShortestPath(hexes, ll, ur).size).toBe(30)
    expect(floodShortestPath(ten.allHexes, ll, ur).size).toBe(14)
})