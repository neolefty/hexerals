import {createStore, Store} from 'redux'
import {List, Range} from 'immutable'

import {StatusMessage} from '../../../common/StatusMessage'
import {
    doMovesAction,
    gameTickAction,
    placeCursorAction,
    queueMovesAction,
    robotsDecideAction
} from '../board/BoardReducer'
import {BoardReducerTester} from '../board/BoardReducerTester'
import {BoardState} from '../board/BoardState'
import {Hex} from '../hex/Hex'
import {Tile} from '../hex/Tile'
import {PlayerMove} from '../move/Move'
import {Player} from '../players/Players'
import {CycleState, cycleStateToString, LocalGameState} from './CycleState'
import {changeLocalOptionAction, CycleReducer, openLocalGameAction} from './CycleReducer'
import {LocalGameOptions} from '../board/LocalGameOptions'

export class CycleReducerTester {
    readonly store: Store<CycleState>
    constructor() {
        this.store = createStore(CycleReducer)
        this.changeLocalOption('startingPop', 20)
    }

    get state(): CycleState { return this.store.getState() }
    get localGame(): LocalGameState | undefined { return this.state.localGame }
    get localBoard(): BoardState | undefined {
        return this.localGame && this.localGame.boardState
    }
    get cursor(): Hex {
        return (this.localBoard && this.localBoard.cursors.get(0, Hex.NONE))
            || Hex.NONE
    }
    get edges() { return this.localBoard && this.localBoard.board.edges }
    get ll() { return this.edges && this.edges.lowerLeft || Hex.NONE }
    get ul() { return this.edges && this.edges.upperLeft || Hex.NONE }
    get ur() { return this.edges && this.edges.upperRight || Hex.NONE }
    get lr() { return this.edges && this.edges.lowerRight || Hex.NONE }

    get messages(): List<StatusMessage> {
        return this.localBoard && this.localBoard.messages || List()
    }

    getTile = (hex: Hex) =>
        this.localBoard && this.localBoard.board.getTile(hex) || Tile.EMPTY

    queueMove = (
        from: Hex = Hex.ORIGIN,
        delta: Hex = Hex.UP,
        player: Player = Player.Zero,
    ) => {
        this.store.dispatch(placeCursorAction(from))
        this.store.dispatch(queueMovesAction(List([
            PlayerMove.constructDelta(player, from, delta)
        ])))
    }

    robotsDecide = () => { this.store.dispatch(robotsDecideAction()) }
    doMoves = () => { this.store.dispatch(doMovesAction()) }
    tick = (n: number = 1) => {
        Range(0, n).forEach(
            () => this.store.dispatch(gameTickAction())
        )
    }

    changeLocalOption = (name: keyof LocalGameOptions, n: number) => {
        this.store.dispatch(changeLocalOptionAction(name, n))
    }

    // true by default
    useSpreadArranger = (spread: boolean = true) => {
        this.changeLocalOption('randomStart', spread ? 1 : 0)
    }
    useCornersArranger = (corners: boolean = true) => {
        this.useSpreadArranger(!corners)
    }

    openLocalGame = (
        width = BoardReducerTester.INITIAL_WIDTH,
        height = BoardReducerTester.INITIAL_HEIGHT,
        numRobots = 1,
        difficulty = 0,
        mountainPercent = 0,
    ) => {
        this.changeLocalOption('boardWidth', width)
        this.changeLocalOption('boardHeight', height)
        this.changeLocalOption('numRobots', numRobots)
        this.changeLocalOption('difficulty', difficulty)
        this.changeLocalOption('mountainPercent', mountainPercent)
        this.store.dispatch(openLocalGameAction())
    }

    toString = () => cycleStateToString(this.state)
}
