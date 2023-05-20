import {List, Range} from 'immutable'

import {StatusMessage} from '../../../common/StatusMessage'
import {
    doApplyMoves,
    doGameTick,
    doPlaceCursor,
    doQueueMoves,
    doRobotsDecide
} from '../board/BoardStateReducer'
import {BoardStateReducerTester} from '../board/BoardStateReducerTester'
import {BoardState} from '../board/BoardState'
import {LocalGameOptions} from '../board/LocalGameOptions'
import {Hex} from '../hex/Hex'
import {Tile} from '../hex/Tile'
import {PlayerMove} from '../move/Move'
import {Player} from '../players/Players'
import {CycleAction, doChangeLocalOption, doOpenLocalGame} from "./CycleAction"
import {CycleReducer} from './CycleReducer'
import {CycleState, cycleStateToString, DEFAULT_CYCLE_STATE, LocalGameState} from './CycleState'

export class CycleReducerTester {
    state: CycleState
    constructor() {
        this.state = DEFAULT_CYCLE_STATE
        this.changeLocalOption('startingPop', 20)
    }

    dispatch(action: CycleAction) {
        this.state = CycleReducer(this.state, action)
    }

    get localGame(): LocalGameState | undefined { return this.state.localGame }
    get localBoard(): BoardState | undefined {
        return this.localGame && this.localGame.boardState
    }
    get cursor(): Hex {
        return (this.localBoard && this.localBoard.cursors.get(0, Hex.NONE))
            || Hex.NONE
    }
    get edges() { return this.localBoard && this.localBoard.board.edges }
    get ll() { return this.edges?.lowerLeft || Hex.NONE }
    get ul() { return this.edges?.upperLeft || Hex.NONE }
    get ur() { return this.edges?.upperRight || Hex.NONE }
    get lr() { return this.edges?.lowerRight || Hex.NONE }

    get messages(): List<StatusMessage> {
        return this.localBoard?.messages || List()
    }

    getTile = (hex: Hex) =>
        this.localBoard?.board.getTile(hex) || Tile.EMPTY

    queueMove = (
        from: Hex = Hex.ORIGIN,
        delta: Hex = Hex.UP,
        player: Player = Player.Zero,
    ) => {
        this.dispatch(doPlaceCursor(from))
        this.dispatch(doQueueMoves(List([
            PlayerMove.constructDelta(player, from, delta)
        ])))
    }

    robotsDecide = () => { this.dispatch(doRobotsDecide()) }
    doMoves = () => { this.dispatch(doApplyMoves()) }
    tick = (n: number = 1) => {
        Range(0, n).forEach(
            () => this.dispatch(doGameTick())
        )
    }

    changeLocalOption = (name: keyof LocalGameOptions, n: number) => {
        this.dispatch(doChangeLocalOption(name, n))
    }

    // true by default
    useSpreadArranger = (spread: boolean = true) => {
        this.changeLocalOption('randomStart', spread ? 1 : 0)
    }
    useCornersArranger = (corners: boolean = true) => {
        this.useSpreadArranger(!corners)
    }

    openLocalGame = (
        width = BoardStateReducerTester.INITIAL_WIDTH,
        height = BoardStateReducerTester.INITIAL_HEIGHT,
        numRobots = 1,
        difficulty = 0,
        mountainPercent = 0,
    ) => {
        this.changeLocalOption('boardWidth', width)
        this.changeLocalOption('boardHeight', height)
        this.changeLocalOption('numRobots', numRobots)
        this.changeLocalOption('difficulty', difficulty)
        this.changeLocalOption('mountainPercent', mountainPercent)
        this.dispatch(doOpenLocalGame())
    }

    toString = () => cycleStateToString(this.state)
}

