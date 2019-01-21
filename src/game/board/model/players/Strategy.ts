import {List, Map, Set} from 'immutable';

import {Board} from '../Board'
import {Player} from './Players'
import {HexMove} from '../Move'
import {Tile} from '../Tile'
import {Hex} from '../Hex'
import {Terrain} from '../Terrain'

export interface MoveVote {
    sentiment: number
    move: HexMove
    expectedPop: number  // expected population in the source tile
}

export const makeVote = (
    move: HexMove,
    expectedPop: number = 1,
    sentiment: number = 1,
): MoveVote => ({
    sentiment: sentiment,
    move: move,
    expectedPop: expectedPop,
})

// all must be for the same player
export const makeVotes = (
    board: Board, moves: List<HexMove> | undefined
): List<MoveVote> => {
    if (!moves || moves.size === 0)
        return List<MoveVote>()

    let prevMove: HexMove | undefined = undefined
    let prevPop: number = 0
    return moves.map(move => {
        let pop = board.getTile(move.source).pop
        if (prevMove && prevMove.dest === move.source)
            pop += prevPop
        return makeVote(move, pop)
    }) as List<MoveVote>
}

// values in equivalent population
const VALUE_EMPTY = 5
const VALUE_CAPITAL = 1000
const VALUE_CITY = 125
const VALUE_CONSOLIDATE = 0.02  // per pop

const EXPANSIONS = 10
const CONSOLIDATIONS = 5

const TERRAIN_VALUES = Map<Terrain, number>([
    [Terrain.Capital, VALUE_CAPITAL],
    [Terrain.City, VALUE_CITY],
    [Terrain.CapturedCapital, VALUE_CITY],
    [Terrain.Empty, VALUE_EMPTY],
])

export enum StrategyType {
    Canceller = 'Canceller', // run every time — watch out for problems
    Planner = 'Planner', // run when we need something to do
    // Opportunist = 'Opportunist', // just a high-priority planner
}

export interface Strategy {
    name: string
    type: StrategyType
    suggest: (
        player: Player,
        board: Board,
        votes: List<MoveVote>,
    ) => List<MoveVote>
}

// TODO consolidate these as cancel-next-move voters?
export class WasteNot implements Strategy {
    name: "wastes not"
    type: StrategyType.Canceller
    suggest(
        player: Player, board: Board, votes: List<MoveVote>
    ): List<MoveVote> {
        for (let i = 0; i < votes.size; ++i) {
            const vote = votes.get(i)
            const dest = board.getTile(vote.move.dest)
            if (player !== dest.owner && vote.expectedPop <= dest.pop + 1)
                return votes.slice(0, i) as List<MoveVote>
        }
        return votes
    }
}

export class StopByCities implements Strategy {
    name: "stops by cities"
    type: StrategyType.Canceller
    suggest(
        player: Player, board: Board, votes: List<MoveVote>
    ): List<MoveVote> {
        for (let i = 0; i < votes.size; ++i) {
            let cancel = false
            const vote = votes.get(i)
            board.forNeighborsOccupiable(
                vote.move.source, (neighbor: Hex, tile: Tile) => {
                    cancel = cancel || (tile.owner !== player && tile.growsFast)
                }
            )
            if (cancel)
                return votes.slice(0, i) as List<MoveVote>
        }
        return votes
    }
}

export class CaptureCities implements Strategy {
    name: "captures cities"
    type: StrategyType.Planner
    suggest(
        player: Player, board: Board, votes: List<MoveVote>
    ): List<MoveVote> {
        board.filterTiles(
            tile => tile.owner === player
        ).forEach(source => {
            const myTile = board.getTile(source)
            board.forNeighborsOccupiable(
                source, (dest, destTile) => {
                    if (
                        destTile.owner !== player
                        && destTile.growsFast
                        && myTile.pop - 1 > destTile.pop
                    ) {
                        const terrainValue = TERRAIN_VALUES.get(destTile.terrain)
                        const sentiment = Math.max(
                            // If the loss is greater than the nominal value of the tile, it's still worth something, and if you have to choose, pick the cheaper capture.
                            terrainValue / destTile.pop,
                             terrainValue - destTile.pop
                        )
                        votes = votes.push(makeVote(
                            HexMove.constructDest(source, dest),
                            myTile.pop,
                            sentiment,
                        ))
                    }
                }
            )
        })
        return votes
    }
}

export const sortBySentiment = (a: MoveVote, b: MoveVote) =>
    b.sentiment - a.sentiment
export const keepNVotes = (votes: MoveVote[], n: number): MoveVote[] => {
    if (votes.length > n) {
        votes.sort(sortBySentiment)
        return votes.slice(0, n)
    }
    return votes
}

// TODO combine Expand & CaptureCities
export class Expand implements Strategy {
    name: "expands"
    type: StrategyType.Planner
    suggest(
        player: Player, board: Board, votes: List<MoveVote>
    ): List<MoveVote> {
        let candidates = [] as MoveVote[]
        board.filterTiles(
            tile => tile.owner === player
        ).forEach(myHex => {
            const myTile = board.getTile(myHex)
            board.forNeighborsOccupiable(myHex, (neighborHex, neighborTile) => {
                // is it an "empty" hex (no interesting terrain) that we can capture?
                if (
                    neighborTile.terrain === Terrain.Empty
                    && neighborTile.owner !== player
                    && neighborTile.pop < myTile.pop - 1
                ) {
                    const sentiment = VALUE_EMPTY - neighborTile.pop
                    if (sentiment > 0)
                    // TODO consider using ts-priority-queue once packages are updated
                        candidates.push(makeVote(
                            HexMove.constructDest(myHex, neighborHex),
                            myTile.pop,
                            sentiment,
                        ))
                }
            })
        })
        return votes.push(... keepNVotes(candidates, EXPANSIONS))
    }
}

export class Consolidate implements Strategy {
    name: "consolidates"
    type: StrategyType.Planner
    suggest(
        player: Player, board: Board, votes: List<MoveVote>
    ): List<MoveVote> {
        let tooSmall = 1
        let candidates = [] as MoveVote[]
        // Rank consolidation moves.
        board.filterTiles(
            tile => tile.owner === player
        ).forEach(hexA => {
            const tileA = board.getTile(hexA)
            if (tileA.pop > tooSmall) {
                board.forNeighborsOccupiable(hexA, (hexB, tileB) => {
                    if (tileB.owner === player && tileB.pop > tooSmall)
                        candidates.push(makeVote(
                            HexMove.constructDest(hexA, hexB),
                            tileA.pop,
                            Math.min(tileA.pop, tileB.pop) * VALUE_CONSOLIDATE,
                        ))
                    // efficiency hack: periodically trim and recalibrate
                    if (candidates.length > CONSOLIDATIONS * 2) {
                        candidates = keepNVotes(candidates, CONSOLIDATIONS)
                        tooSmall = candidates[candidates.length - 1].sentiment / VALUE_CONSOLIDATE
                    }
                })
            }
        })
        return votes.push(... keepNVotes(candidates, CONSOLIDATIONS))
    }
}

// remove votes for moves that have a source that was moved earlier
export const distillVotes = (
    votes: List<MoveVote>
): List<MoveVote> => {
    const sources = Set<Hex>().asMutable()
    const result = [] as MoveVote[]
    votes.forEach(vote => {
        if (!sources.has(vote.move.source)) {
            result.push(vote)
            sources.add(vote.move.source)
        }
    })
    return List<MoveVote>(result)
}

/*
export const detangleNVotes(
    votes: List<MoveVote>, n: number
): List<MoveVote> {
    // map moves by their source & dest
    const [ byDest, bySource ] = [
        Map<Hex, List<MoveVote>>().asMutable(),
        Map<Hex, List<MoveVote>>().asMutable()]
    const destScores

    votes.forEach(vote => {
        if (!byDest.has(vote.move.dest))
            byDest.set(vote.move.dest, List<MoveVote>().asMutable())
        byDest.get(vote.move.dest).push(vote)
        if (!bySource.has(vote.move.source))
            bySource.set(vote.move.source, List<MoveVote>().asMutable())
        bySource.get(vote.move.source).push(vote)
    })

    // prioritize moves to a popular destination
    const popularDests = List<Hex>(
        byDest.entrySeq().sort(
            ([h1, vs1], [h2, vs2]) => vs2.size - vs1.size
        ).map(([h/!*, vs*!/]) => h)
    )

    const candidates = List<MoveVote>

    // Eliminate mirror image duplicates by looking for nexus hexes.
    // Sort hexes by the number of moves with them as a destination.
    const sortedHexes = List<Hex>(
        counts.entrySeq().sort(
            ([h1, n1], [h2, n2]) => n2 - n1
        ).map(([h/!*, n*!/]) => h))


    const destinations = Set<Hex>().asMutable()
    for (
        let i = 0;
        i < sortedHexes.size && votes.size < CONSOLIDATIONS;
        ++i
    ) {
        const dest = sortedHexes.get(i)
        destinations.add(dest)
        for (const vote of votes) {
            if (
                !destinations.has(vote.move.source)
                && vote.move.dest === sortedHexes.get(i)
            )
                votes.push(vote)
        }
    }
    return List(keepNVotes(votes, CONSOLIDATIONS)) as List<MoveVote>

}*/
