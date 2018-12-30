import * as React from 'react'
import {List} from 'immutable'

import {BoardState} from '../model/BoardState'
import {HexBoardView} from './HexBoardView'
import {ColorPodge} from '../../../color/ColorPodge'
import CartPair from '../../../common/CartPair'
import {playerColors} from './LocalGameContainer'
import './Benchmark.css'
import {Board} from '../model/Board'
import {pickNPlayers, Player, PlayerManager} from '../model/players/Players'
import {StatusMessage} from '../../../common/StatusMessage'
import {Hex} from '../model/Hex'
import {MovementQueue} from '../model/MovementQueue'
import {BoardViewProps} from './BoardViewBase'
import {StupidRobot} from '../model/players/StupidRobot'
import {SpreadPlayersArranger} from '../model/PlayerArranger';
import {YMountainArranger} from '../model/YMountainArranger';

const NUM_PLAYERS = 10
const BOARD_WIDTH = 21
const BOARD_HEIGHT = 13
const PLAYERS = pickNPlayers(NUM_PLAYERS)

interface BenchmarkProps {
}

interface BenchmarkState {
    trials: List<BenchmarkRun>
    curStart: number | undefined
    curGame: BoardState | undefined
}

class BenchmarkRun {
    constructor(
        readonly startTime: number,
        readonly endTime: number,
        readonly boardState: BoardState,
    ) {}
}

const createColors = () => {
    let result = new ColorPodge()
    while (result.driftColors.size < NUM_PLAYERS)
        result = result.addRandomColor()
    const dispersions = [16, 11, 8, 5, 3, 2, 1, 1, 1]
    dispersions.forEach(x => result = result.disperse(x))
    return playerColors(result)
}

const assignRobots = (): PlayerManager => {
    let players = PlayerManager.construct(PLAYERS)
    PLAYERS.forEach(player => players = players.setRobot(player, new StupidRobot()))
    return players
}

const newBoardState = (
    w: number = BOARD_WIDTH,
    h: number = BOARD_HEIGHT,
    players: List<Player> = PLAYERS,
): BoardState => ({
    board: Board.constructRectangular(
        w, h, players, [
            new YMountainArranger(0, 2),
            new SpreadPlayersArranger(),
        ]
    ),
    turn: 0,
    cursor: Hex.NONE,
    moves: new MovementQueue(),
    players: assignRobots(),
    curPlayer: undefined,
    messages: List<StatusMessage>(),
})

// the parts of BoardViewProps that don't change — everything except boardState: BoardState
const staticBoardViewProps: BoardViewProps = {
    // static parts that don't change
    displaySize: new CartPair(1000, 700),
    colors: createColors(),

    /* tslint:disable */
    onEndGame: () => {},
    onCancelMoves: () => {},
    onQueueMoves: () => {},
    onPlaceCursor: () => {},
    /* tslint:enable */

    // replace this with an actual boardState
    boardState: newBoardState(1, 1)
}

const initialState: BenchmarkState = {
    curGame: undefined,
    curStart: undefined,
    trials: List<BenchmarkRun>(),
}

// TODO log somewhere — with browser, OS, date, etc
// TODO record software version
export class Benchmark extends React.Component<BenchmarkProps, BenchmarkState> {
    constructor(props: BenchmarkProps) {
        super(props)
        this.startGame = this.startGame.bind(this)
    }

    startGame() {
        this.setState({
            ...(this.state || initialState),
            curStart: Date.now(),
            curGame: newBoardState(),
        })
    }

    render(): React.ReactNode {
        if (this.state && this.state.curGame) {
            return (
                <div className="Benchmark">
                    <HexBoardView
                        {...staticBoardViewProps}
                        boardState={this.state.curGame}
                    />
                </div>
            )
        }
        else return (
            <div className="Benchmark">
                <button onClick={this.startGame}>
                    Run
                </button>
            </div>
        )
    }
}