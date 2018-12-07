import {Board, RandomArranger} from './Board'
import {HexCoord} from '../Hex'
import {GenericAction} from '../../App'
import {BoardState} from './BoardState'
import {INITIAL_HEIGHT, INITIAL_POP, INITIAL_WIDTH} from './BoardConstants'
import {EMPTY_MOVEMENT_QUEUE, PlayerMove} from '../MovementQueue'
import {pickNPlayers, Player, PlayerManager} from '../Players'
import {List} from 'immutable'
import {StatusMessage} from '../../StatusMessage'

// derived from https://github.com/Microsoft/TypeScript-React-Starter#typescript-react-starter
// TODO: try https://www.npmjs.com/package/redux-actions
// TODO: figure out immutable approach too, maybe with immutable.js

export type GameAction
    = NewGame | QueueMove | PlaceCursor | DoMoves | CancelMove | SetPlayer

const INITIAL_PLAYERS = pickNPlayers(0)
export const INITIAL_BOARD_STATE: BoardState = {
    board: Board.constructRectangular(
        INITIAL_WIDTH,
        INITIAL_HEIGHT,
        INITIAL_PLAYERS,
        new RandomArranger(INITIAL_POP, INITIAL_PLAYERS),
    ),
    cursor: HexCoord.NONE,
    players: new PlayerManager(INITIAL_PLAYERS),
    curPlayer: INITIAL_PLAYERS[0],
    moves: EMPTY_MOVEMENT_QUEUE,
    messages: List([
        // new StatusMessage('foo', 'bar', 'baz'),
        // new StatusMessage('moo', 'mar', 'maz'),
        // new StatusMessage('zoo', 'zar', 'zaz'),
    ]), // empty
}

export const BoardReducer = (
    state: BoardState = INITIAL_BOARD_STATE, action: GameAction,
): BoardState => {
    if (isNewGame(action))
        state = newGameReducer(state, action)
    else if (isPlaceCursor(action))
        state = placeCursorReducer(state, action)
    else if (isQueueMove(action))
        state = queueMoveReducer(state, action)
    else if (isCancelMove(action))
        state = cancelMoveReducer(state, action)
    else if (isDoMoves(action))
        state = doMovesReducer(state)
    else if (isSetPlayer(action))
        state = setPlayerReducer(state, action)
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
const QUEUE_MOVE = 'QUEUE_MOVE'
type QUEUE_MOVE = typeof QUEUE_MOVE
interface QueueMove extends GenericAction {
    type: QUEUE_MOVE
    move: PlayerMove
}
const isQueueMove = (action: GameAction): action is QueueMove =>
    action.type === QUEUE_MOVE
export const queueMoveAction = (move: PlayerMove): QueueMove =>
    ({ type: QUEUE_MOVE, move: move })
const queueMoveReducer = (
    state: BoardState, action: QueueMove
): BoardState => {

    const newMessages: StatusMessage[] = []
    const queuedTo = state.moves
        .playerIsQueuedTo(action.move.player, action.move.source)
    const options = state.board.validateOptions(newMessages)
    options.ignoreSmallPop = true
    if (queuedTo) // if the player hopes to have already taken that spot, let them try
        options.ignoreSpotOwner = true
    const valid = state.board.validate(action.move, options)
    const updatedMessages = newMessages.length > 0
        ? state.messages.push(...newMessages)
        : state.messages

    if (valid) return {
        ...state,
        messages: updatedMessages,
        moves: state.moves.addMove(action.move),
    }
    // TODO assert state.messages !== updatedMessages
    else if (state.messages !== updatedMessages) return {
        ...state,
        messages: updatedMessages,
    }
    else
        return state // probably shouldn't happen -- always have a message instead?
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
    // console.log(`reducing moves ... ${movesAndQ}`)
    if (movesAndQ) { // undefined if no moves to apply
        const boardAndMessages = state.board.applyMoves(movesAndQ.moves)
        // console.log(`          ... ${boardAndMessages.messages}`)
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
const CANCEL_MOVE = 'CANCEL_MOVE'
type CANCEL_MOVE = typeof CANCEL_MOVE
interface CancelMove extends GenericAction {
    type: CANCEL_MOVE,
    player: Player,
}
const isCancelMove = (action: GameAction): action is CancelMove =>
    action.type === CANCEL_MOVE
export const cancelMoveAction = (player: Player): CancelMove => ({
    type: CANCEL_MOVE,
    player: player,
})
const cancelMoveReducer = (
    state: BoardState, action: CancelMove
): BoardState => {
    const newQueueAndCancelledMove = state.moves.cancelLastMove(action.player)
    if (newQueueAndCancelledMove) {
        const cancelledMove = newQueueAndCancelledMove.moves.get(0) as PlayerMove
        // Cancel cursor movement too if it looks like the current player just queued this move.
        const cursor = (
            state.curPlayer === cancelledMove.player
            && state.cursor === cancelledMove.dest
        )
            ? cancelledMove.source
            : state.cursor
        return {
            ...state,
            moves: newQueueAndCancelledMove.queue,
            cursor: cursor,
        }
    }
    else
        return state
}

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