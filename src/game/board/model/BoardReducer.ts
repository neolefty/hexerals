import {List} from 'immutable'

import {HexCoord} from './HexCoord'
import {HexMove, PlayerMove} from './Move';
import {Board} from './Board'
import {BoardState} from './BoardState'
import {EMPTY_MOVEMENT_QUEUE, QueueAndMoves} from './MovementQueue'
import {GenericAction} from '../../../common/App'
import {StatusMessage} from '../../../common/StatusMessage'
import {pickNPlayers, Player, PlayerManager} from '../../players/Players'
import {GameDecision, Robot} from '../../players/Robot';

// derived from https://github.com/Microsoft/TypeScript-React-Starter#typescript-react-starter
// TODO: try https://www.npmjs.com/package/redux-actions
// TODO: figure out immutable approach too, maybe with immutable.js

export type GameAction
    = NewGame | QueueMoves | PlaceCursor | SetPlayer
        | DoMoves | CancelMoves | StepPop | RobotsDecide

// should never actually see this -- we just need a default for reducers
const INITIAL_PLAYERS = pickNPlayers(0)
export const INITIAL_BOARD_STATE: BoardState = {
    board: Board.constructSquare(2, INITIAL_PLAYERS),
    turn: 0,
    cursor: HexCoord.NONE,
    players: PlayerManager.construct(INITIAL_PLAYERS),
    curPlayer: INITIAL_PLAYERS[0],
    moves: EMPTY_MOVEMENT_QUEUE,
    messages: List([]),
}

export const BoardReducer = (
    state: BoardState = INITIAL_BOARD_STATE, action: GameAction,
): BoardState => {
    if (isNewGame(action))
        state = newGameReducer(state, action)
    else if (isPlaceCursor(action))
        state = placeCursorReducer(state, action)
    else if (isQueueMove(action))
        state = queueMovesReducer(state, action)
    else if (isCancelMoves(action))
        state = cancelMoveReducer(state, action)
    else if (isDoMoves(action))
        state = doMovesReducer(state)
    else if (isStepPop(action))
        state = stepPopReducer(state)
    else if (isSetPlayer(action))
        state = setPlayerReducer(state, action)
    else if (isRobotsDecide(action))
        state = robotsDecideReducer(state)
    return state
}

const NEW_GAME = 'NEW_GAME'
type NEW_GAME = typeof NEW_GAME
interface NewGame extends GenericAction {
    type: NEW_GAME
    board: Board
}
const isNewGame = (action: GameAction): action is NewGame =>
    action.type === NEW_GAME
export const newGameAction = (board: Board): NewGame =>
    ({ type: NEW_GAME, board: board })
const newGameReducer = (state: BoardState, action: NewGame): BoardState => ({
    ...state,
    cursor: HexCoord.NONE,
    board: action.board,
})

// add to the player's movement queue
const QUEUE_MOVES = 'QUEUE_MOVES'
type QUEUE_MOVES = typeof QUEUE_MOVES
interface QueueMoves extends GenericAction {
    type: QUEUE_MOVES
    moves: List<PlayerMove>
}
const isQueueMove = (action: GameAction): action is QueueMoves =>
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
        options.ignoreSmallPop = true
        if (queuedTo) // if the player hopes to have already taken that spot, let them try
            options.ignoreSpotOwner = true
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
const DO_MOVES = 'DO_MOVES'
type DO_MOVES = typeof DO_MOVES
interface DoMoves extends GenericAction { type: DO_MOVES }
const isDoMoves = (action: GameAction): action is DoMoves =>
    action.type === DO_MOVES
export const doMovesAction = (): DoMoves => ({ type: DO_MOVES })
const doMovesReducer = (state: BoardState): BoardState => {
    // TODO rotate startPlayerIndex
    const movesAndQ = state.moves.popEach(
        (move: PlayerMove) => state.board.validate(move))
    if (movesAndQ) { // undefined if no moves to apply
        const boardAndMessages = state.board.applyMoves(movesAndQ.moves)
        return {
            ...state,
            messages: boardAndMessages.addToMessages(state.messages),
            moves: movesAndQ.queue,
            board: boardAndMessages.board,
        }
    }
    else
        return state
}

// forget the last move in the queue
const CANCEL_MOVES = 'CANCEL_MOVES'
type CANCEL_MOVES = typeof CANCEL_MOVES
interface CancelMoves extends GenericAction {
    type: CANCEL_MOVES,
    player: Player,
    count: number,
}
const isCancelMoves = (action: GameAction): action is CancelMoves =>
    action.type === CANCEL_MOVES
export const cancelMovesAction = (
    player: Player, count: number
): CancelMoves => ({
    type: CANCEL_MOVES,
    player: player,
    count: count,
})
const cancelMoveReducer = (
    state: BoardState, action: CancelMoves
): BoardState => {
    const updated: QueueAndMoves | undefined
        = state.moves.cancelMoves(action.player, action.count)
    if (updated) {
        const cancelled = updated.moves
        const oldest = cancelled.first() as PlayerMove
        const newest = cancelled.last() as PlayerMove
        // Cancel cursor movement too if it looks like the current player just queued this move.
        const cursor = (
            state.curPlayer === oldest.player
            && state.cursor === newest.dest
        )
            ? oldest.source
            : state.cursor
        return {
            ...state,
            moves: updated.queue,
            cursor: cursor,
        }
    }
    else
        return state
}

// TODO combine DO_MOVES and STEP_POP into STEP?
const STEP_POP = 'STEP_POP'
type STEP_POP = 'STEP_POP'
interface StepPop extends GenericAction {type: STEP_POP}
const isStepPop = (action: GameAction): action is StepPop => action.type === STEP_POP
export const stepPopAction = (): StepPop => ({ type: STEP_POP })
const stepPopReducer = (state: BoardState): BoardState => ({
    ...state,
    board: state.board.stepPop(state.turn),
    turn: state.turn + 1,
})

const PLACE_CURSOR = 'PLACE_CURSOR'
type PLACE_CURSOR = typeof PLACE_CURSOR
interface PlaceCursor extends GenericAction {
    type: PLACE_CURSOR
    position: HexCoord
}
const isPlaceCursor = (action: GameAction): action is PlaceCursor =>
    action.type === PLACE_CURSOR
export const placeCursorAction = (position: HexCoord): PlaceCursor =>
    ({ type: PLACE_CURSOR, position: position })
const placeCursorReducer = (state: BoardState, action: PlaceCursor): BoardState =>
    (action.position === state.cursor || !state.board.inBounds(action.position))
        ? state
        : {
            ...state,
            cursor: action.position,
        }

const SET_PLAYER = 'SET_PLAYER'
type SET_PLAYER = typeof SET_PLAYER
interface SetPlayer extends GenericAction {
    type: SET_PLAYER
    player: Player
}
const isSetPlayer = (action: GameAction): action is SetPlayer =>
    action.type === SET_PLAYER
export const setPlayerAction = (player: Player): SetPlayer =>
    ({ type: SET_PLAYER, player: player })
const setPlayerReducer = (state: BoardState, action: SetPlayer): BoardState => ({
    ...state,
    curPlayer: action.player,
})

// let robots make decisions
const ROBOTS_DECIDE = 'ROBOTS_DECIDE'
type ROBOTS_DECIDE = typeof ROBOTS_DECIDE
interface RobotsDecide extends GenericAction { type: ROBOTS_DECIDE }
const isRobotsDecide = (action: GameAction): action is RobotsDecide =>
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
                cancelMovesAction(player, decision.cancelMoves)
            )
        if (decision && decision.makeMoves)
            result = queueMovesReducer(
                result,
                queueMovesAction(
                    List(decision.makeMoves.map((hex: HexMove) =>
                        PlayerMove.construct(player, hex.source, hex.delta)
                    ))
                )
            )
    })
    return result
}