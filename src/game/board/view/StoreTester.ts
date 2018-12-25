import {createStore, Store} from 'redux';
import {BoardState, boardStateToString} from '../model/BoardState';
import {
    BoardReducer,
    cancelMovesAction,
    doMovesAction,
    newGameAction,
    placeCursorAction,
    queueMovesAction,
    robotsDecideAction,
    setCurPlayerAction,
    setRobotAction
} from '../model/BoardReducer';
import {Board} from '../model/Board';
import {pickNPlayers, Player} from '../../players/Players';
import {CornersPlayerArranger} from '../model/Arranger';
import {List, Map} from 'immutable';
import {HexCoord} from '../model/HexCoord';
import {Spot} from '../model/Spot';
import {StatusMessage} from '../../../common/StatusMessage';
import {MovementQueue} from '../model/MovementQueue';
import {PlayerMove} from '../model/Move';
import {Robot} from '../../players/Robot';

export class StoreTester {
    static readonly INITIAL_POP = 50
    static readonly INITIAL_WIDTH = 11
    static readonly INITIAL_HEIGHT = 7
    readonly store: Store<BoardState>

    constructor(
        width = StoreTester.INITIAL_WIDTH,
        height = StoreTester.INITIAL_HEIGHT,
    ) {
        this.store = createStore<BoardState>(BoardReducer)
        // console.log(`before: board ${store.getState().board} game.board ${store.getState().board.spots.size}`)
        this.store.dispatch(newGameAction(Board.constructRectangular(
            width, height,
            pickNPlayers(2),
            [new CornersPlayerArranger(StoreTester.INITIAL_POP)],
        )))
        // console.log(`after: board ${store.getState().board.spots.size} game.board ${store.getState().board.spots.size}`)
    }

    get state(): BoardState { return this.store.getState() }
    get board(): Board { return this.state.board }
    get spots(): Map<HexCoord, Spot> { return this.board.spots }
    get cursor(): HexCoord { return this.state.cursor }
    get messages(): List<StatusMessage> { return this.state.messages }

    // interpolates "empty spot" for undefined
    getRawSpot = (coord: HexCoord): Spot | undefined => this.spots.get(coord)
    getSpot = (coord: HexCoord): Spot => this.board.getSpot(coord)

    get cursorRawSpot(): Spot | undefined { return this.getRawSpot(this.cursor) }
    get cursorSpot(): Spot { return this.getSpot(this.cursor) }
    get moves(): MovementQueue { return this.state.moves }
    get ll() { return this.state.board.edges.lowerLeft }
    get ul() { return this.state.board.edges.upperLeft }
    get ur() { return this.state.board.edges.upperRight }
    get lr() { return this.state.board.edges.lowerRight }

    queueMove = (player: Player, delta: HexCoord, alsoCursor = true) => {
        this.store.dispatch(
            queueMovesAction(
                List([PlayerMove.construct(player, this.cursor, delta)])
            )
        )
        if (alsoCursor)
            this.placeCursor(this.cursor.plus(delta))
    }

    queueMoveDown = (alsoCursor = true) => {
        if (this.state.curPlayer)
            this.queueMove(this.state.curPlayer, HexCoord.DOWN, alsoCursor)
    }

    queueMoveUp = (alsoCursor = true) => {
        if (this.state.curPlayer)
            this.queueMove(this.state.curPlayer, HexCoord.UP, alsoCursor)
    }

    placeCursor = (coord: HexCoord) => this.store.dispatch(placeCursorAction(coord))
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