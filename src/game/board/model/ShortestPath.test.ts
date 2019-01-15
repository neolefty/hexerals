import {List, Range} from 'immutable'

import {Board} from './Board'
import {CacheDistance, floodShortestPath, HexPaths} from './ShortestPath'
import {Hex} from './Hex'
import {Tile} from './Tile'
import {Terrain} from './Terrain'
import {RandomTerrainArranger} from './RandomTerrainArranger'

it ('finds a simple shortest path', () => {
    const ten = Board.constructSquare(10, List())
    // edges.lowerRight is not the rightmost it's (8, 0)
    const [ ll, ul, lr, ur ] = [ ten.edges.lowerLeft, ten.edges.upperLeft, Hex.getCart(9, 1), ten.edges.upperRight ]
    expect(ll === Hex.ORIGIN).toBeTruthy()
    expect(ul === Hex.getCart(0, 18)).toBeTruthy()
    expect(ul.minus(ll).maxAbs()).toBe(9)
    expect(lr.minus(ll).maxAbs()).toBe(9)
    expect(lr.minus(ul).maxAbs()).toBe(13)
    const cache = new CacheDistance(ten.hexesAll)
    const paths = new HexPaths(ten.hexesAll)

    const simpleShortest = (a: Hex, b: Hex) => {
        // console.log(`path from ${a.toString()} to ${b.toString()} — manhattan ${a.minus(b).maxAbs()}`)
        const floodPath: List<Hex> = floodShortestPath(ten.hexesAll, a, b)
        const globalPath = paths.path(a, b)
        // console.log(`  --> ${hexesToString(path)}`)
        const manhattan = b.minus(a).maxAbs()
        expect(floodPath.size).toBe(manhattan + 1)
        expect(globalPath.size).toBe(manhattan + 1)
        expect(floodPath.first() === a).toBeTruthy()
        expect(floodPath.last() === b).toBeTruthy()
        expect(globalPath.get(0) === a).toBeTruthy()
        expect(globalPath.get(manhattan) === b).toBeTruthy()
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
    expect(floodShortestPath(ten.hexesAll, ll, ur).size).toBe(14)

    const occupiablePaths = new HexPaths(ten.hexesOccupiable)
    expect(occupiablePaths.distance(ll, ur)).toBe(29)
    const allPaths = new HexPaths(ten.hexesAll)
    expect(allPaths.distance(ll, ur)).toBe(13)

    const checkConnected = (a: Hex, b: Hex, path: List<Hex>) => {
        expect(path.first() === a).toBeTruthy()
        expect(path.last() === b).toBeTruthy()
        for (let i = 0; i < path.size - 1; ++i)
            // steps should be adjacent
            expect(path.get(i).neighbors.indexOf(path.get(i + 1)))
                .toBeGreaterThanOrEqual(0)
    }

    checkConnected(ll, ur, occupiablePaths.path(ll, ur))
    checkConnected(ll, ur, allPaths.path(ll, ur))
})

it ('tests performance of global shortest path', () => {
    Range(5, 41, 5).forEach(n => {
        let board = Board.constructSquare(n, List(), [
            new RandomTerrainArranger(0.2)
        ])
        const start = Date.now()
        new HexPaths(board.hexesOccupiable)
        const elapsed = Date.now() - start
        console.log(`Size: ${n} — Elapsed: ${elapsed}`)
    })
})