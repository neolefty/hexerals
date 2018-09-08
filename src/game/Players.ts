import {List, Map} from 'immutable';

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
]);

export const pickNPlayers = (n: number): List<Player> => {
    const result: List<Player> = List();
    return result.withMutations(m => {
        for (let i = 0; i < n; ++i)
            m.push(PLAYERS.get(i));
    });
};

function reverseMap<K, V>(map: Map<K, V>): Map<V, K> {
    let result: Map<V, K> = Map();
    result = result.asMutable();
    map.forEach((v: V, k: K) => result.set(v, k));
    return result.asImmutable();
}

export const PLAYER_INDEXES: Map<Player, number> = reverseMap(PLAYERS);
export const PLAYABLE_PLAYERS = [
    Player.Zero, Player.One, Player.Two, Player.Three, Player.Four];

export class PlayerManager {
    readonly playerIndexes: Map<Player, number>;

    constructor(
        readonly players: List<Player>
    ) {
        const pi: Map<Player, number> = Map();
        this.playerIndexes = pi.withMutations(m =>
            players.forEach((p, i) => m.set(p, i))
        );
    }

    public getPlayer(playerIndex: number): Player | undefined {
        return this.players.get(playerIndex);
    }

    public getIndex(player: Player): number | undefined {
        return this.playerIndexes.get(player);
    }
}