import {Set, List} from 'immutable'
import {Reducer} from "react"

import {StatusMessage} from '../../../common/StatusMessage'
import {AnalyticsAction, AnalyticsCategory, logAnalyticsEvent} from '../../../common/Analytics'
import {Hex} from '../hex/Hex'
import {HexMove, PlayerMove} from '../move/Move'
import {analyticsLabel, BoardState, DEFAULT_CURSORS, BOARD_STATE_STARTER} from './BoardState'
import {QueueAndMoves} from '../move/MovementQueue'
import {pickNPlayers, Player, PlayerManager} from '../players/Players'
import {GameDecision, Robot} from '../players/Robot'
import {floodShortestPath} from '../hex/ShortestPath'
import {GamePhase} from '../cycle/GamePhase'
import {GenericAction} from '../../../common/GenericAction'
import {Board} from './Board'

// derived from https://github.com/Microsoft/TypeScript-React-Starter#typescript-react-starter
// TODO: try https://www.npmjs.com/package/redux-actions

export type GameAction
    = NewGame | QueueMoves | PlaceCursor | SetCurPlayer
        | DoMoves | CancelMoves | Drag | GameTick
        | RobotsDecide | SetRobot

const NEW_GAME = 'NEW_GAME'
const GAME_TICK = 'GAME_TICK'
const QUEUE_MOVES = 'QUEUE_MOVES'
const DO_MOVES = 'DO_MOVES'
const CANCEL_MOVES = 'CANCEL_MOVES'
const PLACE_CURSOR = 'PLACE_CURSOR'
const DRAG = 'DRAG'
const SET_CUR_PLAYER = 'SET_CUR_PLAYER'
const SET_ROBOT = 'SET_ROBOT'
const ROBOTS_DECIDE = 'ROBOTS_DECIDE'

const ACTION_TYPES = Set<string>([
    NEW_GAME, GAME_TICK,
    QUEUE_MOVES, DO_MOVES, CANCEL_MOVES, PLACE_CURSOR, DRAG,
    SET_CUR_PLAYER, SET_ROBOT, ROBOTS_DECIDE,
])

export const isGameAction = (action: GenericAction): action is GameAction =>
    ACTION_TYPES.has(action.type)

// should never actually see this -- we just need a default for reducers
const INITIAL_PLAYERS = pickNPlayers(0)
export const INITIAL_BOARD_STATE: BoardState = {
    ...BOARD_STATE_STARTER,
    board: Board.constructDefaultSquare(2, INITIAL_PLAYERS),
    players: PlayerManager.construct(INITIAL_PLAYERS),
}

export const BoardReducer: Reducer<BoardState, GenericAction> = (
    state: BoardState = INITIAL_BOARD_STATE, action: GenericAction,
): BoardState => {
    if (isGameAction(action)) {
        if (isQueueMove(action))  // most common first
            state = queueMovesReducer(state, action)
        else if (isPlaceCursor(action))
            state = placeCursorReducer(state, action)
        else if (isDoMoves(action))
            state = doMovesReducer(state)
        else if (isDrag(action))
            state = dragReducer(state, action)
        else if (isGameTick(action))
            state = gameTickReducer(state)
        else if (isCancelMoves(action))
            state = cancelMoveReducer(state, action)
        else if (isNewGame(action))
            state = newGameReducer(state, action)
        else if (isSetCurPlayer(action))
            state = setCurPlayerReducer(state, action)
        else if (isSetRobot(action))
            state = setRobotReducer(state, action)
        else if (isRobotsDecide(action))
            state = robotsDecideReducer(state)
    }
    return state
}

type NEW_GAME = typeof NEW_GAME
interface NewGame extends GenericAction {
    type: NEW_GAME
    board: Board
}
export const isNewGame = (action: GenericAction): action is NewGame =>
    action.type === NEW_GAME
export const newGameAction = (board: Board): NewGame =>
    ({ type: NEW_GAME, board })
const newGameReducer = (state: BoardState, action: NewGame): BoardState => ({
    ...state,
    cursors: DEFAULT_CURSORS,
    board: action.board,
})

// update to the player's movement queue
type QUEUE_MOVES = typeof QUEUE_MOVES
interface QueueMoves extends GenericAction {
    type: QUEUE_MOVES
    moves: List<PlayerMove>
}
const isQueueMove = (action: GenericAction): action is QueueMoves =>
    action.type === QUEUE_MOVES
export const queueMovesAction = (moves: List<PlayerMove>): QueueMoves =>
    ({ type: QUEUE_MOVES, moves: moves })
const queueMovesReducer = (
    state: BoardState, action: QueueMoves
): BoardState => {
    let result = state
    action.moves.forEach((move: PlayerMove) => {
        const newMessages: StatusMessage[] = []
        const queuedTo = result.moves
            .playerIsQueuedTo(move.player, move.source)
        const options = result.board.validationOptions(newMessages)
        // newMessages.forEach(m => console.log(m.toString()))
        options.ignoreSmallPop = true
        // Allow queueing into mountains so we don't circumvent fog — UI prevents
        // known mountains, and also moves are re-validated when executed.
        options.ignoreOccupiability = true
        if (queuedTo) // if the player hopes to have already taken that hex, let them try
            options.ignoreTileOwner = true
        const valid = result.board.validate(move, options)
        const updatedMessages = newMessages.length > 0
            ? result.messages.push(...newMessages)
            : result.messages
        if (valid)
            result = {
                ...result,
                messages: updatedMessages,
                moves: result.moves.addMove(move),
            }
        // TODO assert state.messages !== updatedMessages
        else if (result.messages !== updatedMessages)
            result = {
                ...result,
                messages: updatedMessages,
            }
        // else not valid but no messages, so state doesn't change
        // -- probably shouldn't happen -- always have a message instead?
    })
    return result
}

// advance one step in the queue of moves for each player
type DO_MOVES = typeof DO_MOVES
interface DoMoves extends GenericAction { type: DO_MOVES }
const isDoMoves = (action: GenericAction): action is DoMoves =>
    action.type === DO_MOVES
export const doMovesAction = (): DoMoves => ({ type: DO_MOVES })
const doMovesReducer = (state: BoardState): BoardState => {
    // TODO rotate startPlayerIndex
    const movesAndQ = state.moves.popEach(
        (move: PlayerMove) => state.board.validate(move))
    if (movesAndQ) { // undefined if no moves to apply
        const boardAndMessages = state.board.applyMoves(movesAndQ.moves)
        const result: BoardState = {
            ...state,
            moves: movesAndQ.queue,
            board: boardAndMessages.board,
            captures: boardAndMessages.captures,
            messages: boardAndMessages.addToMessages(state.messages),
        }
        return Object.freeze(result)
    }
    else
        return state
}

type GAME_TICK = 'GAME_TICK'
interface GameTick extends GenericAction {type: GAME_TICK}
const isGameTick = (action: GenericAction): action is GameTick => action.type === GAME_TICK
export const gameTickAction = (): GameTick => ({ type: GAME_TICK })
const gameTickReducer = (state: BoardState): BoardState => {

    // 1. advance pop
    const result: BoardState = {
        ...state,
        board: state.board.stepPop(state.turn),
        turn: state.turn + 1,
        // at least mark the game as started
        phase: state.phase === GamePhase.BeforeStart
            ? GamePhase.Started : state.phase
    }

    // 2. gather stats
    if (state.phase !== GamePhase.Ended)
        result.stats = result.stats.update(result)

    // 3. update phase
    if (
        state.captures  // only end on a capture
        && state.phase !== GamePhase.Ended  // didn't already end
        && result.stats.last.hexes.size <= 1 // no more than one player remains
    ) {
        result.phase = GamePhase.Ended
        // TODO log local game options — but we don't have them here ...
        logAnalyticsEvent(AnalyticsAction.end, AnalyticsCategory.local, analyticsLabel(result))
    }

    return Object.freeze(result)
}

type DRAG = typeof DRAG
interface Drag extends GenericAction {
    type: DRAG,
    player: Player,
    cursorIndex: number,
    source: Hex,
    dest: Hex,
}
const isDrag = (action: GenericAction): action is Drag =>
    action.type === DRAG
export const dragAction = (
    player: Player, cursorIndex: number, source: Hex, dest: Hex
): Drag => ({
    type: DRAG, player, cursorIndex, source, dest,
})
// drag behavior:
//   * cursors follows initial selection & drag
//   * dragging adds to queue, TODO preferring high-pop hexes
//   * backtracking (exactly) removes from queue

// high-speed drag behavior (not implemented):
//   * cursors set by drag start, follows tail of queue
//   * dragging resets queue to be best path from cursors
//   * no need for additional queue removal behavior

// TODO move this logic elsewhere
const dragReducer = (
    state: BoardState, action: Drag
): BoardState => {
    const destTile = state.board.getTile(action.dest)
    if (destTile.canBeOccupied) {
        let path = floodShortestPath(state.board.hexesOccupiable, action.source, action.dest)

        // console.log(`drag along ${path.map(hex => hex.toString()).toArray()} to ${destTile}`)

        // cancel backtracked moves
        const queued: List<PlayerMove> | undefined
            = state.moves.playerQueues.get(action.player)
        let nCancel = 0
        if (queued && queued.size) {
            const rPath = path.reverse()
            // moves for this cursor, in reverse order ...
            // noinspection PointlessBooleanExpressionJS
            const rQueued = queued.reverse().filter(move =>
                !!(move && move.cursorIndex === action.cursorIndex)
            ) as List<PlayerMove>
            // ... cancel the ones that are a pure backtrack
            while (
                nCancel < rPath.size && nCancel < rQueued.size
                && rPath.get(nCancel) === (rQueued.get(nCancel) as PlayerMove).source
            )
                ++nCancel
        }
        if (nCancel > 0) {
            state = cancelMoveReducer(
                state,
                cancelMovesAction(action.player, action.cursorIndex, nCancel)
            )
            path = path.slice(0, path.size - nCancel) as List<Hex>
            // console.log(`--> cancelling ${nCancel}, leaving ${path.map(hex=>hex.toString()).toArray()}`)
        }

        // queue the rest of the path
        if (path.size > 0) {
            const toQueue = path.pop().map((source, index) =>
                // know path is 1 longer because we're operating on its pop()'d child
                PlayerMove.constructDest(action.player, source, path.get(index + 1) as Hex)
            ) as List<PlayerMove>
            // console.log(`--> queueing ${toQueue.toArray()}`)
            state = queueMovesReducer(state, queueMovesAction(toQueue))
        }

        state = placeCursorReducer(
            state,
            placeCursorAction(action.dest, action.cursorIndex)
        )
    }
    return state
}

// forget the last move in the queue
type CANCEL_MOVES = typeof CANCEL_MOVES
interface CancelMoves extends GenericAction {
    type: CANCEL_MOVES,
    player: Player,
    cursorIndex: number,
    count: number,
}
const isCancelMoves = (action: GenericAction): action is CancelMoves =>
    action.type === CANCEL_MOVES
export const cancelMovesAction = (
    player: Player, cursorIndex: number, count: number,
): CancelMoves => ({
    type: CANCEL_MOVES, player, cursorIndex, count,
})
const cancelMoveReducer = (
    state: BoardState, action: CancelMoves
): BoardState => {
    const updated: QueueAndMoves | undefined =
        state.moves.cancelMoves(
            action.player, action.cursorIndex, action.count
        )

    if (updated) {
        const cancelled = updated.moves
        // Cancel cursor movement too if it looks like the current player just queued this move.
        let cursors = state.cursors
        if (action.player === state.curPlayer) {
            // If the cursor was at the end of the chain of cancelled moves (newest), move it back before the start of the chain (oldest).
            cursors.forEach((cursor: Hex, index: number) => {
                // noinspection PointlessBooleanExpressionJS
                const cursorMatch = (move: PlayerMove): boolean =>
                    !!(move && move.cursorIndex === index)
                const oldest = cancelled.find(cursorMatch)
                const newest = cancelled.findLast(cursorMatch)
                if (oldest && newest && cursors.get(index) === newest.dest)
                    cursors = cursors.set(index, oldest.source)
            })
        }
        return Object.freeze({
            ...state,
            moves: updated.queue,
            cursors,
        })
    }
    else
        return state
}

type PLACE_CURSOR = typeof PLACE_CURSOR
interface PlaceCursor extends GenericAction {
    type: PLACE_CURSOR
    index: number
    position: Hex
    clearOthers: boolean
}
const isPlaceCursor = (action: GenericAction): action is PlaceCursor =>
    action.type === PLACE_CURSOR
export const placeCursorAction = (
    position: Hex, index: number = 0, clearOthers: boolean = false,
): PlaceCursor =>
    ({ type: PLACE_CURSOR, position, index, clearOthers })
const placeCursorReducer = (
    state: BoardState, action: PlaceCursor
): BoardState => {
    const original = action.clearOthers ? DEFAULT_CURSORS : state.cursors
    let updated = original
    if (action.position === Hex.NONE) {
        if (state.cursors.has(action.index)) {
            updated = updated.remove(action.index)
        }
    }
    else {
        if (
            action.position !== state.cursors.get(action.index)
            && state.board.canBeOccupied(action.position)
        ) {
            updated = updated.set(action.index, action.position)
        }
    }
    return (updated === original)
        ? state
        : Object.freeze({
            ...state,
            cursors: updated,
        })
}

type SET_CUR_PLAYER = typeof SET_CUR_PLAYER
interface SetCurPlayer extends GenericAction {
    type: SET_CUR_PLAYER
    player: Player
}
const isSetCurPlayer = (action: GenericAction): action is SetCurPlayer =>
    action.type === SET_CUR_PLAYER
export const setCurPlayerAction = (player: Player): SetCurPlayer =>
    ({ type: SET_CUR_PLAYER, player })
const setCurPlayerReducer = (state: BoardState, action: SetCurPlayer): BoardState => ({
    ...state,
    curPlayer: action.player,
})

type SET_ROBOT = typeof SET_ROBOT
interface SetRobot extends GenericAction {
    type: SET_ROBOT
    player: Player
    robot: Robot | undefined
}
const isSetRobot = (action: GenericAction): action is SetRobot =>
    action.type === SET_ROBOT
export const setRobotAction = (player: Player, robot: Robot | undefined): SetRobot =>
    ({ type: SET_ROBOT, player, robot })
const setRobotReducer = (state: BoardState, action: SetRobot): BoardState => ({
    ...state,
    players: state.players.setRobot(action.player, action.robot)
})

// let robots make decisions
type ROBOTS_DECIDE = typeof ROBOTS_DECIDE
interface RobotsDecide extends GenericAction { type: ROBOTS_DECIDE }
const isRobotsDecide = (action: GenericAction): action is RobotsDecide =>
    action.type === ROBOTS_DECIDE
export const robotsDecideAction = (): RobotsDecide => ({ type: ROBOTS_DECIDE })
const robotsDecideReducer = (state: BoardState): BoardState => {
    let result = state
    state.players.playerRobots.forEach((robot: Robot, player: Player) => {
        const decision: GameDecision | undefined = robot.decide(
            player, state, state.moves.playerQueues.get(player)
        )
        if (decision && decision.cancelMoves)
            result = cancelMoveReducer(
                result,
                cancelMovesAction(player, -1, decision.cancelMoves)
            )
        if (decision && decision.makeMoves)
            result = queueMovesReducer(
                result,
                queueMovesAction(
                    List(decision.makeMoves.map((move: HexMove) =>
                        PlayerMove.construct(player, move)
                    ))
                )
            )
    })
    return result
}
