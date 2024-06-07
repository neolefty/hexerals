import { Board } from "@repo/game-model/Board"

export const GameBoard = ({board} : {board: Board}) => (
    <div>Board has {board.spots.length} spots.</div>
)
