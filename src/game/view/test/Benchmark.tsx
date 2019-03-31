import * as React from 'react'
import {List} from 'immutable'

import {BOARD_STATE_STARTER, BoardState} from '../../model/board/BoardState'
import {HexBoardView} from '../board/HexBoardView'
import {ColorPodge} from '../../../color/ColorPodge'
import {CartPair} from '../../../common/CartPair'
import {playerColors} from '../cycle/LocalGameContainer'
import './Benchmark.css'
import {Board} from '../../model/board/Board'
import {pickNPlayers, Player, PlayerManager} from '../../model/players/Players'
import {BOARD_STUBS, BoardViewProps} from '../board/BoardViewBase'
import {BasicRobot} from '../../model/players/BasicRobot'
import {SpreadPlayersArranger} from '../../model/setup/SpreadPlayerArranger'
import {YMountainArranger} from '../../model/setup/YMountainArranger'

const NUM_PLAYERS = 10
const BOARD_WIDTH = 21
const BOARD_HEIGHT = 25
const PLAYERS = pickNPlayers(NUM_PLAYERS)

interface BenchmarkProps {
    displaySize: CartPair
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

const assignRobots = (): PlayerManager => {
    let players = PlayerManager.construct(PLAYERS)
    PLAYERS.forEach(player =>
        players = players.setRobot(
            player,
            BasicRobot.bySkill(BasicRobot.SKILL_STOP_PARTWAY)))
    return players
}

const newBoardState = (
    w: number = BOARD_WIDTH,
    h: number = BOARD_HEIGHT,
    players: List<Player> = PLAYERS,
): BoardState => ({
    ...BOARD_STATE_STARTER,
    board: Board.constructRectangular(
        w, h, players, [
            new YMountainArranger(0, 2),
            new SpreadPlayersArranger(),
        ]
    ),
    players: assignRobots(),
})

// the parts of BoardViewProps that don't change — everything except boardState: BoardState
const staticBoardViewProps: BoardViewProps = {
    ...BOARD_STUBS,

    // static parts that don't change
    displaySize: new CartPair(1000, 700),
    colors: playerColors(ColorPodge.construct(NUM_PLAYERS)),

    // this gets replaced Run is clicked
    boardState: newBoardState(1, 1)
}

const initialState: BenchmarkState = {
    curGame: undefined,
    curStart: undefined,
    trials: List<BenchmarkRun>(),
}

// TODO log somewhere — with browser, OS, date, etc
// TODO record software version
export class Benchmark
    extends React.Component<BenchmarkProps, BenchmarkState>
{
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
        return (
            <div
                className="Row"
                style={{height: this.props.displaySize.y}}
            >{
                this.state && this.state.curGame
                    ? (
                        <HexBoardView
                            {...staticBoardViewProps}
                            boardState={this.state.curGame}
                        />
                    )
                    : (
                        <button onClick={this.startGame}>
                            Run
                        </button>
                    )
            }
            </div>
        )
    }
}