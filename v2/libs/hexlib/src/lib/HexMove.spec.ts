import { HexMove } from "./HexMove"
import { Hex } from "./Hex"

it("HexMove compares", () => {
    const up = new HexMove(Hex.ORIGIN, Hex.UP)
    const down = new HexMove(Hex.ORIGIN, Hex.DOWN)
    const up2 = new HexMove(Hex.ORIGIN, Hex.UP)
    expect(up.equals(up2)).toBeTruthy()
    expect(down.equals(up)).toBeFalsy()
})
