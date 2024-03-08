import { inTest } from "./Environment"

describe("Environment", () => {
    it("should be in test mode", () => {
        expect(inTest()).toBeTruthy()
    })
})
