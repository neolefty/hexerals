import {Hex} from "../hex/Hex"
import {Board} from "./Board"
import {Niches} from "./Niches"

it('finds niches above and below a board', () => {
    const seven = Board.constructDefaultSquare(7)
    const sevenNiches = new Niches(seven)
    // console.log(hexesToString(List<Hex>(seven.hexesAll).sort(hexCompare)))
    // console.log(sevenNiches.toString())
    expect(sevenNiches.tops.size).toBe(3)
    expect(sevenNiches.ul === Hex.getCart(1, 13)).toBeTruthy()
    expect(sevenNiches.ur === Hex.getCart(5, 13)).toBeTruthy()
    expect(sevenNiches.bottoms.size).toBe(3)
    expect(sevenNiches.ll === Hex.getCart(1, -1)).toBeTruthy()
    expect(sevenNiches.lr === Hex.getCart(5, -1)).toBeTruthy()

    // _-_-_- "6x6" (even-numbered)
    // _-_-_- looks like this
    // _-_-_-
    const six = Board.constructDefaultRectangular(6, 6)
    const sixNiches = new Niches(six)
    // console.log(hexesToString(List<Hex>(six.hexesAll).sort(hexCompare)))
    // console.log(sixNiches.toString())
    expect(sixNiches.tops.size).toBe(3)
    expect(sixNiches.ul === Hex.getCart(0, 6)).toBeTruthy()
    expect(sixNiches.ur === Hex.getCart(4, 6)).toBeTruthy()
    expect(sixNiches.bottoms.size).toBe(3)
    expect(sixNiches.ll === Hex.getCart(1, -1)).toBeTruthy()
    expect(sixNiches.lr === Hex.getCart(5, -1)).toBeTruthy()
})