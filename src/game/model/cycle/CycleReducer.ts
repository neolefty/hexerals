///<reference path="../../../common/Analytics.ts"/>
import {List} from 'immutable'
import * as assert from 'assert'

import {StatusMessage} from '../../../common/StatusMessage';
import {GenericAction} from '../../../common/GenericAction'
import {AnalyticsAction, AnalyticsCategory, AnalyticsLabel, logAnalyticsEvent} from '../../../common/Analytics';
import {countHexes} from '../../view/board/HexConstants'
import {Board} from '../board/Board'
import {GameAction, BoardReducer, isGameAction} from '../board/BoardReducer'
import {BOARD_STATE_STARTER} from '../board/BoardState'
import {PlayerFogs} from '../board/Fog'
import {Terrain} from '../hex/Terrain'
import {pickNPlayers, Player, PlayerManager} from '../players/Players'
import {BasicRobot} from '../players/BasicRobot'
import {SpreadPlayersArranger} from '../setup/SpreadPlayerArranger'
import {RandomTerrainArranger} from '../setup/RandomTerrainArranger'
import {CornersPlayerArranger} from '../setup/PlayerArranger'
import {LocalGameOptions} from './LocalGameOptions'
import {CycleState, CycleMode} from './CycleState'

// the meta-game
export const INITIAL_CYCLE_STATE: CycleState = {
    mode: CycleMode.NOT_IN_GAME,
    localOptions: {
        numRobots: 5,
        boardWidth: 7,
        boardHeight: 21,
        difficulty: 2,
        mountainPercent: 25,
        tickMillis: 500,
        startingPop: 0,
        // booleans — non-zero is true
        fog: 1,
        capitals: 1,
        statsVisible: 0, // 1,
        randomStart: 1,
        // meta — what options are visible
        levelVisible: 0,
    },
    localGame: undefined,
}

export type CycleAction = GameAction
    | OpenLocalGame | CloseLocalGame
    | ChangeLocalOption

export const CycleReducer = (
    state: CycleState = INITIAL_CYCLE_STATE, action: GenericAction,
): CycleState => {
    if (!isCycleAction(action))
        return state
    else {
        // CycleActions that are not GameActions
        if (isOpenLocalGame(action))
            return openLocalGameReducer(state, action)
        else if (isCloseLocalGame(action))
            return closeLocalGameReducer(state, action)
        else if (isChangeLocalOption(action))
            return changeLocalOptionReducer(state, action)
        else { // must be a GameAction, by process of elimination
            const localGame = state.localGame
            if (localGame === undefined) {
                console.error(action)
                return state
            }
            else {
                const localBoard = localGame.boardState
                const newLocalBoard = BoardReducer(localBoard, action)
                if (newLocalBoard === localBoard)
                    return state
                else {
                    return {
                        ...state,
                        localGame: {
                            ...localGame,
                            boardState: newLocalBoard,
                        }
                    }
                }
            }
        }
    }
}

const isCycleAction = (action: GenericAction): action is CycleAction =>
    isGameAction(action)
    || isOpenLocalGame(action) || isCloseLocalGame(action)
    || isChangeLocalOption(action)

const OPEN_LOCAL_GAME = 'OPEN_LOCAL_GAME'
type OPEN_LOCAL_GAME = typeof OPEN_LOCAL_GAME
interface OpenLocalGame extends GenericAction { type: OPEN_LOCAL_GAME }
const isOpenLocalGame = (action: GenericAction): action is OpenLocalGame =>
    action.type === OPEN_LOCAL_GAME
export const openLocalGameAction = (): OpenLocalGame =>
    ({ type: OPEN_LOCAL_GAME })
// noinspection JSUnusedLocalSymbols
const openLocalGameReducer =
    (state: CycleState, action: OpenLocalGame): CycleState =>
{
    const opts = state.localOptions
    const players = pickNPlayers(opts.numRobots + 1)
    const mountainFrequency = opts.mountainPercent / 100
    const messages: StatusMessage[] = []
    const capitalTerrain = opts.capitals === 0 ? Terrain.City : Terrain.Capital
    const arranger = opts.randomStart
        ? new SpreadPlayersArranger(capitalTerrain, opts.startingPop)
        : new CornersPlayerArranger(opts.startingPop, capitalTerrain)
    const newBoard = Board.constructRectangular(
        opts.boardWidth,
        opts.boardHeight,
        players,
        [
            arranger,
            new RandomTerrainArranger(mountainFrequency),
        ],
        messages,
    )
    // assign AI to all non-humans
    let pm: PlayerManager = PlayerManager.construct(players)
    players.forEach((player: Player) => {
        if (player !== Player.Zero) // human
            pm = pm.setRobot(
                player,
                BasicRobot.byIntelligence(opts.difficulty)
            )
    })
    // TODO log local game options better — can we send general tags?
    logAnalyticsEvent(
        AnalyticsAction.start, AnalyticsCategory.local, undefined, undefined, {
            robots: opts.numRobots,
            difficulty: opts.difficulty,
            w: opts.boardWidth,
            h: opts.boardHeight,
            n: countHexes(opts.boardWidth, opts.boardHeight),
        }
    )
    return {
        ...state,
        mode: CycleMode.IN_LOCAL_GAME,
        localGame: {
            fogs: new PlayerFogs(true),
            boardState: {
                ...BOARD_STATE_STARTER,
                board: newBoard,
                players: pm,
                messages: List(messages),
                curPlayer: Player.Zero,
            }
        },
    }
}

const CLOSE_LOCAL_GAME = 'CLOSE_LOCAL_GAME'
type CLOSE_LOCAL_GAME = typeof CLOSE_LOCAL_GAME
interface CloseLocalGame extends GenericAction { type: CLOSE_LOCAL_GAME }
const isCloseLocalGame = (action: GenericAction): action is CloseLocalGame =>
    action.type === CLOSE_LOCAL_GAME
export const closeLocalGameAction = (): CloseLocalGame => ({ type: CLOSE_LOCAL_GAME })
// noinspection JSUnusedLocalSymbols
const closeLocalGameReducer =
    (state: CycleState, action: CloseLocalGame): CycleState => {
        logAnalyticsEvent(
            AnalyticsAction.end, AnalyticsCategory.local, AnalyticsLabel.quit, undefined,
            state.localOptions,
        )
        return {
            ...state,
            mode: CycleMode.NOT_IN_GAME,
            localGame: undefined,
        }
    }
const CHANGE_LOCAL_OPTION = 'CHANGE_LOCAL_OPTION'
type CHANGE_LOCAL_OPTION = typeof CHANGE_LOCAL_OPTION
interface ChangeLocalOption extends GenericAction {
    type: CHANGE_LOCAL_OPTION
    name: keyof LocalGameOptions
    n: number  // TODO update string field
}
const isChangeLocalOption = (action: GenericAction): action is ChangeLocalOption =>
    action.type === CHANGE_LOCAL_OPTION
// TODO split into changeLocalOptionNumberAction and changeLocalOptionStringAction if necessary
export const changeLocalOptionAction = (
    name: keyof LocalGameOptions, n: number
): ChangeLocalOption => ({
    type: CHANGE_LOCAL_OPTION,
    name: name,
    n: n,
})
const changeLocalOptionReducer = (
    state: CycleState, action: ChangeLocalOption
): CycleState => {
    if (state.localOptions[action.name] === action.n)
        return state

    const result = {...state.localOptions}
    assert.ok(result.hasOwnProperty(action.name))
    assert.strictEqual(typeof result[action.name], 'number')
    result[action.name] = action.n
    return {
        ...state,
        localOptions: result,
    }
}
