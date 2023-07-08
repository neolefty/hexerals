import { NumberRange } from "./NumberRange"

it("creates number ranges", () => {
    expect(NumberRange(4, 7)).toEqual([4, 5, 6])
    expect(NumberRange(3, 3)).toEqual([])
    expect(NumberRange(-3, 2)).toEqual([-3, -2, -1, 0, 1])
})
