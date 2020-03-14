import {List, Map} from 'immutable'
import {StatusMessage} from '../../../common/StatusMessage'
import {GamePhase} from '../cycle/GamePhase'
import {Hex} from '../hex/Hex'
import {Tile} from '../hex/Tile'
import {PlayerMove} from '../move/Move'
import {MovementQueue} from '../move/MovementQueue'
import {pickNPlayers, Player} from '../players/Players'
import {Robot} from '../players/Robot'
import {CornersPlayerArranger} from '../setup/PlayerArranger'
import {TileArranger} from '../setup/TileArranger'
import {Board} from './Board'
import {
    BoardReducer,
    doCancelMoves,
    doApplyMoves,
    doGameTick,
    GameAction,
    INITIAL_BOARD_STATE,
    doNewGame,
    doPlaceCursor,
    doQueueMoves,
    doRobotsDecide,
    doSetCurPlayer,
    doSetRobot,
} from './BoardReducer'

import {BoardState, boardStateToString} from './BoardState'

export class BoardReducerTester {
    static readonly INITIAL_POP = 50
    static readonly INITIAL_WIDTH = 11
    static readonly INITIAL_HEIGHT = 13
    state: BoardState

    constructor(
        width = BoardReducerTester.INITIAL_WIDTH,
        height = BoardReducerTester.INITIAL_HEIGHT,
        arrangers: TileArranger[] = [
            new CornersPlayerArranger(BoardReducerTester.INITIAL_POP)
        ],
        players: List<Player> = pickNPlayers(2),
    ) {
        this.state = INITIAL_BOARD_STATE
        this.dispatch(doNewGame(Board.constructDefaultRectangular(
            width, height, players, arrangers,
        )))
    }

    dispatch(action: GameAction) {
        this.state = BoardReducer(this.state, action)
    }

    getRawTile = (coord: Hex | undefined): Tile | undefined => coord && this.explicitTiles.get(coord)
    getTile = (hex: Hex): Tile => this.board.getTile(hex)
    setTile = (hex: Hex, tile: Tile) =>
        this.state.board = this.board.setTiles(this.explicitTiles.set(hex, tile))

    get board(): Board { return this.state.board }
    get phase(): GamePhase { return this.state.phase }
    get explicitTiles(): Map<Hex, Tile> { return this.board.explicitTiles }
    get cursors(): Map<number, Hex> { return this.state.cursors }
    get firstCursor(): Hex { return this.cursors.get(0, Hex.NONE) }
    get messages(): List<StatusMessage> { return this.state.messages }
    get cursorRawTile(): Tile | undefined { return this.getRawTile(this.firstCursor) }
    get firstCursorTile(): Tile { return this.getTile(this.firstCursor) }
    get moves(): MovementQueue { return this.state.moves }

    get ll() { return this.state.board.edges.lowerLeft }
    get ul() { return this.state.board.edges.upperLeft }
    get ur() { return this.state.board.edges.upperRight }
    get lr() { return this.state.board.edges.lowerRight }

    queueMove = (player: Player, delta: Hex, alsoCursor = true) => {
        this.dispatch(
            doQueueMoves(
                List([PlayerMove.constructDelta(player, this.firstCursor, delta)])
            )
        )
        if (alsoCursor)
            this.setCursor(this.firstCursor.plus(delta))
    }

    queueMoveDown = (alsoCursor = true) => {
        if (this.state.curPlayer)
            this.queueMove(this.state.curPlayer, Hex.DOWN, alsoCursor)
    }

    queueMoveUp = (alsoCursor = true) => {
        if (this.state.curPlayer)
            this.queueMove(this.state.curPlayer, Hex.UP, alsoCursor)
    }

    setCursor = (coord: Hex) => { this.dispatch(doPlaceCursor(coord)) }
    doMoves = () => { this.dispatch(doApplyMoves()) }
    doAllMoves = () => {
        while (this.moves.size > 0)
            this.doMoves()
    }
    gameTick = () => { this.dispatch(doGameTick()) }
    queueRobots = () => { this.dispatch(doRobotsDecide()) }
    setCurPlayer = (player: Player) => { this.dispatch(doSetCurPlayer(player)) }

    cancelMoves = (
        player: Player | undefined = undefined,
        cursorIndex: number = -1,
        count: number = 1,
    ) => {
        const actualPlayer = player || this.state.curPlayer
        if (actualPlayer)
            this.dispatch(
                doCancelMoves(
                    actualPlayer, cursorIndex, count))
        else
            throw Error('current player is undefined')
    }

    setRobot = (player: Player, robot: Robot) => {
        this.dispatch(doSetRobot(player, robot))
    }

    popTotal = (player: Player) => {
        let result = 0
        this.board.forOccupiableTiles((hex, tile) =>
            result += tile.owner === player ? tile.pop : 0
        )
        return result
    }

    get isGameOver(): boolean {
        const firstTile = this.board.explicitTiles.first(Tile.EMPTY)
        if (firstTile === Tile.EMPTY) return true

        // are all explicit occupiable tiles owned by the same player?
        const contender = firstTile.owner
        try {
            this.board.explicitTiles.forEach(tile => {
                if (tile && tile.canBeOccupied && tile.owner !== contender)
                    throw new Error('different')
            })
            return true
        }
        catch(e) {
            if (e.message === 'different') return false
            else throw e
        }
    }

    toString = () => boardStateToString(this.state)
}
