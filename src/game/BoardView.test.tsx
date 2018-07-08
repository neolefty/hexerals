import * as React from 'react';
import {createStore} from 'redux';
import * as enzyme from 'enzyme';
import {shallow} from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';

import {movePlayerAction, newGameAction, placeCursorAction} from './BoardActions';
import {Board, Player, Spot, TwoCornersArranger} from './Board';
import {GameReducer, GameState} from './BoardContainer';
import {INITIAL_HEIGHT, INITIAL_POP, INITIAL_WIDTH} from './BoardConstants';
import {HexCoord} from './Hex';
import Dimension from "../Dimension";
import {BoardViewBase} from "./BoardView";

it('renders a spot', () => {
    enzyme.configure({adapter: new Adapter()});
    const board = Board.constructSquare(3, new TwoCornersArranger(5));
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
    const board = Board.constructSquare(n, new TwoCornersArranger(3));
    const view = enzyme.render(
        <OldGridView
            board={board}
            cursor={HexCoord.NONE}
            displaySize={new Dimension(1000, 1000)}
            onMovePlayer={() => {}}
            onPlaceCursor={() => {}}
            onNewGame={() => {}}
            onChangeDisplaySize={() => {}}
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
    const board = Board.constructSquare(3, new TwoCornersArranger(2));
    const ur = board.edges.upperRight;
    const view = enzyme.render(
        <OldGridView
            board={board}
            cursor={ur}
            displaySize={new Dimension(1000, 1000)}
            onPlaceCursor={() => {}}
            onMovePlayer={() => {}}
            onNewGame={() => {}}
            onChangeDisplaySize={() => {}}
        />
    );
    const active = view.find('.active');
    expect(active.length).toEqual(1);  // only one selected
    expect(active[0]).toEqual(view.children()[2]);
});

it('clicks a spot to select it', () => {
    const board = Board.constructSquare(3, new TwoCornersArranger(6));
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
it('controls game flow via react-redux', () => {
    const store = createStore<GameState>(GameReducer);
    // console.log(`before: board ${store.getState().board}; game.board ${store.getState().board.spots.size}`);
    store.dispatch(newGameAction(Board.constructRectangular(
        INITIAL_WIDTH, INITIAL_HEIGHT, new TwoCornersArranger(INITIAL_POP))));
    // console.log(`after: board ${store.getState().board.spots.size}; game.board ${store.getState().board.spots.size}`);
    expect(store.getState().board.spots.size).toEqual(2);
    expect(store.getState().board.spots.get(HexCoord.ORIGIN).pop).toEqual(INITIAL_POP);

    // mover steps moves 1 space down
    const mover = (alsoCursor=true) =>
        store.dispatch(movePlayerAction(HexCoord.DOWN, alsoCursor));
    const curSpot = () => store.getState()
        .board.getSpot(store.getState().cursor);

    expect(mover).toThrowError();  // no cursor
    // place cursor outside bounds
    expect(() => store.dispatch(placeCursorAction(HexCoord.LEFT_UP))).toThrowError();

    // place cursor at upper right
    const ur = store.getState().board.edges.upperRight;
    store.dispatch(placeCursorAction(ur));
    expect(store.getState().cursor).toBe(ur);
    expect(store.getState().board.getSpot(ur.getDown()).pop).toBe(0);
    const before = store.getState().board;
    mover();
    const after = store.getState().board;
    expect(before).not.toBe(after);  // board updated
    expect(store.getState().cursor).toBe(ur.getDown());

    // can't move more than 1 space
    const down2 = HexCoord.DOWN.getDown();
    const dest2 = store.getState().cursor.plus(down2);
    // even though the destination is in bounds
    expect((store.getState().board.inBounds(dest2)));
    expect(() => store.dispatch(movePlayerAction(down2))).toThrowError();
    // no change occurred due to rejected move
    expect(store.getState().board).toBe(after);

    expect(store.getState().cursor).toBe(ur.getDown());
    expect(curSpot()).toEqual(new Spot(Player.One, INITIAL_POP - 1));

    mover(false);
    // didn't move cursor this time
    expect(store.getState().cursor).toBe(ur.getDown());

    const ll = HexCoord.ORIGIN;  // lower left
    const board = store.getState().board;
    expect(board.getSpot(ll)).toEqual(new Spot(Player.Zero, INITIAL_POP));

    const downFromUR = (n: number) =>
        board.getSpot(ur.plus(HexCoord.DOWN.times(n)));
    const human1 = new Spot(Player.One, 1);
    expect(downFromUR(0)).toEqual(human1);
    expect(downFromUR(1)).toEqual(human1);
    expect(downFromUR(2)).toEqual(new Spot(Player.One, INITIAL_POP-2));
    expect(downFromUR(3)).toEqual(new Spot(Player.Nobody, 0));
    expect(downFromUR(3)).toBe(Spot.BLANK);

    // moving contents 1 has no effect
    store.dispatch(placeCursorAction(ur.getDown()));
    expect(store.getState().board.getSpot(store.getState().cursor))
        .toEqual(human1);
    const before2 = store.getState().board;
    mover();
    expect(store.getState().board.spots.get(ur.getDown()).pop).toBe(1);
    // move had no effect, so board not updated
    expect(store.getState().board).toBe(before2);

    // TODO test that you can't move someone else's stuff?
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
