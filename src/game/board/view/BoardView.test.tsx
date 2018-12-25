import * as React from 'react'
import {List} from 'immutable'
import * as Adapter from 'enzyme-adapter-react-16'
import * as enzyme from 'enzyme'
import {shallow} from 'enzyme'

import {queueMovesAction,} from '../model/BoardReducer'
import {Board} from '../model/Board'
import {HexCoord} from '../model/HexCoord'
import Dimension from "../../../common/Dimension"
import {BoardViewBase} from "./BoardViewBase"
import {BoardState} from '../model/BoardState'
import {pickNPlayers, Player, PlayerManager} from '../../players/Players'
import {EMPTY_MOVEMENT_QUEUE, QueueAndMoves} from '../model/MovementQueue'
import {Spot, Terrain} from '../model/Spot';
import {PlayerMove} from '../model/Move';
import {CornersPlayerArranger} from '../model/Arranger';
import {StoreTester} from './StoreTester';

it('renders a spot', () => {
    enzyme.configure({adapter: new Adapter()})
    const board = Board.constructSquare(
        3, pickNPlayers(2), [new CornersPlayerArranger(5)]
    )
    const view = enzyme.render(
        <OldGridSpotView
            spot={board.getSpot(HexCoord.ORIGIN)}
            key={0}
            selected={false}
            coord={HexCoord.ORIGIN}
        />
    )
    expect(view.text()).toEqual('5')
})

// TODO write test of HexBoardView
it('renders a board with no selection', () => {
    const n = 3 // ++* / ++ / *++
    const board = Board.constructRectangular(
        5, 2, pickNPlayers(2), [new CornersPlayerArranger(3)])
    const boardState: BoardState = {
        board: board,
        turn: 0,
        cursor: HexCoord.NONE,
        moves: EMPTY_MOVEMENT_QUEUE,
        players: PlayerManager.construct(board.players),
        curPlayer: Player.One,
        messages: List(),
    }
    const view = enzyme.render(
        <OldGridView
            boardState={boardState}
            displaySize={new Dimension(1000, 1000)}
            onPlaceCursor={() => {}}
            onQueueMoves={() => {}}
            onCancelMoves={() => {}}
            onEndGame={() => {}}
        />
    )
    expect(view.children().length).toEqual(n)  // n rows
    const spots = view.find('.spot')
    expect(spots.length).toEqual(8)
    // console.log('----> ' + spots.text())
    expect(spots.first().text()).toEqual('0')
    expect(spots.first().next().next().text()).toEqual('3')
    expect(spots.text()).toEqual(('003'+'00'+'300'))
    expect(spots[2].attribs['title'].substr(0, String(Player.One).length))
        .toEqual(String(Player.One))
    // none are selected
    expect(view.find('.active').length).toEqual(0)
})

it('renders a board with a selection', () => {
    // select lower-right corner
    const board = Board.constructSquare(
        3, pickNPlayers(2), [new CornersPlayerArranger(2)])
    const ur = board.edges.upperRight
    const bs: BoardState = {
        board: board,
        turn: 0,
        cursor: ur,
        moves: EMPTY_MOVEMENT_QUEUE,
        players: PlayerManager.construct(board.players),
        curPlayer: Player.One,
        messages: List(),
    }
    const view = enzyme.render(
        <OldGridView
            boardState={bs}
            displaySize={new Dimension(1000, 1000)}
            onPlaceCursor={() => {}}
            onQueueMoves={() => {}}
            onCancelMoves={() => {}}
            onEndGame={() => {}}
        />
    )
    const active = view.find('.active')
    expect(active.length).toEqual(1)  // only one selected
    expect(active[0]).toEqual(view.children()[2])
})

it('clicks a spot to select it', () => {
    const board = Board.constructSquare(
        3, pickNPlayers(2), [new CornersPlayerArranger(6)])
    const coord = board.constraints.extreme(c => - c.cartX - c.cartY)
    const spot = board.getSpot(coord)
    const state = {
        selected: false,
    }

    const spotWrap = shallow(<OldGridSpotView
        spot={spot}
        coord={coord}
        selected={state.selected}
        onSelect={() => state.selected = true}
    />)

    expect(spotWrap.hasClass('active')).toBeFalsy()
    spotWrap.simulate('click')
    expect(state.selected).toBeTruthy()

    // have to recreate since rendering above uses static reference to props.selected
    expect(shallow(
        <OldGridSpotView spot={spot} selected={true} coord={coord}/>
    ).hasClass('active')).toBeTruthy()
})

// helper class for react-redux testing

it('ensures things are not mutable', () => {
    // check our assumptions
    const testList: List<number> = List([0, 1, 2, 3])
    expect(testList.asImmutable() === testList).toBeTruthy()
    expect(testList.asMutable() === testList).toBeFalsy()
    expect(testList.asMutable().asImmutable() === testList).toBeFalsy()

    const st = new StoreTester()
    st.setCurPlayer(Player.Zero)
    st.placeCursor(st.ll)
    st.queueMoveUp()
    st.queueMoveUp()
    st.queueMoveDown()
    st.setCurPlayer(Player.One)
    st.placeCursor(st.ur)
    st.queueMoveDown()
    st.queueMoveDown()
    st.queueMoveUp()

    const pqBefore = st.moves.playerQueues
    expect(pqBefore.asImmutable() === pqBefore).toBeTruthy()
    const zeroBefore = pqBefore.get(Player.Zero)
    expect(zeroBefore.size).toBe(3)
    expect(zeroBefore.asImmutable() === zeroBefore).toBeTruthy()

    const qAndM = st.moves.popEach(() => true) as QueueAndMoves
    const pqAfter = qAndM.queue.playerQueues
    expect(pqBefore === pqAfter).toBeFalsy()

    expect(pqAfter.asImmutable() === pqAfter).toBeTruthy()
    const zeroAfter = pqAfter.get(Player.Zero)
    expect(zeroBefore === zeroAfter).toBeFalsy()
    expect(zeroAfter.size).toBe(2)
    expect(zeroAfter.asImmutable() === zeroAfter).toBeTruthy()
})

it('creates game via react-redux', () => {
    const st = new StoreTester()
    expect(st.board.spots.size).toEqual(2)
    expect(st.messages.size).toEqual(0)
    const lowLeft = HexCoord.ORIGIN
    expect(st.getSpot(lowLeft)).toEqual(
        new Spot(Player.Zero, StoreTester.INITIAL_POP, Terrain.City)
    )
})

it('queues multiple moves at once', () => {
    const st = new StoreTester()
    const moves: List<PlayerMove> = List([
        PlayerMove.construct(Player.Zero, st.ll, HexCoord.UP),
        PlayerMove.construct(Player.One, st.ur, HexCoord.DOWN),
        PlayerMove.construct(Player.Zero, st.ll.plus(HexCoord.UP), HexCoord.UP),
        PlayerMove.construct(Player.One, st.lr, HexCoord.RIGHT_UP), // invalid
        PlayerMove.construct(Player.One, st.lr, HexCoord.RIGHT_UP), // invalid
        PlayerMove.construct(Player.Zero, st.ll, HexCoord.UP),
    ])
    // console.log('Moves:')
    // moves.forEach((move, idx) => console.log(`${idx}: ${move.toString()}`))
    st.store.dispatch(queueMovesAction(moves))
    // console.log('Messages:')
    // st.messages.forEach((msg, idx) => console.log(`${idx}: ${msg.toString()}`))
    expect(st.moves.size).toBe(4)
    expect(st.moves.playerQueues.get(Player.Zero).size).toBe(3)
    expect(st.messages.size).toBe(2)
})

it('blocks illegal moves', () => {
    const st = new StoreTester()
    expect(st.cursor === HexCoord.NONE).toBeTruthy()
    expect(st.cursorRawSpot).toBeUndefined()

    // try to move when there's no cursor -- should have no effect
    const boardBefore = st.board
    expect(st.moves.size).toEqual(0)
    st.queueMoveDown(false)
    expect(st.cursor === HexCoord.NONE).toBeTruthy()
    expect(st.moves.size).toEqual(0)

    // trying to move the cursor relative to a nonexistent cursor should have no effect
    st.queueMoveDown(true)
    expect(st.cursor === HexCoord.NONE).toBeTruthy()
    expect(boardBefore === st.board).toBeTruthy()  // no moves executed
    st.doMoves() // still no legit moves requested, so no effective moves
    expect(st.cursor === HexCoord.NONE).toBeTruthy()
    expect(st.moves.size).toEqual(0)

    // through all this, the board should be unchanged
    expect(boardBefore === st.board).toBeTruthy()
    // this was causing memory errors for some reason but is working now?
    expect(boardBefore === st.board).toBeTruthy()  // no effect on board

    // place cursor outside bounds -- no effect
    st.placeCursor(HexCoord.LEFT_UP)
    expect(st.cursor === HexCoord.NONE).toBeTruthy()
})

// it('moves the cursor', () => {
//     const st = new storeTester()
//     const ul = st.board.edges.upperLeft
//     st.placeCursor(ul)
//     st.queueMoveDown()
//     expect(st.cursor === ul.getDown()).toBeTruthy()
//     expect(st.cursorRawSpot).toBeUndefined()
// })

it('cancels moves', () => {
    const st = new StoreTester(6, 21)
    const boardBefore = st.state.board

    st.setCurPlayer(Player.One)
    st.placeCursor(st.ur)
    st.queueMoveDown()
    st.queueMoveDown()

    st.setCurPlayer(Player.Zero)
    st.placeCursor(st.ll)
    st.queueMoveUp()
    st.queueMoveUp()
    expect(st.moves.size).toBe(4)
    const up2 = st.ll.plus(HexCoord.UP).plus(HexCoord.UP)
    expect(st.cursor === up2).toBeTruthy()

    // cancel a move and expect the cursor to retreat
    st.cancelMoves()
    expect(st.moves.playerHasMove(Player.Zero)).toBeTruthy()
    expect(st.cursor === st.ll.plus(HexCoord.UP)).toBeTruthy()
    expect(st.moves.size).toBe(3)

    // now cancel one of the other player's moves -- away from the cursor
    st.cancelMoves(Player.One)
    expect(st.moves.playerQueues.get(Player.One).size).toBe(1)
    expect(st.cursor === st.ll.plus(HexCoord.UP)).toBeTruthy()
    expect(st.moves.size).toBe(2)

    // cancel the current player's remaining move
    st.cancelMoves()
    expect(st.cursor === st.ll).toBeTruthy()
    expect(st.moves.playerHasMove(Player.Zero)).toBeFalsy()
    expect(st.moves.size).toBe(1)

    expect(st.state.board === boardBefore).toBeTruthy()
    st.setCurPlayer(Player.One)
    st.cancelMoves()
    expect(st.moves.size).toBe(0)
    st.cancelMoves()
    expect(st.moves.size).toBe(0)

    // check we're avoiding unnecessary mutation
    st.doMoves()
    expect(st.state.board === boardBefore).toBeTruthy()

    // cancel multiple moves
    st.setCurPlayer(Player.Zero)
    st.placeCursor(st.board.edges.lowerLeft)
    for (let i: number = 0; i < 7; i++)
        st.queueMoveUp()
    expect(st.moves.size).toBe(7)
    st.cancelMoves(Player.Zero, 5)
    expect(st.moves.size).toBe(2)
    expect(st.cursor === up2).toBeTruthy()
    st.cancelMoves(Player.Zero, -1)
    expect(st.moves.size).toBe(0)
    expect(st.cursor === st.ll).toBeTruthy()
})

it('makes real moves', () => {
    const st = new StoreTester()

    // place cursor at upper right
    const boardBefore = st.board
    st.placeCursor(st.ur)
    expect(st.cursor === st.ur).toBeTruthy()
    expect(st.getRawSpot(st.ur.getDown())).toBeUndefined()

    st.queueMoveDown()
    expect(st.moves.size).toBe(0) // no current player yet
    st.setCurPlayer(Player.One) // cursor is on One's starting point, UR corner
    st.queueMoveDown()
    expect(st.cursor === st.ur.plus(HexCoord.DOWN)).toBeTruthy()
    expect(st.moves.size).toBe(1)

    // interlude: queue and cancel a move UP
    st.queueMove(Player.One, HexCoord.UP)
    expect(st.moves.size).toBe(2)
    expect(st.cursor === st.ur).toBeTruthy()
    st.cancelMoves(Player.One)
    expect(st.moves.size).toBe(1)
    // cancel moved the cursor back intelligently
    expect(st.cursor === st.ur.plus(HexCoord.DOWN)).toBeTruthy()

    // also check that cancelling doesn't move the cursor back stupidly
    st.queueMove(Player.One, HexCoord.UP)
    st.placeCursor(st.ul)
    st.cancelMoves(Player.One)
    expect(st.moves.size).toBe(1)
    expect(st.cursor === st.ul).toBeTruthy()
    st.placeCursor(st.ur.plus(HexCoord.DOWN)) // back where we should be

    expect(boardBefore === st.board).toBeTruthy() // only queued -- no board updates yet
    // console.log(`-- queued --\n${boardStateToString(st.state)}`)
    st.doMoves()
    const boardAfter1 = st.board
    // console.log(`-- moved --\n${boardStateToString(st.state)}`)
    expect(boardBefore !== boardAfter1).toBeTruthy()  // board updated
    expect(st.cursor === st.ur.getDown()).toBeTruthy()
    expect(st.cursorRawSpot).toEqual(
        new Spot(Player.One, StoreTester.INITIAL_POP - 1)
    )

    // can't move more than 1 space at a time (can't jump)
    const down2 = HexCoord.DOWN.getDown()
    const dest2 = st.cursor.plus(down2)
    // even though the destination is in bounds
    expect((st.board.inBounds(dest2)))
    st.queueMove(Player.One, down2, true)
    expect(st.moves.size).toEqual(0)
    expect(st.messages.size).toEqual(1)
    // TODO use constants in tags
    expect(st.messages.get(0).tag).toEqual('illegal move')
    // no change occurred due to rejected move
    expect(st.board === boardAfter1).toBeTruthy()
    // expect(st.board === boardAfter1).toBeTruthy()
    // but we DID move the cursor
    const down3 = st.ur.getDown().plus(down2)
    expect(st.cursor === down3).toBeTruthy()

    // TODO queue from queued-to spot

    // make a second move down
    st.placeCursor(st.ur.getDown())
    st.queueMoveDown(false)
    st.doMoves()
    expect(st.cursor === st.ur.getDown()).toBeTruthy() // didn't move cursor this time

    // queue two moves down-left
    st.placeCursor(st.ur)
    // console.log(st.messages)
    st.queueMove(Player.One, HexCoord.LEFT_DOWN)
    // console.log(st.messages)
    st.queueMove(Player.One, HexCoord.LEFT_DOWN)
    // console.log(st.messages)
    expect(st.moves.size).toBe(2)

    const downFromUR = (n: number) =>
        st.getSpot(st.ur.plus(HexCoord.DOWN.times(n)))
    const human1 = new Spot(Player.One, 1)
    expect(downFromUR(0)).toEqual(human1.setTerrain(Terrain.City))
    expect(downFromUR(1)).toEqual(human1)
    expect(downFromUR(2)).toEqual(
        new Spot(Player.One, StoreTester.INITIAL_POP-2)
    )
    expect(downFromUR(3)).toEqual(new Spot(Player.Nobody, 0))
    expect(downFromUR(3) === Spot.BLANK).toBeTruthy()

    // moving contents 1 has no effect
    st.placeCursor(st.ur.getDown())
    expect(st.cursorSpot.owner === Player.One).toBeTruthy()
    const before2 = st.board
    st.queueMoveDown(false)
    st.doMoves()
    expect(st.getSpot(st.ur.getDown()).pop).toEqual(1)
    // move had no effect, so board not updated
    expect(st.board === before2).toBeTruthy()

    // TODO test that you can't move someone else's stuff?
    // TODO test that multiple players' queued moves all work simultaneously
})

interface OldGridSpotProps {
    spot: Spot
    selected: boolean
    coord: HexCoord

    onSelect?: () => void
}

const oldGridSpotStyle = (props: OldGridSpotProps) =>
(props.selected ? 'active ' : '') + 'spot ' + props.spot.owner

export const OldGridSpotView = (props: OldGridSpotProps) => (
    <span
        className={oldGridSpotStyle(props)}
        title={props.spot.owner + ' - ' + props.coord.toString(true)}
        // onClick={props.onSelect}
        onClick={(/*e*/) => props.onSelect && props.onSelect()}
    >
        {props.spot.pop}
    </span>
)

export class OldGridView extends BoardViewBase {
    render(): React.ReactNode {
        const bs: BoardState = this.props.boardState
        return (
            <div
                className="board"
                tabIndex={0}
                onKeyDown={this.keyboardController.onKeyDown}
            >
                {
                    bs.board.edges.yRange().reverse().map((cy: number) => (
                        <div key={cy}>
                            {
                                bs.board.edges.xRange().filter( // remove nonexistent
                                    (cx: number) => (cx + cy) % 2 === 0
                                ).map( // turn cartesian into hex
                                    (cx: number) => HexCoord.getCart(cx, cy)
                                ).filter( // only in-bounds
                                    (coord: HexCoord) => bs.board.inBounds(coord)
                                ).map(
                                    (coord: HexCoord) => (
                                        <OldGridSpotView
                                            spot={bs.board.getSpot(coord)}
                                            key={coord.id}
                                            selected={coord === bs.cursor}
                                            onSelect={() => this.props.onPlaceCursor(coord)}
                                            coord={coord}
                                        />
                                    )
                                )
                            }
                        </div>
                    ))
                }
            </div>
        )
    }
}
