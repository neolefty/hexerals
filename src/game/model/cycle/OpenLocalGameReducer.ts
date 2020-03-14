import {List} from "immutable"
import {AnalyticsAction, AnalyticsCategory, logAnalyticsEvent} from "../../../common/Analytics"
import {StatusMessage} from "../../../common/StatusMessage"
import {countHexes} from "../../view/hex/HexConstants"
import {Board} from "../board/Board"
import {BOARD_STATE_STARTER, BoardState} from "../board/BoardState"
import {PlayerFogs} from "../board/Fog"
import {Terrain} from "../hex/Terrain"
import {BasicRobot} from "../players/BasicRobot"
import {pickNPlayers, Player, PlayerManager} from "../players/Players"
import {CornersPlayerArranger} from "../setup/PlayerArranger"
import {RandomTerrainArranger} from "../setup/RandomTerrainArranger"
import {SpreadPlayersArranger} from "../setup/SpreadPlayerArranger"
import {OpenLocalGameAction} from "./CycleAction"
// noinspection JSUnusedLocalSymbols
import {CycleMode, CycleState} from "./CycleState"

export const OpenLocalGameReducer =
    (state: CycleState, action: OpenLocalGameAction): CycleState => {
        const opts = state.localOptions
        const players = pickNPlayers(opts.numRobots + 1)
        const mountainFrequency = opts.mountainPercent / 100
        const messages: StatusMessage[] = []
        const capitalTerrain = opts.capitals === 0 ? Terrain.City : Terrain.Capital
        const arranger = opts.randomStart
            ? new SpreadPlayersArranger(capitalTerrain, opts.startingPop)
            : new CornersPlayerArranger(opts.startingPop, capitalTerrain)
        const newBoard = Board.constructRectangular(
            opts,
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
        const boardState: BoardState = {
            ...BOARD_STATE_STARTER,
            board: newBoard,
            players: pm,
            messages: List(messages),
            curPlayer: Player.Zero,
        }
        // initialize history with zeroes
        boardState.stats = boardState.stats.update(boardState)

        return Object.freeze({
            ...state,
            mode: CycleMode.IN_LOCAL_GAME,
            localGame: Object.freeze({
                fogs: new PlayerFogs(true),
                boardState: Object.freeze(boardState)
            }),
        })
    }
