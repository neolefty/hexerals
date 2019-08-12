import {Hex} from "../hex/Hex"
import {Board} from "./Board"

it('finds niches above and below a board', () => {
    const seven = Board.constructDefaultSquare(7)
    // console.log(hexesToString(List<Hex>(seven.hexesAll).sort(hexCompare)))
    // console.log(sevenNiches.toString())
    expect(seven.niches.tops.size).toBe(3)
    expect(seven.niches.ul === Hex.getCart(1, 13)).toBeTruthy()
    expect(seven.niches.ur === Hex.getCart(5, 13)).toBeTruthy()
    expect(seven.niches.bottoms.size).toBe(3)
    expect(seven.niches.ll === Hex.getCart(1, -1)).toBeTruthy()
    expect(seven.niches.lr === Hex.getCart(5, -1)).toBeTruthy()

    // _-_-_- "6x6" (even-numbered)
    // _-_-_- looks like this
    // _-_-_-
    const six = Board.constructDefaultRectangular(6, 6)
    // console.log(hexesToString(List<Hex>(six.hexesAll).sort(hexCompare)))
    // console.log(sixNiches.toString())
    expect(six.niches.tops.size).toBe(3)
    expect(six.niches.ul === Hex.getCart(0, 6)).toBeTruthy()
    expect(six.niches.ur === Hex.getCart(4, 6)).toBeTruthy()
    expect(six.niches.bottoms.size).toBe(3)
    expect(six.niches.ll === Hex.getCart(1, -1)).toBeTruthy()
    expect(six.niches.lr === Hex.getCart(5, -1)).toBeTruthy()

    const sixteen = Board.constructDefaultRectangular(15, 23)
    expect(sixteen.edges.lowerLeft === Hex.ORIGIN).toBeTruthy()
    expect(sixteen.edges.upperRight === Hex.getCart(14, 22)).toBeTruthy()
    expect(sixteen.niches.ur === sixteen.edges.upperRight.plus(Hex.LEFT_UP)).toBeTruthy()
})