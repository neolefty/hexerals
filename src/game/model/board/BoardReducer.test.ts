import {BoardReducerTester} from './BoardReducerTester';
import {QueueAndMoves} from '../move/MovementQueue';
import {List, Range} from 'immutable';
import {PlayerMove} from '../move/Move';
import {pickNPlayers, Player} from '../players/Players';
import {Hex} from '../hex/Hex';
import {queueMovesAction} from './BoardReducer';
import {Terrain} from '../hex/Terrain';
import {Tile} from '../hex/Tile';
import {StatusMessage} from '../../../common/StatusMessage'
import {CornersPlayerArranger} from '../setup/PlayerArranger';
import {GamePhase} from '../cycle/GamePhase';
import {Capture} from '../move/Capture';

it('ensures things are not mutable', () => {
    // check our assumptions
    const testList: List<number> = List([0, 1, 2, 3])
    expect(testList.asImmutable() === testList).toBeTruthy()
    expect(testList.asMutable() === testList).toBeFalsy()
    expect(testList.asMutable().asImmutable() === testList).toBeFalsy()

    const brt = new BoardReducerTester()
    brt.setCurPlayer(Player.Zero)
    brt.setCursor(brt.ll)
    brt.queueMoveUp()
    brt.queueMoveUp()
    brt.queueMoveDown()
    brt.setCurPlayer(Player.One)
    brt.setCursor(brt.ur)
    brt.queueMoveDown()
    brt.queueMoveDown()
    brt.queueMoveUp()

    const pqBefore = brt.moves.playerQueues
    expect(pqBefore.asImmutable() === pqBefore).toBeTruthy()
    const zeroBefore = pqBefore.get(Player.Zero) as List<PlayerMove>
    expect(zeroBefore.size).toBe(3)
    expect(zeroBefore.asImmutable() === zeroBefore).toBeTruthy()

    const qAndM = brt.moves.popEach(() => true) as QueueAndMoves
    const pqAfter = qAndM.queue.playerQueues
    expect(pqBefore === pqAfter).toBeFalsy()

    expect(pqAfter.asImmutable() === pqAfter).toBeTruthy()
    const zeroAfter = pqAfter.get(Player.Zero) as List<PlayerMove>
    expect(zeroBefore === zeroAfter).toBeFalsy()
    expect(zeroAfter.size).toBe(2)
    expect(zeroAfter.asImmutable() === zeroAfter).toBeTruthy()
})

it('queues multiple moves at once', () => {
    const brt = new BoardReducerTester()
    const moves: List<PlayerMove> = List([
        PlayerMove.constructDelta(Player.Zero, brt.ll, Hex.UP),
        PlayerMove.constructDelta(Player.One, brt.ur, Hex.DOWN),
        PlayerMove.constructDelta(Player.Zero, brt.ll.plus(Hex.UP), Hex.UP),
        PlayerMove.constructDelta(Player.One, brt.lr, Hex.RIGHT_UP), // invalid
        PlayerMove.constructDelta(Player.One, brt.lr, Hex.RIGHT_UP), // invalid
        PlayerMove.constructDelta(Player.Zero, brt.ll, Hex.UP),
    ])
    // console.log('Moves:')
    // moves.forEach((move, idx) => console.log(`${idx}: ${move.toString()}`))
    brt.dispatch(queueMovesAction(moves))
    // console.log('Messages:')
    // st.messages.forEach((msg, idx) => console.log(`${idx}: ${msg.toString()}`))
    expect(brt.moves.size).toBe(4)
    const zeroQ = brt.moves.playerQueues.get(Player.Zero) as List<PlayerMove>
    expect(zeroQ.size).toBe(3)
    expect(brt.messages.size).toBe(2)
})

it('blocks illegal moves', () => {
    const brt = new BoardReducerTester()
    expect(brt.firstCursor === Hex.NONE).toBeTruthy()
    expect(brt.cursorRawTile).toBeUndefined()

    // try to move when there's no cursors -- should have no effect
    const boardBefore = brt.board
    expect(brt.moves.size).toEqual(0)
    brt.queueMoveDown(false)
    expect(brt.firstCursor === Hex.NONE).toBeTruthy()
    expect(brt.moves.size).toEqual(0)

    // trying to move the cursors relative to a nonexistent cursors should have no effect
    brt.queueMoveDown(true)
    expect(brt.firstCursor === Hex.NONE).toBeTruthy()
    expect(boardBefore === brt.board).toBeTruthy()  // no moves executed
    brt.doMoves() // still no legit moves requested, so no effective moves
    expect(brt.firstCursor === Hex.NONE).toBeTruthy()
    expect(brt.moves.size).toEqual(0)

    // through all this, the board should be unchanged
    expect(boardBefore === brt.board).toBeTruthy()
    // this was causing memory errors for some reason but is working now?
    expect(boardBefore === brt.board).toBeTruthy()  // no effect on board

    // place cursors outside bounds -- no effect
    brt.setCursor(Hex.LEFT_UP)
    expect(brt.firstCursor === Hex.NONE).toBeTruthy()
})

// it('moves the cursors', () => {
//     const st = new storeTester()
//     const ul = st.board.edges.upperLeft
//     st.setCursor(ul)
//     st.queueMoveDown()
//     expect(st.cursors === ul.getDown()).toBeTruthy()
//     expect(st.cursorRawTile).toBeUndefined()
// })

it('cancels moves', () => {
    const brt = new BoardReducerTester(6, 41)
    const boardBefore = brt.state.board

    brt.setCurPlayer(Player.One)
    brt.setCursor(brt.ur)
    brt.queueMoveDown()
    brt.queueMoveDown()

    brt.setCurPlayer(Player.Zero)
    brt.setCursor(brt.ll)
    brt.queueMoveUp()
    brt.queueMoveUp()
    expect(brt.moves.size).toBe(4)
    const up2 = brt.ll.plus(Hex.UP).plus(Hex.UP)
    expect(brt.firstCursor === up2).toBeTruthy()

    // cancel a move and expect the cursors to retreat
    brt.cancelMoves()
    expect(brt.moves.playerHasMove(Player.Zero)).toBeTruthy()
    expect(brt.firstCursor === brt.ll.plus(Hex.UP)).toBeTruthy()
    expect(brt.moves.size).toBe(3)

    // now cancel one of the other player's moves -- away from the cursors
    brt.cancelMoves(Player.One)
    const oneQ = brt.moves.playerQueues.get(Player.One) as List<PlayerMove>
    expect(oneQ.size).toBe(1)
    expect(brt.firstCursor === brt.ll.plus(Hex.UP)).toBeTruthy()
    expect(brt.moves.size).toBe(2)

    // cancel the current player's remaining move
    brt.cancelMoves()
    expect(brt.firstCursor === brt.ll).toBeTruthy()
    expect(brt.moves.playerHasMove(Player.Zero)).toBeFalsy()
    expect(brt.moves.size).toBe(1)

    expect(brt.state.board === boardBefore).toBeTruthy()
    brt.setCurPlayer(Player.One)
    brt.cancelMoves()
    expect(brt.moves.size).toBe(0)
    brt.cancelMoves()
    expect(brt.moves.size).toBe(0)

    // check we're avoiding unnecessary mutation
    brt.doMoves()
    expect(brt.state.board === boardBefore).toBeTruthy()

    // cancel multiple moves
    brt.setCurPlayer(Player.Zero)
    brt.setCursor(brt.board.edges.lowerLeft)
    Range(0, 7).forEach(() =>
        brt.queueMoveUp()
    )
    expect(brt.moves.size).toBe(7)
    brt.cancelMoves(Player.Zero, 0, 5)
    expect(brt.moves.size).toBe(2)
    expect(brt.firstCursor === up2).toBeTruthy()
    brt.cancelMoves(Player.Zero, 0, -1)
    expect(brt.moves.size).toBe(0)
    expect(brt.firstCursor === brt.ll).toBeTruthy()
})

it('makes real moves', () => {
    const brt = new BoardReducerTester()

    // place cursors at upper right
    const boardBefore = brt.board
    brt.setCursor(brt.ur)
    expect(brt.firstCursor === brt.ur).toBeTruthy()
    expect(brt.getRawTile(brt.ur.getDown())).toBeUndefined()

    brt.queueMoveDown()
    expect(brt.moves.size).toBe(0) // no current player yet
    brt.setCurPlayer(Player.One) // cursors is on One's starting point, UR corner
    brt.queueMoveDown()
    expect(brt.firstCursor === brt.ur.plus(Hex.DOWN)).toBeTruthy()
    expect(brt.moves.size).toBe(1)

    // interlude: queue and cancel a move UP
    brt.queueMove(Player.One, Hex.UP)
    expect(brt.moves.size).toBe(2)
    expect(brt.firstCursor === brt.ur).toBeTruthy()
    brt.cancelMoves(Player.One)
    expect(brt.moves.size).toBe(1)
    // cancel moved the cursors back intelligently
    expect(brt.firstCursor === brt.ur.plus(Hex.DOWN)).toBeTruthy()

    // also check that cancelling doesn't move the cursors back stupidly
    brt.queueMove(Player.One, Hex.UP)
    brt.setCursor(brt.ul)
    brt.cancelMoves(Player.One)
    expect(brt.moves.size).toBe(1)
    expect(brt.firstCursor === brt.ul).toBeTruthy()
    brt.setCursor(brt.ur.plus(Hex.DOWN)) // back where we should be

    expect(boardBefore === brt.board).toBeTruthy() // only queued -- no board updates yet
    // console.log(`-- queued --\n${boardStateToString(brt.state)}`)
    brt.doMoves()
    const boardAfter1 = brt.board
    // console.log(`-- moved --\n${boardStateToString(brt.state)}`)
    expect(boardBefore !== boardAfter1).toBeTruthy()  // board updated
    expect(brt.firstCursor === brt.ur.getDown()).toBeTruthy()
    expect(brt.cursorRawTile).toEqual(
        new Tile(Player.One, BoardReducerTester.INITIAL_POP - 1)
    )

    // can't move more than 1 space at a time (can't jump)
    const down2 = Hex.DOWN.getDown()
    const dest2 = brt.firstCursor.plus(down2)
    // even though the destination is in bounds
    expect((brt.board.inBounds(dest2)))
    brt.queueMove(Player.One, down2, true)
    expect(brt.moves.size).toEqual(0)
    expect(brt.messages.size).toEqual(1)
    // TODO use constants in tags
    const firstMsg = brt.messages.get(0) as StatusMessage
    expect(firstMsg.tag).toEqual('illegal move')
    // no change occurred due to rejected move
    expect(brt.board === boardAfter1).toBeTruthy()
    // expect(brt.board === boardAfter1).toBeTruthy()
    // but we DID move the cursors
    const down3 = brt.ur.getDown().plus(down2)
    expect(brt.firstCursor === down3).toBeTruthy()

    // TODO queue from queued-to tile

    // make a second move down
    brt.setCursor(brt.ur.getDown())
    brt.queueMoveDown(false)
    brt.doMoves()
    expect(brt.firstCursor === brt.ur.getDown()).toBeTruthy() // didn't move cursors this time

    // queue two moves down-left
    brt.setCursor(brt.ur)
    // console.log(brt.messages)
    brt.queueMove(Player.One, Hex.LEFT_DOWN)
    // console.log(brt.messages)
    brt.queueMove(Player.One, Hex.LEFT_DOWN)
    // console.log(brt.messages)
    expect(brt.moves.size).toBe(2)

    const downFromUR = (n: number) =>
        brt.getTile(brt.ur.plus(Hex.DOWN.times(n)))
    const human1 = new Tile(Player.One, 1)
    expect(downFromUR(0)).toEqual(human1.setTerrain(Terrain.City))
    expect(downFromUR(1)).toEqual(human1)
    expect(downFromUR(2)).toEqual(
        new Tile(Player.One, BoardReducerTester.INITIAL_POP-2)
    )
    expect(downFromUR(3)).toEqual(new Tile(Player.Nobody, 0, Terrain.Empty, false))
    expect(downFromUR(3) === Tile.MAYBE_EMPTY).toBeTruthy()

    // moving contents 1 has no effect
    brt.setCursor(brt.ur.getDown())
    expect(brt.firstCursorTile.owner === Player.One).toBeTruthy()
    const before2 = brt.board
    brt.queueMoveDown(false)
    brt.doMoves()
    expect(brt.getTile(brt.ur.getDown()).pop).toEqual(1)
    // move had no effect, so board not updated
    expect(brt.board === before2).toBeTruthy()

    // TODO test that you can't move someone else's stuff?
    // TODO test that multiple players' queued moves all work simultaneously
})

it('notices captures', () => {
    const brt = new BoardReducerTester(3, 3, [
        new CornersPlayerArranger(49, Terrain.Capital)
    ])
    expect(brt.state.phase).toBe(GamePhase.BeforeStart)
    brt.gameTick()
    expect(brt.state.phase).toBe(GamePhase.Started)
    expect(brt.getTile(Hex.ORIGIN).pop).toBe(49)
    brt.gameTick()
    expect(brt.getTile(Hex.ORIGIN).pop).toBe(50)

    // move player zero to center
    brt.setCursor(brt.ll)
    brt.queueMove(Player.Zero, Hex.RIGHT_UP)
    brt.doMoves()
    const captures0 = brt.state.captures
    expect(captures0 && captures0.size).toBe(1)
    if (captures0) {
        const cap = captures0.get(0) as Capture
        const synth = new Capture(
            Hex.RIGHT_UP, Tile.EMPTY, brt.getTile(Hex.RIGHT_UP)
        )
        expect(cap.equals(synth)).toBeTruthy()
    }

    // move player one out of the way
    brt.setCursor(brt.ur)
    brt.queueMove(Player.One, Hex.DOWN)
    brt.doMoves()
    const captures1 = brt.state.captures
    expect(captures1).not.toBeUndefined()
    if (captures1) {
        const cap = captures1.last() as Capture
        expect(cap.equals(new Capture(
            brt.firstCursor, Tile.EMPTY, new Tile(Player.One, 49)
        ))).toBeTruthy()
    }
    const capitalTileBefore = brt.getTile(brt.ur)
    const otherHex = brt.firstCursor
    const otherBefore = brt.firstCursorTile

    // zero captures one's capital
    brt.setCursor(Hex.RIGHT_UP)
    brt.queueMove(Player.Zero, Hex.RIGHT_UP)
    brt.doMoves()
    expect(brt.board.getHexStatistics().get(Player.Zero, 0)).toBe(4)
    expect(brt.board.getPopStatistics().get(Player.Zero, 0)).toBe(74)
    const captures2 = brt.state.captures
    expect(captures2).not.toBeUndefined()
    // the last two capture should be from the capital capture
    if (captures2) {
        const actualCaptures = captures2.slice(-2)
        expect(actualCaptures.size).toBe(2)
        const capitalCap = new Capture(
            brt.ur, capitalTileBefore, brt.getTile(brt.ur))
        const otherCap = new Capture(
            otherHex, otherBefore, brt.getTile(otherHex))
        const inActual = (cap: Capture): boolean =>
            actualCaptures.find(
                val => val.equals(cap)
            ) !== undefined
        expect(inActual(capitalCap)).toBeTruthy()
        expect(inActual(otherCap)).toBeTruthy()
    }
    expect(brt.state.phase).toBe(GamePhase.Started)
    brt.gameTick()
    expect(brt.state.phase).toBe(GamePhase.Ended)
})

it('advances game phases', () => {
    const brt = new BoardReducerTester(3, 3, [
        new CornersPlayerArranger(20)
    ], pickNPlayers(4))
    expect(brt.phase).toBe(GamePhase.BeforeStart)
    expect(brt.board.hexesAll.size).toBe(5) // X-shaped
    expect(brt.getTile(brt.ul).owner).toBe(Player.Two)
    expect(brt.getTile(brt.lr).owner).toBe(Player.Three)
    brt.setCursor(brt.ul)
    brt.queueMove(Player.Two, Hex.RIGHT_DOWN)
    brt.setCursor(brt.lr)
    brt.queueMove(Player.Three, Hex.LEFT_UP)
    brt.gameTick()
    brt.doMoves()
    expect(brt.getTile(Hex.RIGHT_UP)).toEqual(new Tile(Player.Two, 0))
    brt.setCursor(brt.ll)
    brt.queueMove(Player.Zero, Hex.RIGHT_UP)
    brt.queueMove(Player.Zero, Hex.RIGHT_DOWN)
    brt.queueMove(Player.Zero, Hex.LEFT_UP)
    brt.queueMove(Player.Zero, Hex.LEFT_UP)
    brt.doAllMoves()
    expect(brt.moves.size).toBe(0)
    expect(brt.board.getHexStatistics().get(Player.Zero, 0)).toBe(4)
    expect(brt.board.getHexStatistics().get(Player.Two, 0)).toBe(0)
    expect(brt.board.getHexStatistics().get(Player.Three, 0)).toBe(0)
})
