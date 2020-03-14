import {BoardState, boardStateToString} from '../board/BoardState'
import {PlayerFogs} from '../board/Fog'
import {DEFAULT_LOCAL_GAME_OPTIONS, LocalGameOptions} from '../board/LocalGameOptions'
import {restoreLocalGameOptions} from "../board/peristLocalGameOptions"

export enum CycleMode {
    IN_LOCAL_GAME = 'in local game',
    NOT_IN_GAME = 'not in game',
}

export interface CycleState {
    mode: CycleMode;
    localOptions: LocalGameOptions;
    localGame?: LocalGameState;
}

export interface LocalGameState {
    fogs: PlayerFogs
    boardState: BoardState
}

export const initialCycleState = (): CycleState => restoreCycleState()

// the meta-game
export const DEFAULT_CYCLE_STATE: CycleState = {
    mode: CycleMode.NOT_IN_GAME,
    localOptions: DEFAULT_LOCAL_GAME_OPTIONS,
    localGame: undefined,
}

const restoreCycleState = (): CycleState => {
    return {
        ...DEFAULT_CYCLE_STATE,
        localOptions: {
            ...DEFAULT_LOCAL_GAME_OPTIONS,
            ...restoreLocalGameOptions(),
        }
    }
}

export const cycleStateToString = (s: CycleState): string =>
    ''
    + `mode: ${s.mode}\n`
    + `localOptions: ${JSON.stringify(s.localOptions)}\n`
    + `localGame.boardState: ${
            s.localGame
                ? boardStateToString(s.localGame.boardState)
                : 'undefined'
        }`
    + `${s.localGame ? `stats: ${s.localGame.boardState.stats.toString()}` : ''}`
