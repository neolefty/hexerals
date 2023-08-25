import { PlayerMove } from "./PlayerMove"
import { HexMove } from "./HexMove"
import { Hex } from "./Hex"

it("PlayerMove compares", () => {
    const upOne1 = PlayerMove.construct(1, new HexMove(Hex.ORIGIN, Hex.UP), 1)
    const downOne1 = PlayerMove.construct(
        1,
        new HexMove(Hex.ORIGIN, Hex.DOWN),
        1
    )
    const upOne2 = PlayerMove.construct(1, new HexMove(Hex.ORIGIN, Hex.UP), 2)
    const upTwo1 = PlayerMove.construct(2, new HexMove(Hex.ORIGIN, Hex.UP), 1)

    expect(upOne1.equals(upOne2)).toBeTruthy()
    expect(upOne1.equals(downOne1)).toBeFalsy()
    expect(upOne1.equals(upTwo1)).toBeFalsy()
})
