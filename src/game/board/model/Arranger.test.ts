import {Set} from 'immutable'

import {HexCoord} from './HexCoord'
import {Terrain} from './Spot'
import {Board} from './Board'
import {pickNPlayers} from '../../players/Players';
import {connected} from './HexGraph';
import {StatusMessage} from '../../../common/StatusMessage';
import {MAP_TOO_SMALL} from './Arranger'
import {TerrainArranger} from './TerrainArranger';
import {CornersPlayerArranger, RandomPlayerArranger} from './PlayerArranger';

it ('does not bisect the map with mountains', () => {
    for (let i = 0; i < 10; ++i) {
        const tenByTen = Board.constructSquare(10, pickNPlayers(12), [
            new RandomPlayerArranger(),
            new TerrainArranger(0.5),
        ])
        expect(connected(tenByTen.filterSpots(spot => spot.canBeOccupied())))
    }
})

it('places mountains randomly', () => {
    // test that sets of the same HexCoords are the same
    let setOfSame: Set<Set<HexCoord>> = Set()
    // no randomness in this one, so should be the same set of HexCoords every time
    for (let i = 0; i < 2; ++i)
        setOfSame = setOfSame.add(Set(Board.constructSquare(
            5, pickNPlayers(4), [new CornersPlayerArranger()]
        ).filterSpots(spot => !spot.isBlank())))
    expect(setOfSame.size).toEqual(1)

    // test that random placement is different every time (for a large enough board)
    const nTrials = 5
    let setOfMountainSets: Set<Set<HexCoord>> = Set()
    // Expect each arrangement of mountains to be different
    const numPlayers = 10
    const mtnFraction = 0.5
    for (let i = 0; i < nTrials; ++i)
        setOfMountainSets = setOfMountainSets.add(
            // 10 x 10 is big enough to avoid bisection and still place all mountains
            Board.constructSquare(
                10, pickNPlayers(numPlayers), [
                    new RandomPlayerArranger(),
                    new TerrainArranger(mtnFraction),
                ]
            ).filterSpots(
                spot => spot.terrain === Terrain.Mountain
            )
        )
    // available spaces is total spaces minus one (a capital) for each player
    const availableSpaces = Board.constructSquare(10, pickNPlayers(0))
        .rules.constraints.all().size - numPlayers
    // number of mountains is fraction of free spaces, rounded down
    const expectedMountains = Math.floor(availableSpaces * mtnFraction)
    // each should be unique, so the set should contain all of them
    expect(setOfMountainSets.size).toEqual(nTrials)
    // all should have the same size
    // noinspection PointlessBooleanExpressionJS -- convert undefined to false
    expect(setOfMountainSets.filter(
        s => !!(s && s.size === expectedMountains)).size
    ).toBe(nTrials)
})

it('does not get trapped or bisect', () => {
    // warning: failure mode is to run forever
    const messages: StatusMessage[] = []
    for (let i = 0; i < 20; ++i) {
        // set the arranger up to fail
        const board = Board.constructRectangular(
            1, 20, pickNPlayers(12), [
                new RandomPlayerArranger(1),
                new TerrainArranger(1, Terrain.Mountain),
            ],
            messages
        )
        expect(connected(board.filterSpots(
            spot => spot.canBeOccupied()
        ))).toBeTruthy()
        // should get messages about map being too small
        expect(messages.length).toBeGreaterThan(0)
        expect(messages.filter(
            status => status.tag !== MAP_TOO_SMALL
        ).length).toBe(0)
    }
})

it('bisection can be allowed', () => {
    // warning: failure mode is to run forever
    let bisections = 0
    const messages: StatusMessage[] = []
    for (let i = 0; i < 20; ++i) {
        // set the arranger up to bisect
        const board = Board.constructRectangular(
            4, 12, pickNPlayers(12), [
                new RandomPlayerArranger(1),
                new TerrainArranger(
                    .9, Terrain.Mountain, true
                ),
            ],
            messages,
        )
        if (!connected(board.filterSpots(spot => spot.canBeOccupied())))
            ++bisections
    }
    // console.log(`${bisections} bisections`)
    // console.log(`${messages.length} messages: ${messages}`)
    expect(bisections).toBeGreaterThan(0)
    expect(messages.length).toBe(0)
})