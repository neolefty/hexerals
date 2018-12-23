import * as assert from 'assert'
import {List, Map, Set} from 'immutable'

import {Board} from './Board'
import {BoardConstraints} from './Constraints'
import {pickNPlayers, Player} from '../../players/Players'
import {StatusMessage} from '../../../common/StatusMessage'
import {PlayerMove} from './Move'
import {
    CornersPlayerArranger, MountainArranger, RandomPlayerArranger
} from './Arranger';
import {Spot, Terrain} from './Spot';
import {HexCoord} from './HexCoord';

// noinspection JSUnusedGlobalSymbols
export function printBoard(board: Board) {
    let out = ''
    board.edges.yRange().reverse().forEach((y: number) => {
        let line = ''
        board.edges.xRange().forEach((x: number) => {
            let c = ' '
            if ((x + y) % 2 === 0 && board.inBounds(HexCoord.getCart(x, y))) {
                const spot = board.getCartSpot(x, y)
                if (spot.owner === Player.Two)
                    c = spot.pop === 0 ? 'o' : (spot.pop === 1 ? 'p' : 'P')
                else if (spot.owner === Player.One)
                    c = spot.pop === 0 ? '=' : (spot.pop === 1 ? 'c' : 'C')
                else
                    c = (spot.terrain == Terrain.Mountain) ? 'M' : '-'
            }
            line += c
        })
        out += line + '\n'
        // console.log(line)
    })
    console.log(out)
}

it('checks rectangular board geometry', () => {
    const arr = [new CornersPlayerArranger()]
    const twoPlayers = pickNPlayers(2)
    expect(Board.constructRectangular(9, 3, twoPlayers, arr).constraints.all().size)
        .toBe(5 * 3 + 4 * 2)

    expect(Board.constructRectangular(19, 10.5, twoPlayers, arr).constraints.all().size)
        .toBe(10 * 10 + 10 * 9)
    const nineByTwalf = Board.constructRectangular(9, 2.5, twoPlayers, arr)
    // _ - _ - _ - _ - _  <-- upper-right is at cartesian (7, 3)
    // _ - _ - _ - _ - _
    expect(nineByTwalf.constraints.extreme(x => x.cartX).cartX).toBe(0)  // left 0
    expect(nineByTwalf.constraints.extreme(x => x.cartY).cartY).toBe(0)  // top 0
    expect(nineByTwalf.constraints.extreme(x => - x.cartX).cartX).toBe(8)  // right 8
    expect(nineByTwalf.constraints.extreme(x => - x.cartY).cartY).toBe(3)  // bottom 3
    expect(nineByTwalf.constraints.extreme(
        // cartY is first digit, cartX is second digit
        x => x.cartX + 10 * x.cartY, BoardConstraints.GT
    ) === HexCoord.getCart(7, 3)).toBeTruthy() // bottom right

    expect(nineByTwalf.edges.width).toEqual(9)
    expect(nineByTwalf.edges.height).toEqual(4)
    expect(nineByTwalf.edges.xRange().count()).toEqual(9)
    expect(List<number>(nineByTwalf.edges.xRange()))
        .toEqual(List<number>([0, 1, 2, 3, 4, 5, 6, 7, 8]))
    expect(List<number>(nineByTwalf.edges.yRange()))
        .toEqual(List<number>([0, 1, 2, 3]))

    // for some reason, these both cause a stack overflow:
    // expect(upperLeft === HexCoord.ORIGIN).toBeTruthy()
    // expect(upperLeft).toEqual(HexCoord.ORIGIN)
    expect(nineByTwalf.edges.upperLeft === HexCoord.ORIGIN).toBeFalsy()
    expect(nineByTwalf.edges.upperLeft === HexCoord.getCart(1, 3)).toBeTruthy()
    expect(nineByTwalf.edges.upperRight === HexCoord.getCart(7, 3)).toBeTruthy()
    expect(nineByTwalf.edges.lowerRight === HexCoord.getCart(8, 0)).toBeTruthy()
    expect(nineByTwalf.edges.lowerLeft === HexCoord.ORIGIN).toBeTruthy()
    // expect(nineByTwalf.edges.upperLeft === HexCoord.getCart(1, 3)).toBeTruthy()
    // expect(nineByTwalf.edges.upperRight === HexCoord.getCart(7, 3)).toBeTruthy()
    // expect(nineByTwalf.edges.lowerRight === HexCoord.getCart(8, 0)).toBeTruthy()
    // expect(nineByTwalf.edges.lowerLeft === HexCoord.ORIGIN).toBeTruthy()
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
                        new MountainArranger(0.5)
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

it('converts between hex and cartesian coords', () => {
    const w = 11, h = 5
    const tenByFive = Board.constructRectangular(
        w, h, pickNPlayers(2), [new CornersPlayerArranger(1)])
    // h x w, but every other row (that is, h/2 rows) is short by 1
    expect(tenByFive.constraints.all().size == w * h - Math.trunc(h/2))

    const metaCartSpot = (cx: number, cy: number) => (
        () => tenByFive.getCartSpot(cx, cy)
    )

    expect(metaCartSpot(6, 3)).toThrow()  // assert sum is even
    expect(metaCartSpot(-1, -1)).toThrow()  // out of bounds
    expect(metaCartSpot(w, h)).toThrow()  // out of bounds
    expect(metaCartSpot(w, 0)).toThrow()  // out of bounds
    expect(metaCartSpot(0, h)).toThrow()  // out of bounds

    const midHex = HexCoord.getCart(6, 2)
    expect(midHex === HexCoord.get(6, -2, -4)).toBeTruthy()
    // expect(midHex === HexCoord.get(6, -2, -4)).toBeTruthy()
    expect(tenByFive.getCartSpot(6, 2) === Spot.BLANK).toBeTruthy()
})

it('overlays', () => {
    const five = Board.constructSquare(
        5,
        pickNPlayers(4),
        [new CornersPlayerArranger(10)],
    )
    expect(five.getSpot(HexCoord.ORIGIN))
        .toEqual(new Spot(Player.Zero, 10, Terrain.City))
    expect(five.getSpot(HexCoord.RIGHT_UP) === Spot.BLANK).toBeTruthy()
    const emptyFive = new Spot(Player.Nobody, 5, Terrain.Empty)
    const cityThree = new Spot(Player.One, 3, Terrain.City)
    const overlayTemp: Map<HexCoord, Spot> = Map()
    const overlay = overlayTemp
        .set(HexCoord.ORIGIN, emptyFive)
        .set(HexCoord.RIGHT_UP, cityThree)
    const after = five.overlaySpots(overlay)
    expect(after.getSpot(HexCoord.ORIGIN) === emptyFive).toBeTruthy()
    expect(after.getSpot(HexCoord.RIGHT_UP) === cityThree).toBeTruthy()
})

it('navigates around a board', () => {
    const elevenByFalf = Board.constructRectangular(
        11, 5.5, pickNPlayers(2), [new CornersPlayerArranger(20)])
    expect(elevenByFalf.inBounds(HexCoord.ORIGIN)).toBeTruthy()
    expect(elevenByFalf.constraints.all().contains(HexCoord.ORIGIN)).toBeTruthy()
    expect(elevenByFalf.inBounds(HexCoord.NONE)).toBeFalsy()
    expect(elevenByFalf.constraints.all().contains(HexCoord.NONE)).toBeFalsy()

    // staggered walk from origin to the right edge
    let c = HexCoord.ORIGIN
    while (elevenByFalf.inBounds(c.getRightUp().getRightDown())) {
        c = c.getRightUp().getRightDown()
        expect(elevenByFalf.constraints.all().contains(c))
    }
    expect(c === elevenByFalf.edges.lowerRight).toBeTruthy()
    assert(c === elevenByFalf.edges.lowerRight)
    expect(c).toEqual(elevenByFalf.edges.lowerRight)
    expect(c === elevenByFalf.edges.lowerRight).toBeTruthy()
    expect(c.x).toBe(10)

    expect(
        HexCoord.ORIGIN.plus(HexCoord.RIGHT_UP).plus(HexCoord.UP)
     === HexCoord.getCart(1, 3)).toBeTruthy()
    // This causes a stack overflow in V8, where === does not. Why?
    // See jest source code -- packages/expect/matchers.js and
    // possibly packages/jest-matcher-utils/src. Could stringification be
    // the culprit, maybe with HexCoord.neighborsCache? Is there a way to hide that?
    // Or is it something else (probably)?
    // expect(
    //     HexCoord.ORIGIN.plus(HexCoord.RIGHT_UP).plus(HexCoord.UP)
    //     === HexCoord.getCart(1, 5)
    // ).toBeTruthy()
})

it('validates moves', () => {
    const threeByFour = Board.constructRectangular(
        3, 4, pickNPlayers(2), [new CornersPlayerArranger(20)])
    const messages: StatusMessage[] = []
    const options = threeByFour.validationOptions(messages)

    expect(threeByFour.validate(PlayerMove.construct(
        Player.Zero, threeByFour.edges.lowerLeft, HexCoord.UP
    ))).toBeTruthy()
    expect(threeByFour.edges.lowerLeft).toEqual(HexCoord.ORIGIN)
    expect(threeByFour.validate(PlayerMove.construct(
        Player.One, threeByFour.edges.upperRight, HexCoord.DOWN
    ))).toBeTruthy()

    // would go off the board
    expect(threeByFour.validate(
        PlayerMove.construct(Player.One, threeByFour.edges.upperRight, HexCoord.UP),
        options,
    )).toBeFalsy()
    expect(messages[messages.length-1].tag).toBe('out of bounds')
    expect(messages[messages.length-1].msg.startsWith('destination')).toBeTruthy()

    // would start off the board
    expect(threeByFour.validate(
        PlayerMove.construct(Player.Zero, HexCoord.DOWN, HexCoord.UP),
        options,
    )).toBeFalsy()
    expect(messages[messages.length-1].tag).toBe('out of bounds')
    expect(messages[messages.length-1].msg.startsWith('start')).toBeTruthy()

    // too far
    const rightUp2 = HexCoord.RIGHT_UP.plus(HexCoord.RIGHT_UP)
    expect(threeByFour.validate(PlayerMove.construct(
        Player.Zero, HexCoord.ORIGIN, rightUp2),
        options,
    )).toBeFalsy()
    expect(messages[messages.length-1].tag).toBe('illegal move')
    expect(messages[messages.length-1].msg.includes('2')).toBeTruthy()

    // wrong owner
    const oneOriginUp = PlayerMove.construct(
        Player.One, HexCoord.ORIGIN, HexCoord.UP)
    expect(threeByFour.validate(oneOriginUp, options)).toBeFalsy()
    expect(messages[messages.length-1].tag).toBe('wrong player')
    expect(threeByFour.validate(oneOriginUp)).toBeFalsy()

    // pop of only 1
    const moved = threeByFour.applyMove(PlayerMove.construct(
        Player.Zero, HexCoord.ORIGIN, HexCoord.UP
    )).board
    const movedOptions = moved.validationOptions(messages)
    expect(moved.validate(
        PlayerMove.construct(Player.Zero, HexCoord.ORIGIN, HexCoord.UP),
        movedOptions,
    )).toBeFalsy()
    expect(messages[messages.length-1].tag).toBe('insufficient population')
    movedOptions.ignoreSmallPop = true
    expect(moved.validate(PlayerMove.construct(
        Player.Zero, HexCoord.ORIGIN, HexCoord.UP
    ), movedOptions)).toBeTruthy()
})

it('steps population', () => {
    const threeByFour = Board.constructRectangular(
        3, 7, pickNPlayers(2),
        [new CornersPlayerArranger(20)],
    )
    const ur = threeByFour.edges.upperRight
    const urd = ur.getDown()
    const urd2 = urd.getDown()
    expect(threeByFour.getSpot(ur).terrain).toBe(Terrain.City)
    expect(threeByFour.getSpot(ur).pop).toBe(20)
    expect(threeByFour.getSpot(ur).isOwned).toBeTruthy()
    expect(threeByFour.getSpot(urd).isOwned).toBeFalsy()

    // make a move
    const moved = threeByFour.applyMove(
        PlayerMove.construct(Player.One, ur, HexCoord.DOWN)
    ).board
    expect(moved.getSpot(ur).pop).toBe(1)
    expect(moved.getSpot(urd).pop).toBe(19)
    expect(moved.getSpot(urd2).pop).toBe(0)

    // after turn 1, no changes in population
    const one = moved.stepPop(1)
    expect(one.getSpot(ur).pop).toBe(1)
    expect(one.getSpot(urd).pop).toBe(19)
    expect(one.getSpot(urd2).pop).toBe(0)

    // after turn 2, city grows
    const two = one.stepPop(2)
    expect(two.getSpot(ur).pop).toBe(2)
    expect(two.getSpot(urd).pop).toBe(19)
    expect(two.getSpot(urd2).pop).toBe(0)

    // after turn 50, both city and countryside grow
    const fifty = two.stepPop(50)
    expect(fifty.getSpot(ur).pop).toBe(3)
    expect(fifty.getSpot(urd).pop).toBe(20)
    expect(fifty.getSpot(urd2).pop).toBe(0)
})