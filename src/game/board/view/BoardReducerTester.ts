import {List, Map} from 'immutable';
import {createStore, Store} from 'redux';

import {BoardState, boardStateToString} from '../model/BoardState';
import {
    BoardReducer,
    cancelMovesAction, doMovesAction, newGameAction, placeCursorAction,
    queueMovesAction, robotsDecideAction, setCurPlayerAction, setRobotAction,
} from '../model/BoardReducer';
import {Board} from '../model/Board';
import {pickNPlayers, Player} from '../model/players/Players';
import {CornersPlayerArranger} from '../model/PlayerArranger';
import {Hex} from '../model/Hex';
import {Tile} from '../model/Tile';
import {StatusMessage} from '../../../common/StatusMessage';
import {MovementQueue} from '../model/MovementQueue';
import {PlayerMove} from '../model/Move';
import {Robot} from '../model/players/Robot';

export class BoardReducerTester {
    static readonly INITIAL_POP = 50
    static readonly INITIAL_WIDTH = 11
    static readonly INITIAL_HEIGHT = 7
    readonly store: Store<BoardState>

    constructor(
        width = BoardReducerTester.INITIAL_WIDTH,
        height = BoardReducerTester.INITIAL_HEIGHT,
    ) {
        this.store = createStore<BoardState>(BoardReducer)
        this.store.dispatch(newGameAction(Board.constructRectangular(
            width, height,
            pickNPlayers(2),
            [new CornersPlayerArranger(BoardReducerTester.INITIAL_POP)],
        )))
    }

    getRawTile = (coord: Hex): Tile | undefined => this.tiles.get(coord)
    getTile = (coord: Hex): Tile => this.board.getTile(coord)

    get state(): BoardState { return this.store.getState() }
    get board(): Board { return this.state.board }
    get tiles(): Map<Hex, Tile> { return this.board.explicitTiles }
    get cursor(): Hex { return this.state.cursor }
    get messages(): List<StatusMessage> { return this.state.messages }
    get cursorRawTile(): Tile | undefined { return this.getRawTile(this.cursor) }
    get cursorTile(): Tile { return this.getTile(this.cursor) }
    get moves(): MovementQueue { return this.state.moves }

    get ll() { return this.state.board.edges.lowerLeft }
    get ul() { return this.state.board.edges.upperLeft }
    get ur() { return this.state.board.edges.upperRight }
    get lr() { return this.state.board.edges.lowerRight }

    queueMove = (player: Player, delta: Hex, alsoCursor = true) => {
        this.store.dispatch(
            queueMovesAction(
                List([PlayerMove.constructDelta(player, this.cursor, delta)])
            )
        )
        if (alsoCursor)
            this.placeCursor(this.cursor.plus(delta))
    }

    queueMoveDown = (alsoCursor = true) => {
        if (this.state.curPlayer)
            this.queueMove(this.state.curPlayer, Hex.DOWN, alsoCursor)
    }

    queueMoveUp = (alsoCursor = true) => {
        if (this.state.curPlayer)
            this.queueMove(this.state.curPlayer, Hex.UP, alsoCursor)
    }

    placeCursor = (coord: Hex) => this.store.dispatch(placeCursorAction(coord))
    doMoves = () => this.store.dispatch(doMovesAction())
    queueRobots = () => this.store.dispatch(robotsDecideAction())
    setCurPlayer = (player: Player) => this.store.dispatch(setCurPlayerAction(player))

    cancelMoves = (
        player: Player | undefined = undefined,
        count: number = 1,
    ) => {
        const actualPlayer = player || this.state.curPlayer
        if (actualPlayer)
            this.store.dispatch(cancelMovesAction(actualPlayer, count))
        else
            throw Error('current player is undefined')
    }

    setRobot = (player: Player, robot: Robot) =>
        this.store.dispatch(setRobotAction(player, robot))

    toString = () => boardStateToString(this.state)
}