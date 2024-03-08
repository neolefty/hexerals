// eslint-disable-next-line @typescript-eslint/no-unused-vars

import { HexSvgBoard } from "@hexerals/hex-svg-board"
import { List } from "immutable"

export function App() {
    const list = List([1, 2])
    return (
        <>
            <header>
                <h1>Hexerals {list.size}.0</h1>
            </header>
            <HexSvgBoard />
        </>
    )
}
export default App
