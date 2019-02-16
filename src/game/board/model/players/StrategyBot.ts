import {List} from 'immutable'

import {GameDecision, Robot} from './Robot'
import {HexMove, PlayerMove} from '../Move'
import {BoardState} from '../BoardState'
import {Player} from './Players'
import {Comma} from '../../../../common/Comma'
import {
    // strategies
    StopByCities, CaptureCities, Consolidate, Expand, WasteNot,
    // classes
    MoveVote, Strategy, StrategyType,
    // functions
    distillVotes, makeVotes, sortBySentiment,
} from './Strategy'
import * as assert from 'assert';

// TODO defend capital
// TODO move towards opponents — value captures far from home?
// TODO gang up — notice a ring around desirable target — value reinforcements near an opponent?

export class StrategyBot implements Robot {
    static readonly STRATEGIES = List<Strategy>([
        new WasteNot(), // avoid making losing attacks
        new StopByCities(), // ooh, it's a city ...
        new CaptureCities(), // ooh, it's a city!
        // TODO also go in straight lines?
        new Expand(), // spread out
        new Consolidate(), // focus
    ])

    static readonly MAX_IQ = StrategyBot.STRATEGIES.size

    // assign N random strategies
    static byIntelligence(intelligence: number): StrategyBot {
        assert.ok(intelligence <= StrategyBot.MAX_IQ)
        let settings: boolean[] = Array(
            StrategyBot.MAX_IQ).fill(false)
        while (settings.filter(value => value).length < intelligence)
            settings[Math.floor(
                Math.random() * this.MAX_IQ
            )] = true
        return new StrategyBot(settings)
    }

    static bySkill(skill: number): StrategyBot {
        let bools = Array(StrategyBot.MAX_IQ).fill(false)
        bools[skill] = true
        return new StrategyBot(bools)
    }

    constructor(readonly strategies: boolean[]) {
        assert.strictEqual(strategies.length, StrategyBot.MAX_IQ)
    }

    get intelligence() {
        let result = 0
        this.strategies.forEach(skill => result += (skill ? 1 : 0))
        return result
    }

    hasStrategy(index: number): boolean {
        return this.strategies[index]
    }

    decide(
        player: Player, bs: BoardState, curMoves?: List<PlayerMove>
    ): GameDecision | undefined {
        let result: GameDecision = {}
        const originalMoveCount = curMoves ? curMoves.size : 0
        let votes: List<MoveVote> = makeVotes(bs.board, curMoves)

        // 1. Should we cancel anything?
        votes = this.runStrategies(StrategyType.Canceller, player, bs, votes)
        const numCancelled = originalMoveCount - votes.size
        if (numCancelled > 0)
            result.cancelMoves = numCancelled

        // 2. If nothing is planned already, make a new plan
        if (votes.size === 0)
            votes = this.runStrategies(StrategyType.Planner, player, bs, votes)

        // 3. Sort by urgency and return
        votes = votes.sort(sortBySentiment) as List<MoveVote>
        votes = distillVotes(votes)
        // TODO maybe limit the number of moves planned
        result.makeMoves = votes.map(vote => vote.move) as List<HexMove>
        return result
    }

    runStrategies(
        type: StrategyType,
        player: Player,
        bs: BoardState,
        votes: List<MoveVote>
    ): List<MoveVote> {
        let result = votes
        StrategyBot.STRATEGIES.forEach((strategy, index) => {
            if (strategy.type === type && this.hasStrategy(index)) {
                result = strategy.suggest(player, bs.board, votes)
            }
        })
        return result
    }

    toString() {
        let result = `IQ ${this.intelligence}`
        const comma = new Comma(' — ', ', ')
        this.strategies.forEach((has, i) =>
            result += has
                ? `${comma}${
                        (StrategyBot.STRATEGIES.get(i) as Strategy).name
                    }`
                : ''
        )
        return result
    }
}