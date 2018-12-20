import {List, Map} from 'immutable'
import {Robot} from './Robot'

export enum Player {
    Nobody = 'Nobody',
    Zero = 'Zero',
    One = 'One',
    Two = 'Two',
    Three = 'Three',
    Four = 'Four',
    Five = 'Five',
    Six = 'Six',
    Seven = 'Seven',
    Eight = 'Eight',
    Nine = 'Nine',
    Ten = 'Ten',
}

export const PLAYERS: Map<number, Player> = Map([
    [-1, Player.Nobody],
    [0, Player.Zero],
    [1, Player.One],
    [2, Player.Two],
    [3, Player.Three],
    [4, Player.Four],
    [5, Player.Five],
    [6, Player.Six],
    [7, Player.Seven],
    [8, Player.Eight],
    [9, Player.Nine],
    [10, Player.Ten],
])

export const pickNPlayers = (n: number): List<Player> => {
    const result: List<Player> = List()
    return result.withMutations(m => {
        for (let i = 0; i < n; ++i)
            m.push(PLAYERS.get(i))
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

    setRobot(player: Player, robot: Robot): PlayerManager {
        return new PlayerManager(
            this.playerIndexes,
            this.playerRobots.set(player, robot),
        )
    }
}