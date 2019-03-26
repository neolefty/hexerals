import {List, Range} from 'immutable'

import {Board} from '../board/Board'
import {CacheDistance, floodShortestPath, HexPaths} from './ShortestPath'
import {Hex} from './Hex'
import {Tile} from './Tile'
import {Terrain} from './Terrain'
import {RandomTerrainArranger} from '../setup/RandomTerrainArranger'
import {FloodDM, PathsDM, SpreadPlayersArranger} from '../setup/SpreadPlayerArranger';
import {Arranger} from '../setup/Arranger';
import {StatusMessage} from '../../../../common/StatusMessage';
import {pickNPlayers} from '../players/Players';

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
    Range(0, 8).forEach(index => {
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
        Range(0, path.size - 1).forEach(index =>
            // steps should be adjacent
            expect((path.get(index) as Hex).neighbors.indexOf(
                path.get(index + 1) as Hex)
            ).toBeGreaterThanOrEqual(0)
        )
    }

    checkConnected(ll, ur, occupiablePaths.path(ll, ur))
    checkConnected(ll, ur, allPaths.path(ll, ur))
})

const timeArranging = (
    name: string, board: Board, arranger: Arranger, log: boolean = false
) => {
    const start = Date.now()
    const status = [] as StatusMessage[]
    arranger.arrange(board, status)
    if (status.length > 0)
        console.log(status)
    const elapsed = Date.now() - start
    if (log)
        // tslint:disable-next-line
        console.log(`${name} arranger — ${board.players.size} players, ${board.edges.width} x ${board.edges.height} — ${board.hexesOccupiable.size} hexes — ${elapsed} ms`)
}

const logBenchmarks = false

it ('compares performance of flood & global', () => {
    const flood = new SpreadPlayersArranger(Terrain.Capital, 0, FloodDM)
    const paths = new SpreadPlayersArranger(Terrain.Capital, 0, PathsDM)

    const log = logBenchmarks
    const range = log
        ? Range(15, 36, 5)
        : Range(10, 21, 5)
    range.forEach(side => {
        const board = Board.constructSquare(
            side, pickNPlayers(16),
            [ new RandomTerrainArranger(0.2) ],
        )
        timeArranging("flood", board, flood, log)
        timeArranging("paths", board, paths, log)
    })
})

const r = (n: number, places: number = 2, shift: number = 0) =>
    Math.round(n * (10 ** shift) * (10 ** places)) / (10 ** places)

const testPerf = (side: number, log: boolean = false) => {
    let board = Board.constructSquare(side, List(), [
        new RandomTerrainArranger(0.2)
    ])
    const hexes = board.hexesOccupiable.size
    const start = Date.now()
    new HexPaths(board.hexesOccupiable)
    const elapsed = Date.now() - start
    // tslint:disable-next-line
    if (log) console.log(
        `${side}x${side} (${hexes} hexes), ${elapsed} ms — ns/hex2.1|2|3|4: ${
            // r(elapsed / side, 1)}/side ${
            // r(elapsed / (side*side))}/side^2 ${
            // r(elapsed / hexes)}/hex ${
            // Seems to be slightly more than n^2 where n is number of hexes.
            // Note that there are n^2 paths.
            r(elapsed / (hexes ** 2), 0, 6)} | ${
            r(elapsed / (hexes ** 2.1), 0, 6)} | ${
            r(elapsed / (hexes ** 2.2), 0, 6)} | ${
            r(elapsed / (hexes ** 2.3), 0, 6)} | ${
            r(elapsed / (hexes ** 2.4), 0, 6)}`
    )
}

it ('benchmarks performance of global shortest path', () => {
    if (logBenchmarks) {
        Range(10, 36, 5).forEach(
            n => {testPerf(n, true)}
        )
        Range(37, 49, 2).forEach(
            n => {testPerf(n, true)}
        )
    }
    else
        Range(10, 21, 5).forEach(
            n => {testPerf(n, false)}
        )
})