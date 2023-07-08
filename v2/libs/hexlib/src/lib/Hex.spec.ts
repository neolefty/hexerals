import { Hex } from "./Hex"
import { NumberRange } from "./NumberRange"

it("checks hex neighbors", () => {
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
        expect(
            c
                .getLeftUp()
                .getLeftDown()
                .getDown()
                .getRightDown()
                .getRightUp()
                .getUp() === c
        ).toBeTruthy() // hexagon loop

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

    function r() {
        return Math.floor(Math.random() * 20)
    } // 0 - 19
    NumberRange(0, 20).forEach(() => {
        const x = r(),
            y = r()
        checkHexNeighbors(Hex.get(x, y, -x - y))
    })
})
