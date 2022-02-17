import {List, Map, Range} from 'immutable'
import {devAssert} from "../../../common/Environment"
import {Robot} from './Robot'

export enum Player {
    Nobody = 'Nobody',
    Zero = 'Zero', One = 'One', Two = 'Two', Three = 'Three',
    Four = 'Four', Five = 'Five', Six = 'Six', Seven = 'Seven',
    Eight = 'Eight', Nine = 'Nine', Ten = 'Ten', Eleven = 'Eleven',
    Twelve = 'Twelve', Thirteen = 'Thirteen', Fourteen = 'Fourteen',
    Fifteen = 'Fifteen',
}

export const PLAYERS: Map<number, Player> = Map([
    [-1, Player.Nobody],
    [0, Player.Zero], [1, Player.One], [2, Player.Two], [3, Player.Three],
    [4, Player.Four], [5, Player.Five], [6, Player.Six], [7, Player.Seven],
    [8, Player.Eight], [9, Player.Nine], [10, Player.Ten], [11, Player.Eleven],
    [12, Player.Twelve], [13, Player.Thirteen], [14, Player.Fourteen],
    [15, Player.Fifteen],
])

export const MAX_PLAYERS = PLAYERS.size - 1

export const pickNPlayers = (n: number): List<Player> => {
    const result: List<Player> = List()
    return result.withMutations(m => {
        Range(0, Math.min(n, PLAYERS.size)).forEach(i => {
            const player = PLAYERS.get(i) as Player
            devAssert(player !== undefined)
            m.push(player)
        })
    })
}

export class PlayerManager {
    static construct(players: List<Player>) {
        const pi: Map<Player, number> = Map()
        const pr: Map<Player, Robot> = Map()
        return new PlayerManager(
            pi.withMutations(m =>
                players.forEach((p, i) => m.set(p, i))
            ),
            pr
        )
    }

    private constructor(
        readonly playerIndexes: Map<Player, number>,
        readonly playerRobots: Map<Player, Robot>,
    ) {}

    get size(): number {
        // some kind of weird bug is causing this to be necessary ...
        return this.playerIndexes ? this.playerIndexes.size : NaN
    }

    isRobot(player: Player): boolean {
        return this.playerRobots.has(player)
    }

    setRobot(player: Player, robot: Robot | undefined): PlayerManager {
        return robot
            ? new PlayerManager(
                this.playerIndexes,
                this.playerRobots.set(player, robot),
            )
            : new PlayerManager(
                this.playerIndexes,
                this.playerRobots.delete(player),
            )
    }

    toString(): string {
        return JSON.stringify(this.playerIndexes.toJSON())
            + (this.playerRobots.size > 0 ? ` — ${
                JSON.stringify(this.playerRobots.toJSON())
            }` : '')
    }
}
