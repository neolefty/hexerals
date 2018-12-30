import * as React from 'react'
import {List} from 'immutable'
import * as Adapter from 'enzyme-adapter-react-16'
import * as enzyme from 'enzyme'
import {shallow} from 'enzyme'

import {queueMovesAction,} from '../model/BoardReducer'
import {Board} from '../model/Board'
import {Hex} from '../model/Hex'
import CartPair from "../../../common/CartPair"
import {BoardViewBase} from "./BoardViewBase"
import {BoardState} from '../model/BoardState'
import {pickNPlayers, Player, PlayerManager} from '../model/players/Players'
import {EMPTY_MOVEMENT_QUEUE, QueueAndMoves} from '../model/MovementQueue'
import {Tile, Terrain} from '../model/Tile';
import {PlayerMove} from '../model/Move';
import {CornersPlayerArranger} from '../model/PlayerArranger';
import {BoardReducerTester} from './BoardReducerTester';

it('renders a tile', () => {
    enzyme.configure({adapter: new Adapter()})
    const board = Board.constructSquare(
        3, pickNPlayers(2), [new CornersPlayerArranger(5)]
    )
    const view = enzyme.render(
        <OldGridTileView
            tile={board.getTile(Hex.ORIGIN)}
            key={0}
            selected={false}
            coord={Hex.ORIGIN}
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
        cursor: Hex.NONE,
        moves: EMPTY_MOVEMENT_QUEUE,
        players: PlayerManager.construct(board.players),
        curPlayer: Player.One,
        messages: List(),
    }
    const view = enzyme.render(
        <OldGridView
            boardState={boardState}
            displaySize={new CartPair(1000, 1000)}
            onPlaceCursor={() => {}}
            onQueueMoves={() => {}}
            onCancelMoves={() => {}}
            onEndGame={() => {}}
        />
    )
    expect(view.children().length).toEqual(n)  // n rows
    const tiles = view.find('.tile')
    expect(tiles.length).toEqual(8)
    expect(tiles.first().text()).toEqual('0')
    expect(tiles.first().next().next().text()).toEqual('3')
    expect(tiles.text()).toEqual(('003'+'00'+'300'))
    expect(tiles[2].attribs['title'].substr(0, String(Player.One).length))
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
            displaySize={new CartPair(1000, 1000)}
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

it('clicks a tile to select it', () => {
    const board = Board.constructSquare(
        3, pickNPlayers(2), [new CornersPlayerArranger(6)])
    const coord = board.constraints.extreme(c => - c.cartX - c.cartY)
    const tile = board.getTile(coord)
    const state = {
        selected: false,
    }

    const tileWrap = shallow(<OldGridTileView
        tile={tile}
        coord={coord}
        selected={state.selected}
        onSelect={() => state.selected = true}
    />)

    expect(tileWrap.hasClass('active')).toBeFalsy()
    tileWrap.simulate('click')
    expect(state.selected).toBeTruthy()

    // have to recreate since rendering above uses static reference to props.selected
    expect(shallow(
        <OldGridTileView tile={tile} selected={true} coord={coord}/>
    ).hasClass('active')).toBeTruthy()
})

// helper class for react-redux testing

it('ensures things are not mutable', () => {
    // check our assumptions
    const testList: List<number> = List([0, 1, 2, 3])
    expect(testList.asImmutable() === testList).toBeTruthy()
    expect(testList.asMutable() === testList).toBeFalsy()
    expect(testList.asMutable().asImmutable() === testList).toBeFalsy()

    const brt = new BoardReducerTester()
    brt.setCurPlayer(Player.Zero)
    brt.placeCursor(brt.ll)
    brt.queueMoveUp()
    brt.queueMoveUp()
    brt.queueMoveDown()
    brt.setCurPlayer(Player.One)
    brt.placeCursor(brt.ur)
    brt.queueMoveDown()
    brt.queueMoveDown()
    brt.queueMoveUp()

    const pqBefore = brt.moves.playerQueues
    expect(pqBefore.asImmutable() === pqBefore).toBeTruthy()
    const zeroBefore = pqBefore.get(Player.Zero)
    expect(zeroBefore.size).toBe(3)
    expect(zeroBefore.asImmutable() === zeroBefore).toBeTruthy()

    const qAndM = brt.moves.popEach(() => true) as QueueAndMoves
    const pqAfter = qAndM.queue.playerQueues
    expect(pqBefore === pqAfter).toBeFalsy()

    expect(pqAfter.asImmutable() === pqAfter).toBeTruthy()
    const zeroAfter = pqAfter.get(Player.Zero)
    expect(zeroBefore === zeroAfter).toBeFalsy()
    expect(zeroAfter.size).toBe(2)
    expect(zeroAfter.asImmutable() === zeroAfter).toBeTruthy()
})

it('creates game via react-redux', () => {
    const brt = new BoardReducerTester()
    expect(brt.board.explicitTiles.size).toEqual(2)
    expect(brt.messages.size).toEqual(0)
    const lowLeft = Hex.ORIGIN
    expect(brt.getTile(lowLeft)).toEqual(
        new Tile(Player.Zero, BoardReducerTester.INITIAL_POP, Terrain.City)
    )
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
    brt.store.dispatch(queueMovesAction(moves))
    // console.log('Messages:')
    // st.messages.forEach((msg, idx) => console.log(`${idx}: ${msg.toString()}`))
    expect(brt.moves.size).toBe(4)
    expect(brt.moves.playerQueues.get(Player.Zero).size).toBe(3)
    expect(brt.messages.size).toBe(2)
})

it('blocks illegal moves', () => {
    const brt = new BoardReducerTester()
    expect(brt.cursor === Hex.NONE).toBeTruthy()
    expect(brt.cursorRawTile).toBeUndefined()

    // try to move when there's no cursor -- should have no effect
    const boardBefore = brt.board
    expect(brt.moves.size).toEqual(0)
    brt.queueMoveDown(false)
    expect(brt.cursor === Hex.NONE).toBeTruthy()
    expect(brt.moves.size).toEqual(0)

    // trying to move the cursor relative to a nonexistent cursor should have no effect
    brt.queueMoveDown(true)
    expect(brt.cursor === Hex.NONE).toBeTruthy()
    expect(boardBefore === brt.board).toBeTruthy()  // no moves executed
    brt.doMoves() // still no legit moves requested, so no effective moves
    expect(brt.cursor === Hex.NONE).toBeTruthy()
    expect(brt.moves.size).toEqual(0)

    // through all this, the board should be unchanged
    expect(boardBefore === brt.board).toBeTruthy()
    // this was causing memory errors for some reason but is working now?
    expect(boardBefore === brt.board).toBeTruthy()  // no effect on board

    // place cursor outside bounds -- no effect
    brt.placeCursor(Hex.LEFT_UP)
    expect(brt.cursor === Hex.NONE).toBeTruthy()
})

// it('moves the cursor', () => {
//     const st = new storeTester()
//     const ul = st.board.edges.upperLeft
//     st.placeCursor(ul)
//     st.queueMoveDown()
//     expect(st.cursor === ul.getDown()).toBeTruthy()
//     expect(st.cursorRawTile).toBeUndefined()
// })

it('cancels moves', () => {
    const brt = new BoardReducerTester(6, 21)
    const boardBefore = brt.state.board

    brt.setCurPlayer(Player.One)
    brt.placeCursor(brt.ur)
    brt.queueMoveDown()
    brt.queueMoveDown()

    brt.setCurPlayer(Player.Zero)
    brt.placeCursor(brt.ll)
    brt.queueMoveUp()
    brt.queueMoveUp()
    expect(brt.moves.size).toBe(4)
    const up2 = brt.ll.plus(Hex.UP).plus(Hex.UP)
    expect(brt.cursor === up2).toBeTruthy()

    // cancel a move and expect the cursor to retreat
    brt.cancelMoves()
    expect(brt.moves.playerHasMove(Player.Zero)).toBeTruthy()
    expect(brt.cursor === brt.ll.plus(Hex.UP)).toBeTruthy()
    expect(brt.moves.size).toBe(3)

    // now cancel one of the other player's moves -- away from the cursor
    brt.cancelMoves(Player.One)
    expect(brt.moves.playerQueues.get(Player.One).size).toBe(1)
    expect(brt.cursor === brt.ll.plus(Hex.UP)).toBeTruthy()
    expect(brt.moves.size).toBe(2)

    // cancel the current player's remaining move
    brt.cancelMoves()
    expect(brt.cursor === brt.ll).toBeTruthy()
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
    brt.placeCursor(brt.board.edges.lowerLeft)
    for (let i: number = 0; i < 7; i++)
        brt.queueMoveUp()
    expect(brt.moves.size).toBe(7)
    brt.cancelMoves(Player.Zero, 5)
    expect(brt.moves.size).toBe(2)
    expect(brt.cursor === up2).toBeTruthy()
    brt.cancelMoves(Player.Zero, -1)
    expect(brt.moves.size).toBe(0)
    expect(brt.cursor === brt.ll).toBeTruthy()
})

it('makes real moves', () => {
    const brt = new BoardReducerTester()

    // place cursor at upper right
    const boardBefore = brt.board
    brt.placeCursor(brt.ur)
    expect(brt.cursor === brt.ur).toBeTruthy()
    expect(brt.getRawTile(brt.ur.getDown())).toBeUndefined()

    brt.queueMoveDown()
    expect(brt.moves.size).toBe(0) // no current player yet
    brt.setCurPlayer(Player.One) // cursor is on One's starting point, UR corner
    brt.queueMoveDown()
    expect(brt.cursor === brt.ur.plus(Hex.DOWN)).toBeTruthy()
    expect(brt.moves.size).toBe(1)

    // interlude: queue and cancel a move UP
    brt.queueMove(Player.One, Hex.UP)
    expect(brt.moves.size).toBe(2)
    expect(brt.cursor === brt.ur).toBeTruthy()
    brt.cancelMoves(Player.One)
    expect(brt.moves.size).toBe(1)
    // cancel moved the cursor back intelligently
    expect(brt.cursor === brt.ur.plus(Hex.DOWN)).toBeTruthy()

    // also check that cancelling doesn't move the cursor back stupidly
    brt.queueMove(Player.One, Hex.UP)
    brt.placeCursor(brt.ul)
    brt.cancelMoves(Player.One)
    expect(brt.moves.size).toBe(1)
    expect(brt.cursor === brt.ul).toBeTruthy()
    brt.placeCursor(brt.ur.plus(Hex.DOWN)) // back where we should be

    expect(boardBefore === brt.board).toBeTruthy() // only queued -- no board updates yet
    // console.log(`-- queued --\n${boardStateToString(brt.state)}`)
    brt.doMoves()
    const boardAfter1 = brt.board
    // console.log(`-- moved --\n${boardStateToString(brt.state)}`)
    expect(boardBefore !== boardAfter1).toBeTruthy()  // board updated
    expect(brt.cursor === brt.ur.getDown()).toBeTruthy()
    expect(brt.cursorRawTile).toEqual(
        new Tile(Player.One, BoardReducerTester.INITIAL_POP - 1)
    )

    // can't move more than 1 space at a time (can't jump)
    const down2 = Hex.DOWN.getDown()
    const dest2 = brt.cursor.plus(down2)
    // even though the destination is in bounds
    expect((brt.board.inBounds(dest2)))
    brt.queueMove(Player.One, down2, true)
    expect(brt.moves.size).toEqual(0)
    expect(brt.messages.size).toEqual(1)
    // TODO use constants in tags
    expect(brt.messages.get(0).tag).toEqual('illegal move')
    // no change occurred due to rejected move
    expect(brt.board === boardAfter1).toBeTruthy()
    // expect(brt.board === boardAfter1).toBeTruthy()
    // but we DID move the cursor
    const down3 = brt.ur.getDown().plus(down2)
    expect(brt.cursor === down3).toBeTruthy()

    // TODO queue from queued-to tile

    // make a second move down
    brt.placeCursor(brt.ur.getDown())
    brt.queueMoveDown(false)
    brt.doMoves()
    expect(brt.cursor === brt.ur.getDown()).toBeTruthy() // didn't move cursor this time

    // queue two moves down-left
    brt.placeCursor(brt.ur)
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
    brt.placeCursor(brt.ur.getDown())
    expect(brt.cursorTile.owner === Player.One).toBeTruthy()
    const before2 = brt.board
    brt.queueMoveDown(false)
    brt.doMoves()
    expect(brt.getTile(brt.ur.getDown()).pop).toEqual(1)
    // move had no effect, so board not updated
    expect(brt.board === before2).toBeTruthy()

    // TODO test that you can't move someone else's stuff?
    // TODO test that multiple players' queued moves all work simultaneously
})

interface OldGridTileProps {
    tile: Tile
    selected: boolean
    coord: Hex

    onSelect?: () => void
}

const oldGridTileStyle = (props: OldGridTileProps) =>
(props.selected ? 'active ' : '') + 'tile ' + props.tile.owner

export const OldGridTileView = (props: OldGridTileProps) => (
    <span
        className={oldGridTileStyle(props)}
        title={props.tile.owner + ' - ' + props.coord.toString(true)}
        // onClick={props.onSelect}
        onClick={(/*e*/) => props.onSelect && props.onSelect()}
    >
        {props.tile.pop}
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
                                    (cx: number) => Hex.getCart(cx, cy)
                                ).filter( // only in-bounds
                                    (coord: Hex) => bs.board.inBounds(coord)
                                ).map(
                                    (coord: Hex) => (
                                        <OldGridTileView
                                            tile={bs.board.getTile(coord)}
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
