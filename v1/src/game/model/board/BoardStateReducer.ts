import {List} from 'immutable'
import {Reducer} from "react"
import {AnalyticsAction, AnalyticsCategory, logAnalyticsEvent} from '../../../common/Analytics'
import {GenericAction} from '../../../common/GenericAction'
import {StatusMessage} from '../../../common/StatusMessage'
import {GamePhase} from '../cycle/GamePhase'
import {Hex} from '../hex/Hex'
import {floodShortestPath} from '../hex/ShortestPath'
import {HexMove, PlayerMove} from '../move/Move'
import {QueueAndMoves} from '../move/MovementQueue'
import {pickNPlayers, Player, PlayerManager} from '../players/Players'
import {GameDecision, Robot} from '../players/Robot'
import {Board} from './Board'
import {analyticsLabel, BOARD_STATE_STARTER, BoardState, DEFAULT_CURSORS} from './BoardState'

// derived from https://github.com/Microsoft/TypeScript-React-Starter#typescript-react-starter
// TODO: try https://www.npmjs.com/package/redux-actions

export type BoardStateAction
    = NewGameAction | QueueMoves | PlaceCursorAction | SetCurPlayerAction
        | ApplyMovesAction | CancelMovesAction | GameDragAction | GameTickAction
        | RobotsDecideAction | SetRobotAction

const NEW_GAME = 'boardstate new'
const GAME_TICK = 'boardstate tick'
const QUEUE_MOVES = 'boardstate queue moves'
const APPLY_MOVES = 'boardstate apply moves'
const CANCEL_MOVES = 'boardstate cancel moves'
const PLACE_CURSOR = 'boardstate place cursor'
const GAME_DRAG = 'boardstate drag'
const SET_CUR_PLAYER = 'boardstate set cur player'
const SET_ROBOT = 'boardstate set robot'
const ROBOTS_DECIDE = 'boardstate robots decide'

export const isGameAction = (action: GenericAction): action is BoardStateAction =>
    action.type.startsWith('boardstate ')

// should never actually see this -- we just need a default for reducers
const INITIAL_PLAYERS = pickNPlayers(0)
export const INITIAL_BOARD_STATE: BoardState = {
    ...BOARD_STATE_STARTER,
    board: Board.constructDefaultSquare(2, INITIAL_PLAYERS),
    players: PlayerManager.construct(INITIAL_PLAYERS),
}

export const BoardStateReducer: Reducer<BoardState, BoardStateAction> = (
    state: BoardState = INITIAL_BOARD_STATE, action: BoardStateAction,
): BoardState => {
    switch(action.type) {
        case QUEUE_MOVES:  // most common first
            return queueMovesReducer(state, action)
        case PLACE_CURSOR:
            return placeCursorReducer(state, action)
        case APPLY_MOVES:
            return applyMovesReducer(state)
        case GAME_DRAG:
            return dragReducer(state, action)
        case GAME_TICK:
            return GameTickReducer(state)
        case CANCEL_MOVES:
            return cancelMoveReducer(state, action)
        case NEW_GAME:
            return newGameReducer(state, action)
        case SET_CUR_PLAYER:
            return setCurPlayerReducer(state, action)
        case SET_ROBOT:
            return setRobotReducer(state, action)
        case ROBOTS_DECIDE:
            return robotsDecideReducer(state)
    }
}

interface NewGameAction {
    type: typeof NEW_GAME
    board: Board
}
export const doNewGame = (board: Board): NewGameAction =>
    ({ type: NEW_GAME, board })
const newGameReducer = (state: BoardState, action: NewGameAction): BoardState => ({
    ...state,
    cursors: DEFAULT_CURSORS,
    board: action.board,
})

// update to the player's movement queue
interface QueueMoves {
    type: typeof QUEUE_MOVES
    moves: List<PlayerMove>
}
export const doQueueMoves = (moves: List<PlayerMove>): QueueMoves =>
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
        // Allow queueing into mountains so we don't circumvent fog — UI prevents
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
interface ApplyMovesAction { type: typeof APPLY_MOVES }
export const doApplyMoves = (): ApplyMovesAction => ({ type: APPLY_MOVES })
const applyMovesReducer = (state: BoardState): BoardState => {
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

interface GameTickAction {type: typeof GAME_TICK}
export const doGameTick = (): GameTickAction => ({ type: GAME_TICK })
const GameTickReducer = (state: BoardState): BoardState => {

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
        // TODO log local game options — but we don't have them here ...
        logAnalyticsEvent(AnalyticsAction.end, AnalyticsCategory.local, analyticsLabel(result))
    }

    return Object.freeze(result)
}

interface GameDragAction {
    type: typeof GAME_DRAG,
    player: Player,
    cursorIndex: number,
    source: Hex,
    dest: Hex,
}
export const doGameDrag = (
    player: Player, cursorIndex: number, source: Hex, dest: Hex
): GameDragAction => ({
    type: GAME_DRAG, player, cursorIndex, source, dest,
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
    state: BoardState, action: GameDragAction
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
                doCancelMoves(action.player, action.cursorIndex, nCancel)
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
            state = queueMovesReducer(state, doQueueMoves(toQueue))
        }

        state = placeCursorReducer(
            state,
            doPlaceCursor(action.dest, action.cursorIndex)
        )
    }
    return state
}

// forget the last move in the queue
interface CancelMovesAction {
    type: typeof CANCEL_MOVES,
    player: Player,
    cursorIndex: number,
    count: number,
}
export const doCancelMoves = (
    player: Player, cursorIndex: number, count: number,
): CancelMovesAction => ({
    type: CANCEL_MOVES, player, cursorIndex, count,
})
const cancelMoveReducer = (
    state: BoardState, action: CancelMovesAction
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

interface PlaceCursorAction {
    type: typeof PLACE_CURSOR
    index: number
    position: Hex
    clearOthers: boolean
}
export const doPlaceCursor = (
    position: Hex, index: number = 0, clearOthers: boolean = false,
): PlaceCursorAction =>
    ({ type: PLACE_CURSOR, position, index, clearOthers })
const placeCursorReducer = (
    state: BoardState, action: PlaceCursorAction
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

interface SetCurPlayerAction {
    type: typeof SET_CUR_PLAYER
    player: Player
}
export const doSetCurPlayer = (player: Player): SetCurPlayerAction =>
    ({ type: SET_CUR_PLAYER, player })
const setCurPlayerReducer = (state: BoardState, action: SetCurPlayerAction): BoardState => ({
    ...state,
    curPlayer: action.player,
})

interface SetRobotAction {
    type: typeof SET_ROBOT
    player: Player
    robot: Robot | undefined
}
export const doSetRobot = (player: Player, robot: Robot | undefined): SetRobotAction =>
    ({ type: SET_ROBOT, player, robot })
const setRobotReducer = (state: BoardState, action: SetRobotAction): BoardState => ({
    ...state,
    players: state.players.setRobot(action.player, action.robot)
})

// let robots make decisions
interface RobotsDecideAction { type: typeof ROBOTS_DECIDE }
export const doRobotsDecide = (): RobotsDecideAction => ({ type: ROBOTS_DECIDE })
const robotsDecideReducer = (state: BoardState): BoardState => {
    let result = state
    state.players.playerRobots.forEach((robot: Robot, player: Player) => {
        const decision: GameDecision | undefined = robot.decide(
            player, state, state.moves.playerQueues.get(player)
        )
        if (decision && decision.cancelMoves)
            result = cancelMoveReducer(
                result,
                doCancelMoves(player, -1, decision.cancelMoves)
            )
        if (decision && decision.makeMoves)
            result = queueMovesReducer(
                result,
                doQueueMoves(
                    List(decision.makeMoves.map((move: HexMove) =>
                        PlayerMove.construct(player, move)
                    ))
                )
            )
    })
    return result
}
