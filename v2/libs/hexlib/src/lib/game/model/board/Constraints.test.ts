import { List } from "immutable"

import { CornersPlayerArranger } from "../setup/PlayerArranger"
import { countHexes, Hex } from "../hex/Hex"
import { Board } from "./Board"
import { pickNPlayers } from "../players/Players"
import { BoardConstraints, RectangularConstraints } from "./Constraints"

it("counts hexes", () => {
    // all 4 permutations of even & odd
    expect(Board.constructDefaultRectangular(10, 6, List()).hexesAll.size).toBe(
        countHexes(10, 6)
    )
    expect(Board.constructDefaultRectangular(9, 6, List()).hexesAll.size).toBe(
        countHexes(9, 6)
    )
    expect(Board.constructDefaultRectangular(6, 9, List()).hexesAll.size).toBe(
        countHexes(6, 9)
    )
    expect(
        Board.constructDefaultRectangular(19, 21, List()).hexesAll.size
    ).toBe(countHexes(19, 21))
})

it("checks rectangular board geometry", () => {
    const arr = [new CornersPlayerArranger()]
    const twoPlayers = pickNPlayers(2)

    const nineByFour = Board.constructDefaultRectangular(9, 4, twoPlayers, arr)
    // _ - _ - _ - _ - _  <-- upper-right is at cartesian (7, 3)
    // _ - _ - _ - _ - _
    expect(nineByFour.constraints.extreme((x) => x.cartX).cartX).toBe(0) // left 0
    expect(nineByFour.constraints.extreme((x) => x.cartY).cartY).toBe(0) // top 0
    expect(nineByFour.constraints.extreme((x) => -x.cartX).cartX).toBe(8) // right 8
    expect(nineByFour.constraints.extreme((x) => -x.cartY).cartY).toBe(3) // bottom 3
    expect(
        nineByFour.constraints.extreme(
            // cartY is first digit, cartX is second digit
            (x) => x.cartX + 10 * x.cartY,
            BoardConstraints.GT
        ) === Hex.getCart(7, 3)
    ).toBeTruthy() // bottom right

    expect(nineByFour.edges.width).toEqual(9)
    expect(nineByFour.edges.height).toEqual(4)
    expect(nineByFour.edges.xRange().count()).toEqual(9)
    expect(List<number>(nineByFour.edges.xRange())).toEqual(
        List<number>([0, 1, 2, 3, 4, 5, 6, 7, 8])
    )
    expect(List<number>(nineByFour.edges.yRange())).toEqual(
        List<number>([0, 1, 2, 3])
    )

    // for some reason, these both cause a stack overflow:
    // expect(upperLeft === Hex.ORIGIN).toBeTruthy()
    // expect(upperLeft).toEqual(Hex.ORIGIN)
    expect(nineByFour.edges.upperLeft === Hex.ORIGIN).toBeFalsy()
    expect(nineByFour.edges.upperLeft === Hex.getCart(1, 3)).toBeTruthy()
    expect(nineByFour.edges.upperRight === Hex.getCart(7, 3)).toBeTruthy()
    expect(nineByFour.edges.lowerRight === Hex.getCart(8, 0)).toBeTruthy()
    expect(nineByFour.edges.lowerLeft === Hex.ORIGIN).toBeTruthy()
    // expect(nineByFour.edges.upperLeft === Hex.getCart(1, 3)).toBeTruthy()
    // expect(nineByFour.edges.upperRight === Hex.getCart(7, 3)).toBeTruthy()
    // expect(nineByFour.edges.lowerRight === Hex.getCart(8, 0)).toBeTruthy()
    // expect(nineByFour.edges.lowerLeft === Hex.ORIGIN).toBeTruthy()
})

const slow = false,
    reallySlow = false

const timeRect = (w: number, h: number) => {
    const start = new Date()
    const constraints = RectangularConstraints.constructDefault(w, h)
    const n = constraints.all.size
    expect(n).toBe(countHexes(w, h))
    if (slow || reallySlow) {
        const elapsed = new Date().getTime() - start.getTime()
        const msPerCell = elapsed / n
        const cellPerMs = Math.round(100 / msPerCell) / 100
        console.log(
            `Elapsed for ${w} x ${h} rectangular constraints: ${elapsed} ms -- ${cellPerMs} cell per ms / ${msPerCell} ms per cell`
        )
    }
}

it("checks various sizes of board constraints", () => {
    const sizes = [1, 10, 50, 50]
    if (slow) sizes.concat([100, 200, 200])
    if (reallySlow) sizes.concat([500, 1000])
    sizes.forEach((n) => timeRect(n, n))
})
