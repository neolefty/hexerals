import { Hex } from "../hex/Hex"
import { Board } from "../board/Board"
import { StatusMessage } from "../../../common/StatusMessage"
import { Tile } from "../hex/Tile"
import { Map } from "immutable"
import { TileArranger } from "./TileArranger"

export class YMountainArranger extends TileArranger {
    static readonly Y_DIRS: Hex[] = [Hex.LEFT_UP, Hex.DOWN, Hex.RIGHT_UP]

    constructor(
        readonly blankInnerRadius: number = 0,
        readonly blankOuterRadius: number = 2
    ) {
        super()
    }

    arrange(
        board: Board,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        status: StatusMessage[] | undefined = undefined
    ): Map<Hex, Tile> {
        const result = Map<Hex, Tile>().asMutable()
        const centerHex = this.findCenter(board)
        YMountainArranger.Y_DIRS.forEach((dir) => {
            let cursor = centerHex
            Array(this.blankInnerRadius).forEach(
                () => (cursor = cursor.plus(dir))
            )
            while (
                board.inBounds(cursor.plus(dir.times(this.blankOuterRadius)))
            ) {
                result.set(cursor, Tile.MOUNTAIN)
                cursor = cursor.plus(dir)
            }
        })
        return result.asImmutable()
    }

    findCenter(board: Board): Hex {
        let [sumX, sumY, sumZ] = [0, 0, 0]
        board.hexesAll.forEach((hex) => {
            sumX += hex.x
            sumY += hex.y
            sumZ += hex.z
        })
        const n = board.hexesAll.size
        const [avgX, avgY, avgZ] = [sumX / n, sumY / n, sumZ / n]
        const distanceFromAvg = (hex: Hex) =>
            Math.abs(hex.x - avgX) +
            Math.abs(hex.y - avgY) +
            Math.abs(hex.z - avgZ)
        let closestHex = board.hexesAll.first() as Hex
        board.hexesAll.forEach((hex) => {
            if (distanceFromAvg(hex) < distanceFromAvg(closestHex))
                closestHex = hex
        })
        return closestHex
    }
}
