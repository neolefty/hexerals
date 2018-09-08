import * as React from 'react';
import {List, Map} from 'immutable';
import {createStore, Store} from 'redux';
import * as enzyme from 'enzyme';
import {shallow} from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';

import {
    BoardReducer, queueMoveAction, newGameAction, placeCursorAction, doMovesAction
} from './BoardReducer';
import {Board, Spot, TwoCornersArranger} from './Board';
import {INITIAL_POP} from './BoardConstants';
import {HexCoord} from './Hex';
import Dimension from "../Dimension";
import {BoardViewBase} from "./BoardView";
import {BoardState} from './BoardState';
import {INITIAL_HEIGHT, INITIAL_WIDTH} from './BoardConstants';
import {pickNPlayers, Player} from './Players';
import {MovementQueue} from './MovementQueue';
import {StatusMessage} from '../StatusMessage';

it('renders a spot', () => {
    enzyme.configure({adapter: new Adapter()});
    const board = Board.constructSquare(
        3, pickNPlayers(2), new TwoCornersArranger(5)
    );
    const view = enzyme.render(
        <OldGridSpotView
            spot={board.getSpot(HexCoord.ORIGIN)}
            key={0}
            selected={false}
            coord={HexCoord.ORIGIN}
        />
    );
    expect(view.text()).toEqual('5');
});

// TODO write test of HexBoardView
it('renders a board with no selection', () => {
    const n = 3; // ++* / ++ / *++
    const board = Board.constructSquare(
        n, pickNPlayers(2), new TwoCornersArranger(3));
    const view = enzyme.render(
        <OldGridView
            board={board}
            cursor={HexCoord.NONE}
            displaySize={new Dimension(1000, 1000)}
            onQueueMove={() => {}}
            onPlaceCursor={() => {}}
            onNewGame={() => {}}
        />
    );
    expect(view.children().length).toEqual(n);  // n rows
    const spots = view.find('.spot');
    expect(spots.length).toEqual(8);
    // console.log('----> ' + spots.text());
    expect(spots.first().text()).toEqual('0');
    expect(spots.first().next().next().text()).toEqual('3');
    expect(spots.text()).toEqual(('003'+'00'+'300'));
    expect(spots[2].attribs['title'].substr(0, String(Player.One).length))
        .toEqual(String(Player.One));
    // none are selected
    expect(view.find('.active').length).toEqual(0);
});

it('renders a board with a selection', () => {
    // select lower-right corner
    const board = Board.constructSquare(
        3, pickNPlayers(2), new TwoCornersArranger(2));
    const ur = board.edges.upperRight;
    const view = enzyme.render(
        <OldGridView
            board={board}
            cursor={ur}
            displaySize={new Dimension(1000, 1000)}
            onPlaceCursor={() => {}}
            onQueueMove={() => {}}
            onNewGame={() => {}}
        />
    );
    const active = view.find('.active');
    expect(active.length).toEqual(1);  // only one selected
    expect(active[0]).toEqual(view.children()[2]);
});

it('clicks a spot to select it', () => {
    const board = Board.constructSquare(
        3, pickNPlayers(2), new TwoCornersArranger(6));
    const coord = board.constraints.extreme(c => - c.cartX() - c.cartY());
    const spot = board.getSpot(coord);
    const state = {
        selected: false,
    };

    const spotWrap = shallow(<OldGridSpotView
        spot={spot}
        coord={coord}
        selected={state.selected}
        onSelect={() => state.selected = true}
    />);

    expect(spotWrap.hasClass('active')).toBeFalsy();
    spotWrap.simulate('click');
    expect(state.selected).toBeTruthy();

    // have to recreate since rendering above uses static reference to props.selected
    expect(shallow(
        <OldGridSpotView spot={spot} selected={true} coord={coord}/>
    ).hasClass('active')).toBeTruthy();
});

// helper class for react-redux testing
class storeTester {
    readonly store: Store<BoardState>;
    constructor() {
        this.store = createStore<BoardState>(BoardReducer);
        // console.log(`before: board ${store.getState().board}; game.board ${store.getState().board.spots.size}`);
        this.store.dispatch(newGameAction(Board.constructRectangular(
            INITIAL_WIDTH, INITIAL_HEIGHT,
            pickNPlayers(2),
            new TwoCornersArranger(INITIAL_POP),
        )));
        // console.log(`after: board ${store.getState().board.spots.size}; game.board ${store.getState().board.spots.size}`);
    }

    // Getters
    get state(): BoardState { return this.store.getState(); }
    get board(): Board { return this.state.board; }
    get spots(): Map<HexCoord, Spot> { return this.board.spots; }
    get cursor(): HexCoord { return this.state.cursor; }
    get messages(): List<StatusMessage> { return this.state.messages; }
    getRawSpot = (coord: HexCoord): Spot | undefined => this.spots.get(coord);
    // interpolates "empty spot" for undefined
    getSpot = (coord: HexCoord): Spot => this.board.getSpot(coord);
    get cursorRawSpot(): Spot | undefined { return this.getRawSpot(this.cursor); }
    get cursorSpot(): Spot { return this.getSpot(this.cursor); }
    get moveQueue(): MovementQueue { return this.state.moveQueue; }

    // Action: Queue a move
    queueMove = (delta: HexCoord, alsoCursor=true) => {
        this.store.dispatch(queueMoveAction(this.cursor, delta));
        if (alsoCursor)
            this.placeCursor(this.cursor.plus(delta));
    };

    // Action: Queue a move one space down
    queueMoveDown = (alsoCursor=true) => {
        this.queueMove(HexCoord.DOWN, alsoCursor);
    };

    // Action: Place the cursor
    placeCursor = (coord: HexCoord) => {
        this.store.dispatch(placeCursorAction(coord));
    };

    // Action: execute a round of queued moves
    doMoves = () => this.store.dispatch(doMovesAction());
}

it('creates game via react-redux', () => {
    const st = new storeTester();
    expect(st.board.spots.size).toEqual(2);
    expect(st.messages.size).toEqual(0);
    const lowLeft = HexCoord.ORIGIN;
    expect(st.getSpot(lowLeft)).toEqual(new Spot(Player.Zero, INITIAL_POP));
});

it('blocks illegal moves', () => {
    const st = new storeTester();
    expect(st.cursor).toBe(HexCoord.NONE);
    expect(st.cursorRawSpot).toBeUndefined();

    // try to move when there's no cursor -- should have no effect
    const boardBefore = st.board;
    expect(st.moveQueue.size).toEqual(0);
    st.queueMoveDown(false);
    expect(st.cursor).toBe(HexCoord.NONE);
    expect(st.moveQueue.size).toEqual(0);

    // trying to move the cursor relative to a nonexistent cursor should throw
    expect(() => st.queueMoveDown(true)).toThrowError();
    expect(st.cursor).toBe(HexCoord.NONE);
    expect(boardBefore).toBe(st.board);  // no moves executed
    st.doMoves(); // still no legit moves requested, so no effective moves
    expect(st.cursor).toBe(HexCoord.NONE);
    expect(st.moveQueue.size).toEqual(0);

    // through all this, the board should be unchanged
    expect(boardBefore === st.board).toBeTruthy();
    // this was causing memory errors for some reason but is working now?
    expect(boardBefore).toBe(st.board);  // no effect on board

    // place cursor outside bounds
    expect(() => st.placeCursor(HexCoord.LEFT_UP)).toThrowError();
    expect(st.cursor).toBe(HexCoord.NONE);
});

it('moves the cursor', () => {
    const st = new storeTester();
    const ul = st.board.edges.upperLeft;
    st.placeCursor(ul);
    st.queueMoveDown();
    expect(st.cursor).toBe(ul.getDown());
    expect(st.cursorRawSpot).toBeUndefined();
});

it('makes real moves', () => {
    const st = new storeTester();

    // place cursor at upper right
    const boardBefore = st.board;
    const ur = st.board.edges.upperRight;
    st.placeCursor(ur);
    expect(st.cursor).toBe(ur);
    expect(st.getRawSpot(ur.getDown())).toBeUndefined();

    st.queueMoveDown();
    expect(boardBefore).toBe(st.board); // only queued -- no board updates yet
    st.doMoves();
    const boardAfter1 = st.board;
    // console.log(`-- moved --\n${boardStateToString(store.getState())}`);
    expect(boardBefore).not.toBe(boardAfter1);  // board updated
    expect(st.cursor).toBe(ur.getDown());
    expect(st.cursorRawSpot).toEqual(new Spot(Player.One, INITIAL_POP - 1));

    // can't move more than 1 space at a time (can't jump)
    const down2 = HexCoord.DOWN.getDown();
    const dest2 = st.cursor.plus(down2);
    // even though the destination is in bounds
    expect((st.board.inBounds(dest2)));
    st.queueMove(down2);
    expect(st.moveQueue.size).toEqual(1);
    expect(st.messages.size).toEqual(0);
    st.doMoves();
    expect(st.moveQueue.size).toEqual(0);
    expect(st.messages.size).toEqual(1);
    // TODO use constants in tags
    expect(st.messages.get(0).tag).toEqual('illegal move');
    // no change occurred due to rejected move
    expect(st.board).toBe(boardAfter1);
    // expect(st.board === boardAfter1).toBeTruthy();
    // but we DID move the cursor
    const down3 = ur.getDown().plus(down2);
    expect(st.cursor).toBe(down3);

    // make a second move down
    st.placeCursor(ur.getDown());
    st.queueMoveDown(false);
    st.doMoves();
    expect(st.cursor === ur.getDown()).toBeTruthy(); // didn't move cursor this time

    const downFromUR = (n: number) =>
        st.getSpot(ur.plus(HexCoord.DOWN.times(n)));
    const human1 = new Spot(Player.One, 1);
    expect(downFromUR(0)).toEqual(human1);
    expect(downFromUR(1)).toEqual(human1);
    expect(downFromUR(2)).toEqual(new Spot(Player.One, INITIAL_POP-2));
    expect(downFromUR(3)).toEqual(new Spot(Player.Nobody, 0));
    expect(downFromUR(3)).toBe(Spot.BLANK);

    // moving contents 1 has no effect
    st.placeCursor(ur.getDown());
    expect(st.cursorSpot.owner).toBe(Player.One);
    const before2 = st.board;
    st.queueMoveDown(false);
    st.doMoves();
    expect(st.getSpot(ur.getDown()).pop).toEqual(1);
    // move had no effect, so board not updated
    expect(st.board).toBe(before2);

    // TODO test that you can't move someone else's stuff?
    // TODO test that multiple players' queued moves all work simultaneously
});

interface OldGridSpotProps {
    spot: Spot;
    selected: boolean;
    coord: HexCoord;

    onSelect?: () => void;
}

const oldGridSpotStyle = (props: OldGridSpotProps) =>
(props.selected ? 'active ' : '') + 'spot ' + props.spot.owner;

export const OldGridSpotView = (props: OldGridSpotProps) => (
    <span
        className={oldGridSpotStyle(props)}
        title={props.spot.owner + ' - ' + props.coord.toString(true)}
        // onClick={props.onSelect}
        onClick={(/*e*/) => props.onSelect && props.onSelect()}
    >
        {props.spot.pop}
    </span>
);

export class OldGridView extends BoardViewBase {
    render(): React.ReactNode {
        return (
            <div
                className="board"
                tabIndex={0}
                onKeyDown={this.onKeyDown}
            >
                {
                    this.props.board.edges.yRange().reverse().map((cy: number) => (
                        <div key={cy}>
                            {
                                this.props.board.edges.xRange().filter( // remove nonexistent
                                    (cx: number) => (cx + cy) % 2 === 0
                                ).map( // turn cartesian into hex
                                    (cx: number) => HexCoord.getCart(cx, cy)
                                ).filter( // only in-bounds
                                    (coord: HexCoord) => this.props.board.inBounds(coord)
                                ).map(
                                    (coord: HexCoord) => (
                                        <OldGridSpotView
                                            spot={this.props.board.getSpot(coord)}
                                            key={coord.id}
                                            selected={coord === this.props.cursor}
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
        );
    }
}
