import {Range} from 'immutable';
import {RectangularConstraints} from '../board/Constraints'
import {Hex} from './Hex'
import {countHexes} from '../../view/hex/HexConstants';

it('checks hex neighbors', () => {
    expect(Hex.ORIGIN.getRightDown() === Hex.RIGHT_DOWN).toBeTruthy()
    expect(Hex.ORIGIN.getUp() === Hex.UP).toBeTruthy()

    function checkHexNeighbors(c: Hex) {
        expect(c.getRightUp() === c.plus(Hex.RIGHT_UP)).toBeTruthy()
        expect(c.getRightDown() === c.plus(Hex.RIGHT_DOWN)).toBeTruthy()
        expect(c.getDown() === c.plus(Hex.DOWN)).toBeTruthy()
        expect(c.getLeftDown() === c.plus(Hex.LEFT_DOWN)).toBeTruthy()
        expect(c.getLeftUp() === c.plus(Hex.LEFT_UP)).toBeTruthy()
        expect(c.getUp() === c.plus(Hex.UP)).toBeTruthy()

        expect(c.getRightDown().getUp().getLeftDown() === c).toBeTruthy() // triangle
        expect(c.getLeftUp().getDown().getRightUp() === c).toBeTruthy() // triangle
        expect(c.getLeftUp().getLeftDown().getDown()
            .getRightDown().getRightUp().getUp() === c).toBeTruthy() // hexagon loop

        expect(c.getUp().cartY).toBe(c.cartY + 2)
        expect(c.getUp().cartX).toBe(c.cartX)
        expect(c.getLeftDown().cartX).toBe(c.cartX - 1)
        expect(c.getLeftDown().cartY).toBe(c.cartY - 1)
        expect(c.getLeftUp().cartY).toBe(c.cartY + 1)
    }

    checkHexNeighbors(Hex.ORIGIN)
    checkHexNeighbors(Hex.ORIGIN.getDown())
    checkHexNeighbors(Hex.ORIGIN.getRightUp())
    // true, but is this what we want?
    expect(Hex.NONE.getRightUp() === Hex.NONE).toBeTruthy()

    function r() { return Math.floor(Math.random() * 20) } // 0 - 19
    Range(0, 20).forEach(() => {
        const x = r(), y = r()
        checkHexNeighbors(Hex.get(x, y, - x - y))
    })
})

it('checks trigonometry', () => {
    // Hex.DIRECTIONS.forEach((hex) =>
    //     console.log(`${hex.toString(true, true)}`)
    // )

    expect(Hex.UP.cartYGeo).toBeCloseTo(1)
    expect(Hex.UP.cartXGeo).toBeCloseTo(0)
    // 30 degrees
    expect(Hex.RIGHT_UP.cartYGeo).toBeCloseTo(0.5)
    expect(Hex.RIGHT_UP.cartXGeo).toBeCloseTo(Math.cos(Math.PI / 6))

    expect(Hex.RIGHT_UP.degrees).toBeCloseTo(30)
    expect(Hex.UP.degrees).toBeCloseTo(90)
    expect(Hex.LEFT_UP.degrees).toBeCloseTo(150)
    expect(Hex.LEFT_DOWN.degrees).toBeCloseTo(210)
    expect(Hex.DOWN.degrees).toBeCloseTo(270)
    expect(Hex.RIGHT_DOWN.degrees).toBeCloseTo(330)
})

it('sorts hexes', () => {
    expect(Hex.ORIGIN.compareTo(Hex.ORIGIN)).toBe(0)

    expect(Hex.ORIGIN.compareTo(Hex.UP)).toBeLessThan(0)
    expect(Hex.ORIGIN.compareTo(Hex.DOWN)).toBeGreaterThan(0)
    expect(Hex.ORIGIN.compareTo(Hex.LEFT_UP)).toBeLessThan(0)
    expect(Hex.ORIGIN.compareTo(Hex.RIGHT_UP)).toBeLessThan(0)
    expect(Hex.ORIGIN.compareTo(Hex.LEFT_DOWN)).toBeGreaterThan(0)
    expect(Hex.ORIGIN.compareTo(Hex.RIGHT_DOWN)).toBeGreaterThan(0)

    expect(Hex.NONE.compareTo(Hex.NONE)).toBeNaN()
    expect(Hex.NONE.compareTo(Hex.ORIGIN)).toBeNaN()

})