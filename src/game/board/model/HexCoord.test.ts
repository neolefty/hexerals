import {RectangularConstraints} from './Constraints'
import {HexCoord} from './HexCoord'

it('checks hex neighbors', () => {
    expect(HexCoord.ORIGIN.getRightDown() === HexCoord.RIGHT_DOWN).toBeTruthy()
    expect(HexCoord.ORIGIN.getUp() === HexCoord.UP).toBeTruthy()

    function checkHexNeighbors(c: HexCoord) {
        expect(c.getRightUp() === c.plus(HexCoord.RIGHT_UP)).toBeTruthy()
        expect(c.getRightDown() === c.plus(HexCoord.RIGHT_DOWN)).toBeTruthy()
        expect(c.getDown() === c.plus(HexCoord.DOWN)).toBeTruthy()
        expect(c.getLeftDown() === c.plus(HexCoord.LEFT_DOWN)).toBeTruthy()
        expect(c.getLeftUp() === c.plus(HexCoord.LEFT_UP)).toBeTruthy()
        expect(c.getUp() === c.plus(HexCoord.UP)).toBeTruthy()

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

    checkHexNeighbors(HexCoord.ORIGIN)
    checkHexNeighbors(HexCoord.ORIGIN.getDown())
    checkHexNeighbors(HexCoord.ORIGIN.getRightUp())
    // true, but is this what we want?
    expect(HexCoord.NONE.getRightUp() === HexCoord.NONE).toBeTruthy()

    function r() { return Math.floor(Math.random() * 20) } // 0 - 19
    for (let i = 0; i < 20; ++i) {
        const x = r(), y = r()
        checkHexNeighbors(HexCoord.get(x, y, - x - y))
    }
})

const slow = false, reallySlow = false

const timeRect = (w: number, h: number) => {
    const start = new Date()
    const constraints = new RectangularConstraints(w, h)
    const n = constraints.all().size
    expect(n).toBe(w * h - Math.trunc(h / 2))
    if (slow || reallySlow) {
        const elapsed = new Date().getTime() - start.getTime()
        const msPerCell = elapsed / n
        const cellPerMs = Math.round(100/msPerCell) / 100
        console.log(`Elapsed for ${ w } x ${ h } rectangular constraints: ${
            elapsed } ms -- ${ cellPerMs } cell per ms / ${ msPerCell } ms per cell`)
    }
}

it('checks various sizes of board constraints', () => {
    const sizes = [ 1, 10, 50, 50 ]
    if (slow) sizes.concat([100, 200, 200])
    if (reallySlow) sizes.concat([500, 1000])
    sizes.forEach(n => timeRect(n, n))
})

it('checks trigonometry', () => {
    // HexCoord.DIRECTIONS.forEach((hex) =>
    //     console.log(`${hex.toString(true, true)}`)
    // )

    expect(HexCoord.UP.cartYExact).toBeCloseTo(1)
    expect(HexCoord.UP.cartXExact).toBeCloseTo(0)
    // 30 degrees
    expect(HexCoord.RIGHT_UP.cartYExact).toBeCloseTo(0.5)
    expect(HexCoord.RIGHT_UP.cartXExact).toBeCloseTo(Math.cos(Math.PI / 6))

    expect(HexCoord.RIGHT_UP.degrees).toBeCloseTo(30)
    expect(HexCoord.UP.degrees).toBeCloseTo(90)
    expect(HexCoord.LEFT_UP.degrees).toBeCloseTo(150)
    expect(HexCoord.LEFT_DOWN.degrees).toBeCloseTo(210)
    expect(HexCoord.DOWN.degrees).toBeCloseTo(270)
    expect(HexCoord.RIGHT_DOWN.degrees).toBeCloseTo(330)
})