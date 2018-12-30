import * as assert from 'assert'
import {Map} from 'immutable'

import {Board} from './Board'
import {pickNPlayers, Player} from './players/Players'
import {StatusMessage} from '../../../common/StatusMessage'
import {PlayerMove} from './Move'
import {CornersPlayerArranger} from './PlayerArranger'
import {Tile, Terrain} from './Tile'
import {Hex} from './Hex'

// noinspection JSUnusedGlobalSymbols
export function printBoard(board: Board) {
    let out = ''
    board.edges.yRange().reverse().forEach((y: number) => {
        let line = ''
        board.edges.xRange().forEach((x: number) => {
            let c = ' '
            if ((x + y) % 2 === 0 && board.inBounds(Hex.getCart(x, y))) {
                const tile = board.getCartTile(x, y)
                if (tile.owner === Player.Two)
                    c = tile.pop === 0 ? 'o' : (tile.pop === 1 ? 'p' : 'P')
                else if (tile.owner === Player.One)
                    c = tile.pop === 0 ? '=' : (tile.pop === 1 ? 'c' : 'C')
                else
                    c = (tile.terrain == Terrain.Mountain) ? 'M' : '-'
            }
            line += c
        })
        out += line + '\n'
        // console.log(line)
    })
    console.log(out)
}

it('converts between hex and cartesian coords', () => {
    const w = 11, h = 5
    const tenByFive = Board.constructRectangular(
        w, h, pickNPlayers(2), [new CornersPlayerArranger(1)])
    // h x w, but every other row (that is, h/2 rows) is short by 1
    expect(tenByFive.constraints.all().size == w * h - Math.trunc(h/2))

    const metaCartTile = (cx: number, cy: number) => (
        () => tenByFive.getCartTile(cx, cy)
    )

    expect(metaCartTile(6, 3)).toThrow()  // assert sum is even
    expect(metaCartTile(-1, -1)).toThrow()  // out of bounds
    expect(metaCartTile(w, h)).toThrow()  // out of bounds
    expect(metaCartTile(w, 0)).toThrow()  // out of bounds
    expect(metaCartTile(0, h)).toThrow()  // out of bounds

    const midHex = Hex.getCart(6, 2)
    expect(midHex === Hex.get(6, -2, -4)).toBeTruthy()
    // expect(midHex === Hex.get(6, -2, -4)).toBeTruthy()
    expect(tenByFive.getCartTile(6, 2) === Tile.BLANK).toBeTruthy()
})

it('overlays', () => {
    const five = Board.constructSquare(
        5,
        pickNPlayers(4),
        [new CornersPlayerArranger(10)],
    )
    expect(five.getTile(Hex.ORIGIN))
        .toEqual(new Tile(Player.Zero, 10, Terrain.City))
    expect(five.getTile(Hex.RIGHT_UP) === Tile.BLANK).toBeTruthy()
    const emptyFive = new Tile(Player.Nobody, 5, Terrain.Empty)
    const cityThree = new Tile(Player.One, 3, Terrain.City)
    const overlayTemp: Map<Hex, Tile> = Map()
    const overlay = overlayTemp
        .set(Hex.ORIGIN, emptyFive)
        .set(Hex.RIGHT_UP, cityThree)
    const after = five.overlayTiles(overlay)
    expect(after.getTile(Hex.ORIGIN) === emptyFive).toBeTruthy()
    expect(after.getTile(Hex.RIGHT_UP) === cityThree).toBeTruthy()
})

it('navigates around a board', () => {
    const elevenByFalf = Board.constructRectangular(
        11, 5.5, pickNPlayers(2), [new CornersPlayerArranger(20)])
    expect(elevenByFalf.inBounds(Hex.ORIGIN)).toBeTruthy()
    expect(elevenByFalf.constraints.all().contains(Hex.ORIGIN)).toBeTruthy()
    expect(elevenByFalf.inBounds(Hex.NONE)).toBeFalsy()
    expect(elevenByFalf.constraints.all().contains(Hex.NONE)).toBeFalsy()

    // staggered walk from origin to the right edge
    let c = Hex.ORIGIN
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
        Hex.ORIGIN.plus(Hex.RIGHT_UP).plus(Hex.UP)
     === Hex.getCart(1, 3)).toBeTruthy()
    // This causes a stack overflow in V8, where === does not. Why?
    // See jest source code -- packages/expect/matchers.js and
    // possibly packages/jest-matcher-utils/src. Could stringification be
    // the culprit, maybe with Hex.neighborsCache? Is there a way to hide that?
    // Or is it something else (probably)?
    // expect(
    //     Hex.ORIGIN.plus(Hex.RIGHT_UP).plus(Hex.UP)
    //     === Hex.getCart(1, 5)
    // ).toBeTruthy()
})

it('validates moves', () => {
    const threeByFour = Board.constructRectangular(
        3, 4, pickNPlayers(2), [new CornersPlayerArranger(20)])
    const messages: StatusMessage[] = []
    const options = threeByFour.validationOptions(messages)

    expect(threeByFour.validate(PlayerMove.constructDelta(
        Player.Zero, threeByFour.edges.lowerLeft, Hex.UP
    ))).toBeTruthy()
    expect(threeByFour.edges.lowerLeft).toEqual(Hex.ORIGIN)
    expect(threeByFour.validate(PlayerMove.constructDelta(
        Player.One, threeByFour.edges.upperRight, Hex.DOWN
    ))).toBeTruthy()

    // would go off the board
    expect(threeByFour.validate(
        PlayerMove.constructDelta(Player.One, threeByFour.edges.upperRight, Hex.UP),
        options,
    )).toBeFalsy()
    expect(messages[messages.length-1].tag).toBe('out of bounds')
    expect(messages[messages.length-1].msg.startsWith('destination')).toBeTruthy()

    // would start off the board
    expect(threeByFour.validate(
        PlayerMove.constructDelta(Player.Zero, Hex.DOWN, Hex.UP),
        options,
    )).toBeFalsy()
    expect(messages[messages.length-1].tag).toBe('out of bounds')
    expect(messages[messages.length-1].msg.startsWith('start')).toBeTruthy()

    // too far
    const rightUp2 = Hex.RIGHT_UP.plus(Hex.RIGHT_UP)
    expect(threeByFour.validate(PlayerMove.constructDelta(
        Player.Zero, Hex.ORIGIN, rightUp2),
        options,
    )).toBeFalsy()
    expect(messages[messages.length-1].tag).toBe('illegal move')
    expect(messages[messages.length-1].msg.includes('2')).toBeTruthy()

    // wrong owner
    const oneOriginUp = PlayerMove.constructDelta(
        Player.One, Hex.ORIGIN, Hex.UP)
    expect(threeByFour.validate(oneOriginUp, options)).toBeFalsy()
    expect(messages[messages.length-1].tag).toBe('wrong player')
    expect(threeByFour.validate(oneOriginUp)).toBeFalsy()

    // pop of only 1
    const moved = threeByFour.applyMove(PlayerMove.constructDelta(
        Player.Zero, Hex.ORIGIN, Hex.UP
    )).board
    const movedOptions = moved.validationOptions(messages)
    expect(moved.validate(
        PlayerMove.constructDelta(Player.Zero, Hex.ORIGIN, Hex.UP),
        movedOptions,
    )).toBeFalsy()
    expect(messages[messages.length-1].tag).toBe('insufficient population')
    movedOptions.ignoreSmallPop = true
    expect(moved.validate(PlayerMove.constructDelta(
        Player.Zero, Hex.ORIGIN, Hex.UP
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
    expect(threeByFour.getTile(ur).terrain).toBe(Terrain.City)
    expect(threeByFour.getTile(ur).pop).toBe(20)
    expect(threeByFour.getTile(ur).isOwned).toBeTruthy()
    expect(threeByFour.getTile(urd).isOwned).toBeFalsy()

    // make a move
    const moved = threeByFour.applyMove(
        PlayerMove.constructDelta(Player.One, ur, Hex.DOWN)
    ).board
    expect(moved.getTile(ur).pop).toBe(1)
    expect(moved.getTile(urd).pop).toBe(19)
    expect(moved.getTile(urd2).pop).toBe(0)

    // after turn 1, no changes in population
    const one = moved.stepPop(1)
    expect(one.getTile(ur).pop).toBe(1)
    expect(one.getTile(urd).pop).toBe(19)
    expect(one.getTile(urd2).pop).toBe(0)

    // after turn 2, city grows
    const two = one.stepPop(2)
    expect(two.getTile(ur).pop).toBe(2)
    expect(two.getTile(urd).pop).toBe(19)
    expect(two.getTile(urd2).pop).toBe(0)

    // after turn 50, both city and countryside grow
    const fifty = two.stepPop(50)
    expect(fifty.getTile(ur).pop).toBe(3)
    expect(fifty.getTile(urd).pop).toBe(20)
    expect(fifty.getTile(urd2).pop).toBe(0)
})