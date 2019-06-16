import {List, Map} from 'immutable'
import {countHexes} from "../../view/hex/HexConstants"

import {Board} from './Board'
import {pickNPlayers, Player} from '../players/Players'
import {StatusMessage} from '../../../common/StatusMessage'
import {PlayerMove} from '../move/Move'
import {CornersPlayerArranger} from '../setup/PlayerArranger'
import {Tile} from '../hex/Tile'
import {Hex} from '../hex/Hex'
import {Terrain} from '../hex/Terrain'

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
                    c = (tile.terrain === Terrain.Mountain) ? 'M' : '-'
            }
            line += c
        })
        out += line + '\n'
        // console.log(line)
    })
    console.log(out)
}

it('converts between hex and cartesian coords', () => {
    const w = 11, h = 9
    const elevenByNine = Board.constructDefaultRectangular(
        w, h, pickNPlayers(2), [new CornersPlayerArranger(1)])
    // h x w, but every other row (that is, h/2 rows) is short by 1
    expect(elevenByNine.constraints.all.size === w * h - Math.trunc(h/2))

    const metaCartTile = (cx: number, cy: number) => (
        () => elevenByNine.getCartTile(cx, cy)
    )

    expect(metaCartTile(6, 3)).toThrow()  // assert sum is even
    expect(metaCartTile(-1, -1)).toThrow()  // out of bounds
    expect(metaCartTile(w, h)).toThrow()  // out of bounds
    expect(metaCartTile(w, 0)).toThrow()  // out of bounds
    expect(metaCartTile(0, h)).toThrow()  // out of bounds

    const midHex = Hex.getCart(6, 2)
    expect(midHex === Hex.get(6, -2, -4)).toBeTruthy()
    // expect(midHex === Hex.get(6, -2, -4)).toBeTruthy()
    expect(elevenByNine.getCartTile(6, 2) === Tile.MAYBE_EMPTY).toBeTruthy()
})

it ('top to bottom', () => {
    const sixByEight = Board.constructDefaultRectangular(6, 8)
    expect(sixByEight.hexesAll.size).toBe(countHexes(6, 8))
    const rs = sixByEight.constraints.allReverseSorted
    expect(rs.size).toBe(countHexes(6, 8))
    // console.log(hexesToString(rs))
    expect(rs.first() === Hex.getCart(5,7)).toBeTruthy()
    expect(rs.last() === Hex.ORIGIN).toBeTruthy()
})

it('overlays', () => {
    const five = Board.constructDefaultSquare(
        5,
        pickNPlayers(4),
        [new CornersPlayerArranger(10)],
    )
    expect(five.getTile(Hex.ORIGIN))
        .toEqual(new Tile(Player.Zero, 10, Terrain.City))
    expect(five.getTile(Hex.RIGHT_UP) === Tile.MAYBE_EMPTY).toBeTruthy()
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
    const elevenByTen = Board.constructDefaultRectangular(
        11, 10, pickNPlayers(2), [new CornersPlayerArranger(20)])
    expect(elevenByTen.inBounds(Hex.ORIGIN)).toBeTruthy()
    expect(elevenByTen.constraints.all.contains(Hex.ORIGIN)).toBeTruthy()
    expect(elevenByTen.inBounds(Hex.NONE)).toBeFalsy()
    expect(elevenByTen.constraints.all.contains(Hex.NONE)).toBeFalsy()

    // staggered walk from origin to the right edge
    let c = Hex.ORIGIN
    while (elevenByTen.inBounds(c.getRightUp().getRightDown())) {
        c = c.getRightUp().getRightDown()
        expect(elevenByTen.constraints.all.contains(c))
    }
    expect(c === elevenByTen.edges.lowerRight).toBeTruthy()
    expect(c).toEqual(elevenByTen.edges.lowerRight)
    expect(c === elevenByTen.edges.lowerRight).toBeTruthy()
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
    const threeBySeven = Board.constructDefaultRectangular(
        3, 7, pickNPlayers(2), [new CornersPlayerArranger(20)])
    const messages: StatusMessage[] = []
    const options = threeBySeven.validationOptions(messages)

    expect(threeBySeven.validate(PlayerMove.constructDelta(
        Player.Zero, threeBySeven.edges.lowerLeft, Hex.UP
    ))).toBeTruthy()
    expect(threeBySeven.edges.lowerLeft).toBe(Hex.ORIGIN)
    expect(threeBySeven.validate(PlayerMove.constructDelta(
        Player.One, threeBySeven.edges.upperRight, Hex.DOWN
    ))).toBeTruthy()

    // would go off the board
    expect(threeBySeven.validate(
        PlayerMove.constructDelta(Player.One, threeBySeven.edges.upperRight, Hex.UP),
        options,
    )).toBeFalsy()
    expect(messages[messages.length-1].tag).toBe('out of bounds')
    expect(messages[messages.length-1].msg.startsWith('destination')).toBeTruthy()

    // would start off the board
    expect(threeBySeven.validate(
        PlayerMove.constructDelta(Player.Zero, Hex.DOWN, Hex.UP),
        options,
    )).toBeFalsy()
    expect(messages[messages.length-1].tag).toBe('out of bounds')
    expect(messages[messages.length-1].msg.startsWith('start')).toBeTruthy()

    // too far
    const rightUp2 = Hex.RIGHT_UP.plus(Hex.RIGHT_UP)
    expect(threeBySeven.validate(PlayerMove.constructDelta(
        Player.Zero, Hex.ORIGIN, rightUp2),
        options,
    )).toBeFalsy()
    expect(messages[messages.length-1].tag).toBe('illegal move')
    expect(messages[messages.length-1].msg.includes('2')).toBeTruthy()

    // wrong owner
    const oneOriginUp = PlayerMove.constructDelta(
        Player.One, Hex.ORIGIN, Hex.UP)
    expect(threeBySeven.validate(oneOriginUp, options)).toBeFalsy()
    expect(messages[messages.length-1].tag).toBe('wrong player')
    expect(threeBySeven.validate(oneOriginUp)).toBeFalsy()

    // pop of only 1
    const moved = threeBySeven.applyMove(PlayerMove.constructDelta(
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
    const threeByThirteen = Board.constructDefaultRectangular(
        3, 13, pickNPlayers(2),
        [new CornersPlayerArranger(20)],
    )
    const ur = threeByThirteen.edges.upperRight
    const urd = ur.getDown()
    const urd2 = urd.getDown()
    expect(threeByThirteen.getTile(ur).terrain).toBe(Terrain.City)
    expect(threeByThirteen.getTile(ur).pop).toBe(20)
    expect(threeByThirteen.getTile(ur).isOwned).toBeTruthy()
    expect(threeByThirteen.getTile(urd).isOwned).toBeFalsy()

    // make a move
    const moved = threeByThirteen.applyMove(
        PlayerMove.constructDelta(Player.One, ur, Hex.DOWN)
    ).board
    // after turn 0, city doesn't grow
    expect(moved.getTile(ur).pop).toBe(1)
    expect(moved.getTile(urd).pop).toBe(19)
    expect(moved.getTile(urd2).pop).toBe(0)

    // after turn 1, city grows
    const one = moved.stepPop(1)
    expect(one.getTile(ur).pop).toBe(2)
    expect(one.getTile(urd).pop).toBe(19)
    expect(one.getTile(urd2).pop).toBe(0)

    // after turn 50, both city and countryside grow
    const fifty = one.stepPop(49)
    expect(fifty.getTile(ur).pop).toBe(3)
    expect(fifty.getTile(urd).pop).toBe(20)
    expect(fifty.getTile(urd2).pop).toBe(0)
})

it('captures capitals and checks stats', () => {
    const start = Board.constructDefaultRectangular(
        3, 3, pickNPlayers(2),
        [new CornersPlayerArranger(20, Terrain.Capital)],
    )
    expect(start.getHexStatistics().get(Player.Zero, -1)).toBe(1)
    expect(start.getPopStatistics().get(Player.Zero, -1)).toBe(20)
    expect(start.getHexStatistics().size).toBe(2)
    expect(start.getTile(Hex.ORIGIN).terrain).toBe(Terrain.Capital)
    // move player one to lower right corner
    const moved = start.applyMoves(List([
        PlayerMove.constructDelta(
            Player.One, start.edges.upperRight, Hex.LEFT_DOWN),
        PlayerMove.constructDelta(
            Player.One, Hex.RIGHT_UP, Hex.RIGHT_DOWN),
    ])).board
    expect(moved.getCartTile(2, 0).pop).toBe(18)
    const captured = moved.applyMoves(List([
        PlayerMove.constructDelta(
            Player.Zero, Hex.ORIGIN, Hex.RIGHT_UP),
        PlayerMove.constructDelta(
            Player.Zero, Hex.RIGHT_UP, Hex.RIGHT_UP),
    ])).board
    expect(captured.getCartTile(2, 2)).toEqual(
        new Tile(Player.Zero, 16, Terrain.CapturedCapital))
    expect(captured.getCartTile(2, 0)).toEqual(
        new Tile(Player.Zero, 9))
    expect(captured.getHexStatistics().get(Player.One, 0)).toBe(0)
    expect(captured.getHexStatistics().get(Player.Zero, -1)).toBe(4)
    expect(captured.getPopStatistics().get(Player.Zero, -1)).toBe(27)
})