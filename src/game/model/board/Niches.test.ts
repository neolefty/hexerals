import {Hex} from "../hex/Hex"
import {Board} from "./Board"
import {Niches} from "./Niches"

it('finds niches above and below a board', () => {
    const seven = Board.constructDefaultSquare(7)
    const sevenNiches = new Niches(seven)
    // console.log(hexesToString(List<Hex>(seven.hexesAll).sort(hexCompare)))
    // console.log(sevenNiches.toString())
    expect(sevenNiches.tops.size).toBe(3)
    expect(sevenNiches.tops.first(Hex.NONE) === Hex.getCart(1, 13)).toBeTruthy()
    expect(sevenNiches.tops.last(Hex.NONE) === Hex.getCart(5, 13)).toBeTruthy()
    expect(sevenNiches.bottoms.size).toBe(3)
    expect(sevenNiches.bottoms.first(Hex.NONE) === Hex.getCart(1, -1)).toBeTruthy()
    expect(sevenNiches.bottoms.last(Hex.NONE) === Hex.getCart(5, -1)).toBeTruthy()

    // _-_-_- "6x6" (even-numbered)
    // _-_-_- looks like this
    // _-_-_-
    const six = Board.constructDefaultRectangular(6, 6)
    const sixNiches = new Niches(six)
    // console.log(hexesToString(List<Hex>(six.hexesAll).sort(hexCompare)))
    // console.log(sixNiches.toString())
    expect(sixNiches.tops.size).toBe(3)
    expect(sixNiches.tops.first(Hex.NONE) === Hex.getCart(0, 6)).toBeTruthy()
    expect(sixNiches.tops.last(Hex.NONE) === Hex.getCart(4, 6)).toBeTruthy()
    expect(sixNiches.bottoms.size).toBe(3)
    expect(sixNiches.bottoms.first(Hex.NONE) === Hex.getCart(1, -1)).toBeTruthy()
    expect(sixNiches.bottoms.last(Hex.NONE) === Hex.getCart(5, -1)).toBeTruthy()
})