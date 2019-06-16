import * as React from 'react'
import {Map, Set} from 'immutable'
import Adapter from 'enzyme-adapter-react-16'
import * as enzyme from 'enzyme'
import {mount, shallow} from 'enzyme'

import {Board} from '../../model/board/Board'
import {Hex} from '../../model/hex/Hex'
import {CartPair} from "../../../common/CartPair"
import {BoardViewBase, BOARD_STUBS} from "./BoardViewBase"
import {BoardState, BOARD_STATE_STARTER} from '../../model/board/BoardState'
import {
    pickNPlayers, Player, PlayerManager
} from '../../model/players/Players'
import {Tile} from '../../model/hex/Tile'
import {CornersPlayerArranger} from '../../model/setup/PlayerArranger'
import {BoardReducerTester} from '../../model/board/BoardReducerTester'
import {Terrain} from '../../model/hex/Terrain'

it('renders a tile', () => {
    enzyme.configure({adapter: new Adapter()})
    const board = Board.constructDefaultSquare(
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
    // - _ - _ *
    // *   -    -
    // 8o8o8 or =-=-=
    const board = Board.constructDefaultRectangular(
        5, 3, pickNPlayers(2), [
            new CornersPlayerArranger(3)
        ],
    )
    // console.log(board.toString())
    const boardState: BoardState = {
        ...BOARD_STATE_STARTER,
        board: board,
        players: PlayerManager.construct(board.players),
        curPlayer: Player.One,
    }

    // TODO redo this whole thing with HexesView & react-test-renderer — https://reactjs.org/docs/test-renderer.html
    // also https://itnext.io/testing-react-16-3-components-with-react-test-renderer-without-enzyme-d9c65d689e88
    // also https://jestjs.io/blog/2016/07/27/jest-14.html

    // const view = TestRenderer.create(
    //     <HexesView {...BOARD_STUBS}
    //                  boardState={boardState}
    //                  displaySize={new CartPair(1000, 1000)}
    //     />
    // )
    // console.log(JSON.stringify(view.toJSON(), null, '  '))
    // console.log(view.toJSON())
    // console.log(view.toJSON()['children'])
    // console.log(view.toJSON()['children'][0])

    // const view = TestRenderer.create(
    //     <OldGridView {...BOARD_STUBS}
    //                  boardState={boardState}
    //                  displaySize={new CartPair(1000, 1000)}
    //     />
    // )

    const view = mount(
        <OldGridView {...BOARD_STUBS}
            boardState={boardState}
            displaySize={new CartPair(1000, 1000)}
        />
    )
    // console.log(view.html())
    // console.log(view.children().toString())
    // expect(view.children().length).toEqual(nRows)  // n rows
    const tiles = view.find('.tile')
    expect(tiles.length).toEqual(8)
    expect(tiles.first().text()).toEqual('0')
    let text = ''
    tiles.forEach(tile => text += tile.text())
    expect(text).toEqual(('003'+'00'+'300'))
    // expect(tiles.first().next().next().text()).toEqual('3')
    // expect(tiles[2].attribs['title'].substr(0, String(Player.One).length)).toEqual(String(Player.One))
    // none are selected
    expect(view.find('.active').length).toEqual(0)
})

it('renders a board with a selection', () => {
    // select lower-right corner
    const board = Board.constructDefaultSquare(
        3, pickNPlayers(2), [new CornersPlayerArranger(2)])
    const ur = board.edges.upperRight
    const bs: BoardState = {
        ...BOARD_STATE_STARTER,
        board: board,
        cursors: Map<number, Hex>([[0, ur]]),
        players: PlayerManager.construct(board.players),
        curPlayer: Player.One,
    }
    const view = enzyme.render(
        <OldGridView
            {...BOARD_STUBS}
            boardState={bs}
            displaySize={new CartPair(1000, 1000)}
        />
    )
    const active = view.find('.active')
    expect(active.length).toEqual(1)  // only one selected
    // TODO use JSON comparison
    // expect(active[0]).toEqual(view.children()[2])
})

it('clicks a tile to select it', () => {
    const board = Board.constructDefaultSquare(
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

it('creates game via react-redux', () => {
    const brt = new BoardReducerTester()
    expect(brt.board.explicitTiles.size).toEqual(2)
    expect(brt.messages.size).toEqual(0)
    const lowLeft = Hex.ORIGIN
    expect(brt.getTile(lowLeft)).toEqual(
        new Tile(Player.Zero, BoardReducerTester.INITIAL_POP, Terrain.City)
    )
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
        const cursorSet: Set<Hex> = Set<Hex>(this.props.boardState.cursors.values())
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
                                    cx => (cx !== undefined) && (cx + cy) % 2 === 0
                                ).map( // turn cartesian into hex
                                    (cx: number) => Hex.getCart(cx, cy)
                                ).filter( // only in-bounds
                                    coord => bs.board.inBounds(coord)
                                ).map(
                                    (coord: Hex) => (
                                        <OldGridTileView
                                            tile={bs.board.getTile(coord)}
                                            key={coord.id}
                                            selected={cursorSet.contains(coord)}
                                            onSelect={() => this.props.onPlaceCursor(0, coord, true)}
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
