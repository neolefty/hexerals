// the meta-game
import {CycleMode} from './CycleState';
import {Board, RandomArranger} from '../game/Board';
import {INITIAL_DIMENSION} from '../game/BoardConstants';
import {GenericAction} from '../App';
import {HexCoord} from '../game/Hex';
import {GameAction, BoardReducer} from '../game/BoardReducer';
import {CycleState} from './CycleState';
import {EMPTY_MOVEMENT_QUEUE} from '../game/MovementQueue';
import {pickNPlayers, PlayerManager} from '../game/Players';
import {List} from 'immutable';

export const INITIAL_CYCLE_STATE: CycleState = {
    mode: CycleMode.NOT_IN_GAME,
    localOptions: {
        numPlayers: 4,
        boardSize: INITIAL_DIMENSION,
    },
    localGame: undefined,
};

export type CycleAction = GameAction | OpenLocalGame | CloseGame | ChangeNumPlayers;

export const CycleReducer =
    (state: CycleState = INITIAL_CYCLE_STATE, action: CycleAction): CycleState =>
{
    if (isOpenLocalGame(action))
        state = openLocalGameReducer(state, action);
    else if (isCloseGame(action))
        state = closeGameReducer(state, action);
    else if (isChangeNumPlayers(action))
        state = changeNumPlayersReducer(state, action);
    else
        state.localGame = (BoardReducer(state.localGame, action));
    return state;
};

const OPEN_LOCAL_GAME = 'OPEN_LOCAL_GAME';
type OPEN_LOCAL_GAME = typeof OPEN_LOCAL_GAME;
interface OpenLocalGame extends GenericAction { type: OPEN_LOCAL_GAME; }
const isOpenLocalGame = (action: CycleAction): action is OpenLocalGame =>
    action.type === OPEN_LOCAL_GAME;
export const openLocalGameAction = (): OpenLocalGame => ({ type: OPEN_LOCAL_GAME });
const openLocalGameReducer =
    (state: CycleState, action: OpenLocalGame): CycleState =>
{
    const [w, h] = state.localOptions.boardSize.wh;
    const players = pickNPlayers(state.localOptions.numPlayers);
    const newBoard = Board.constructRectangular(
        w, h, players, RandomArranger.construct(players),
    );
    return {
        ...state,
        mode: CycleMode.IN_LOCAL_GAME,
        localGame: {
            board: newBoard,
            players: new PlayerManager(players),
            cursor: HexCoord.NONE,
            moves: EMPTY_MOVEMENT_QUEUE,
            messages: List(),
        },
    };
};

const CLOSE_GAME = 'CLOSE_GAME';
type CLOSE_GAME = typeof CLOSE_GAME;
interface CloseGame extends GenericAction { type: CLOSE_GAME; }
const isCloseGame = (action: CycleAction): action is CloseGame =>
    action.type === CLOSE_GAME;
export const closeGameAction = (): CloseGame => ({ type: CLOSE_GAME });
const closeGameReducer =
    (state: CycleState, action: CloseGame): CycleState => ({
        ...state,
        mode: CycleMode.NOT_IN_GAME,
        localGame: undefined,
    });

const CHANGE_NUM_PLAYERS = 'CHANGE_NUM_PLAYERS';
type CHANGE_NUM_PLAYERS = typeof CHANGE_NUM_PLAYERS;
interface ChangeNumPlayers extends GenericAction {
    type: CHANGE_NUM_PLAYERS;
    numPlayers: number;
}
const isChangeNumPlayers = (action: CycleAction): action is ChangeNumPlayers =>
    action.type === CHANGE_NUM_PLAYERS;
export const changeNumPlayersAction = (n: number): ChangeNumPlayers => ({
    type: CHANGE_NUM_PLAYERS,
    numPlayers: n,
});
const changeNumPlayersReducer =
    (state: CycleState, action: ChangeNumPlayers): CycleState => ({
        ...state,
        localOptions: {
            ...state.localOptions,
            numPlayers: action.numPlayers,
        }
    });