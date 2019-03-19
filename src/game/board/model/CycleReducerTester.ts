import {createStore, Store} from 'redux';
import {List} from 'immutable';

import {CycleState, LocalGameState} from './CycleState';
import {changeLocalOptionAction, CycleReducer, openLocalGameAction} from './CycleReducer';
import {pickNPlayers, Player} from './players/Players';
import {Hex} from './Hex';
import {newGameAction, queueMovesAction} from './BoardReducer';
import {PlayerMove} from './Move';
import {BoardState} from './BoardState';
import {BoardReducerTester} from './BoardReducerTester';
import {Board} from './Board';
import {CornersPlayerArranger} from './PlayerArranger';
import {Arranger} from './Arranger';

export class CycleReducerTester {
    readonly store: Store<CycleState>
    constructor() {
        this.store = createStore(CycleReducer)
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

    queueMove = (player: Player = Player.Zero, delta: Hex = Hex.UP) => {
        this.store.dispatch(queueMovesAction(List([
            PlayerMove.constructDelta(player, this.cursor, delta, 0)
        ])))
    }

    openLocalGame = (
        width = BoardReducerTester.INITIAL_WIDTH,
        height = BoardReducerTester.INITIAL_HEIGHT,
        numRobots = 1,
        difficulty = 0,
        mountainPercent = 0,
    ) => {
        this.store.dispatch(changeLocalOptionAction('boardWidth', width))
        this.store.dispatch(changeLocalOptionAction('boardHeight', height))
        this.store.dispatch(changeLocalOptionAction('numRobots', numRobots))
        this.store.dispatch(changeLocalOptionAction('difficulty', difficulty))
        this.store.dispatch(changeLocalOptionAction('mountainPercent', mountainPercent))
        this.store.dispatch(openLocalGameAction())
    }
}