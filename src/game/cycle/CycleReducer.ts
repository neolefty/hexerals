import {List} from 'immutable'
import * as assert from 'assert';
import {isNumber} from 'util';

import {CycleMode} from './CycleState'
import {Board} from '../board/model/Board'
import {GenericAction} from '../../common/App'
import {HexCoord} from '../board/model/HexCoord'
import {GameAction, BoardReducer} from '../board/model/BoardReducer'
import {CycleState} from './CycleState'
import {EMPTY_MOVEMENT_QUEUE} from '../board/model/MovementQueue'
import {pickNPlayers, Player, PlayerManager} from '../players/Players'
import {RandomPlayerArranger} from '../board/model/PlayerArranger'
import {StupidRobot} from '../players/StupidRobot'
import {StatusMessage} from '../../common/StatusMessage';
import {TerrainArranger} from '../board/model/TerrainArranger';

// the meta-game

export const INITIAL_CYCLE_STATE: CycleState = {
    mode: CycleMode.NOT_IN_GAME,
    localOptions: {
        numPlayers: 6,
        tickMillis: 500,
        boardWidth: 11,
        boardHeight: 7,
        mountainPercent: 10,
    },
    localGame: undefined,
}

export type CycleAction = GameAction
    | OpenLocalGame | CloseGame
    | ChangeLocalOption

// TODO write CycleReducerTester like BoardReducerTester
// it('messages show up in game state', () => {
//     const crt: CycleReducerTester = new CycleReducerTester(1,1)
//     expect(crt.messages.size).toBe(1)
//     expect(crt.messages.get(0).tag === MAP_TOO_SMALL)
// })

export const CycleReducer =
    (state: CycleState = INITIAL_CYCLE_STATE, action: CycleAction): CycleState =>
{
    if (isOpenLocalGame(action))
        return openLocalGameReducer(state, action)
    else if (isCloseGame(action))
        return closeGameReducer(state, action)
    else if (isChangeLocalOption(action))
        return changeLocalOptionReducer(state, action)
    else { // must be a GameAction, by process of elimination
        const newLocalGame = BoardReducer(state.localGame, action)
        if (newLocalGame === state.localGame)
            return state
        else return {
            ...state,
            localGame: newLocalGame,
        }
    }
}

const OPEN_LOCAL_GAME = 'OPEN_LOCAL_GAME'
type OPEN_LOCAL_GAME = typeof OPEN_LOCAL_GAME
interface OpenLocalGame extends GenericAction { type: OPEN_LOCAL_GAME }
const isOpenLocalGame = (action: CycleAction): action is OpenLocalGame =>
    action.type === OPEN_LOCAL_GAME
export const openLocalGameAction = (): OpenLocalGame =>
    ({ type: OPEN_LOCAL_GAME })
// noinspection JSUnusedLocalSymbols
const openLocalGameReducer =
    (state: CycleState, action: OpenLocalGame): CycleState =>
{
    const players = pickNPlayers(state.localOptions.numPlayers)
    const mountainFrequency = state.localOptions.mountainPercent / 100
    const messages: StatusMessage[] = []
    const newBoard = Board.constructRectangular(
        state.localOptions.boardWidth,
        state.localOptions.boardHeight,
        players,
        [
            new RandomPlayerArranger(),
            new TerrainArranger(mountainFrequency),
        ],
        messages,
    )
    // assign stupid AI to all non-humans
    let pm: PlayerManager = PlayerManager.construct(players)
    const stupid = new StupidRobot()
    players.forEach((player: Player) => {
        if (player !== Player.Zero) // human
            pm = pm.setRobot(player, stupid)
    })
    return {
        ...state,
        mode: CycleMode.IN_LOCAL_GAME,
        localGame: {
            board: newBoard,
            turn: 0,
            players: pm,
            cursor: HexCoord.NONE,
            moves: EMPTY_MOVEMENT_QUEUE,
            messages: List(messages),
            curPlayer: Player.Zero,
        },
    }
}

const CLOSE_GAME = 'CLOSE_GAME'
type CLOSE_GAME = typeof CLOSE_GAME
interface CloseGame extends GenericAction { type: CLOSE_GAME }
const isCloseGame = (action: CycleAction): action is CloseGame =>
    action.type === CLOSE_GAME
export const closeGameAction = (): CloseGame => ({ type: CLOSE_GAME })
// noinspection JSUnusedLocalSymbols
const closeGameReducer =
    (state: CycleState, action: CloseGame): CycleState => ({
        ...state,
        mode: CycleMode.NOT_IN_GAME,
        localGame: undefined,
    })

const CHANGE_LOCAL_OPTION = 'CHANGE_LOCAL_OPTION'
type CHANGE_LOCAL_OPTION = typeof CHANGE_LOCAL_OPTION
interface ChangeLocalOption extends GenericAction {
    type: CHANGE_LOCAL_OPTION
    name: string
    n: number  // TODO add string field
}
const isChangeLocalOption = (action: CycleAction): action is ChangeLocalOption =>
    action.type === CHANGE_LOCAL_OPTION
// TODO split into changeLocalOptionNumberAction and changeLocalOptionStringAction if necessary
export const changeLocalOptionAction = (
    name: string, n: number
): ChangeLocalOption => ({
    type: CHANGE_LOCAL_OPTION,
    name: name,
    n: n,
})
const changeLocalOptionReducer = (
    state: CycleState, action: ChangeLocalOption
): CycleState => {
    const result = {...state.localOptions}
    assert(result.hasOwnProperty(action.name))
    assert(isNumber(result[action.name]))
    result[action.name] = action.n
    return {
        ...state,
        localOptions: result,
    }
}
