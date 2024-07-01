import { createDumbBoard } from "./GenerateBoard"
import { neighbors } from "./Board"

test('simple board has correct neighbors', () => {
    const board = createDumbBoard()
    expect(neighbors(0, board.topology, 0)).toEqual([])
    expect(neighbors(0, board.topology)).toEqual([1, 2])
    expect(neighbors(0, board.topology, 2)).toEqual([1, 2, 3])
    expect(neighbors(0, board.topology, 2, true)).toEqual([3])
})