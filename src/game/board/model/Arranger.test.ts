import {HexCoord} from './HexCoord'
import {Terrain} from './Spot'
import {List, Set} from 'immutable'
import {Board} from './Board'
import {
    CornersPlayerArranger, RandomPlayerArranger, TerrainArranger
} from './Arranger'
import {pickNPlayers} from '../../players/Players';
import {connected} from './HexGraph';

it ('does not bisect the map with mountains', () => {
    for (let i = 0; i < 5; ++i) {
        const tenByTen = Board.constructSquare(10, List(), [
            new TerrainArranger(0.5)
        ])
        expect(connected(Set(tenByTen.spots.filter((spot, hex) =>
            !!(hex && tenByTen.isEmpty(hex))
        ).keys())))
    }
})

it('places mountains randomly', () => {
    // test that sets of the same HexCoords are the same
    let setOfSame: Set<Set<HexCoord>> = Set()
    // no randomness in this one, so should be the same set of HexCoords every time
    for (let i = 0; i < 2; ++i)
        // noinspection PointlessBooleanExpressionJS
        setOfSame = setOfSame.add(Set(Board.constructSquare(
            5, pickNPlayers(4), [new CornersPlayerArranger()]
        ).spots.filter(spot => !!(spot && !spot.isBlank())).keys()))
    expect(setOfSame.size).toEqual(1)

    // test that random placement is different every time (for a large enough board)
    const nTrials = 5
    let setOfMountainSets: Set<Set<HexCoord>> = Set()
    // Expect each arrangement of mountains to be different
    for (let i = 0; i < nTrials; ++i)
        // noinspection PointlessBooleanExpressionJS -- convert undefined to false
        setOfMountainSets = setOfMountainSets.add(
            Set(
                Board.constructSquare(
                    10, pickNPlayers(10), [
                        new RandomPlayerArranger(),
                        new TerrainArranger(0.5)
                    ]
                ).spots.filter(
                    spot => !!(spot && spot.terrain === Terrain.Mountain)
                ).keys()
            )
        )
    // number of mountains is half of number of free spaces, rounded down
    const expectedMountains = Math.floor((Board.constructSquare(10, pickNPlayers(10))
        .rules.constraints.all().size - 10) * 0.5)
    // each should be unique, so the set should contain all of them
    expect(setOfMountainSets.size).toEqual(nTrials)
    // all should have the same size
    // noinspection PointlessBooleanExpressionJS -- convert undefined to false
    expect(setOfMountainSets.filter(
        s => !!(s && s.size === expectedMountains)).size
    ).toBe(nTrials)
})