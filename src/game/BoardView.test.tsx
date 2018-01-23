import * as React from 'react';
import { createStore } from 'redux';
import * as enzyme from 'enzyme';
import { shallow } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';

import { placeCursorAction, movePlayerAction } from './BoardActions';
import { Board, Player, Spot } from './Board';
import { BoardReducer, BoardState } from './BoardContainer';
import { BoardView, SpotView } from './BoardView';
import { INITIAL_STATE } from './Constants';
import { HexCoord } from './Hex';

it('renders a spot', () => {
    enzyme.configure({adapter: new Adapter()});
    const board = Board.constructSquare(3, 5);
    const view = enzyme.render(
        <SpotView
            spot={board.getSpot(HexCoord.ORIGIN)} key={0} selected={false}
        />
    );
    expect(view.text()).toEqual('5');
});

it('renders a board with no selection', () => {
    const n = 3; // *** / ** / ***
    const board = Board.constructSquare(n, 3);
    const view = enzyme.render(
        <BoardView
            board={board}
            cursor={HexCoord.NONE}
            onPlaceCursor={() => {}}
            onMovePlayer={() => {}}
        />
    );
    expect(view.children().length).toEqual(n);  // n rows
    const spots = view.find('.spot');
    expect(spots.length).toEqual(8);
    expect(spots.text()).toEqual(('300'+'00'+'003'));
    expect(spots.first().text()).toEqual('3');
    expect(spots[0].attribs['title']).toEqual(Player.Compy);
    // none are selected
    expect(view.find('.active').length).toEqual(0);
});

it('renders a board with a selection', () => {
    // select lower-right corner
    const board = Board.constructSquare(3, 2);
    const lr = board.constraints.extreme(c => - c.cartY() - c.cartX());
    const view = enzyme.render(
        <BoardView
            board={board}
            cursor={lr}
            onPlaceCursor={() => {}}
            onMovePlayer={() => {}}
        />
    );
    const active = view.find('.active');
    expect(active.length).toEqual(1);  // only one selected
    expect(active[0]).toEqual(view.children()[2]);
});

it('clicks a spot to select it', () => {
    const board = Board.constructSquare(3, 6);
    const spot = board.getSpot(board.constraints.extreme(c => - c.cartX() - c.cartY()));
    const props = {
        spot: spot,
        selected: false,
        onSelect: () => props.selected = true,
    };

    const spotWrap = shallow(<SpotView
        spot={props.spot}
        selected={props.selected}
        onSelect={props.onSelect}
    />);

    expect(spotWrap.hasClass('active')).toBeFalsy();
    spotWrap.simulate('click');
    expect(props.selected).toBeTruthy();

    // have to recreate since rendering above uses static reference to props.selected
    expect(shallow(<SpotView spot={props.spot} selected={props.selected}/>)
        .hasClass('active')).toBeTruthy();
});

it('controls game flow via react-redux', () => {
    const store = createStore<BoardState>(BoardReducer);
    const n = INITIAL_STATE.board.spots.size;
    const pop = INITIAL_STATE.board.spots.get(HexCoord.ORIGIN).pop;
    expect(store.getState().board.spots.size).toEqual(n);
    expect(store.getState().board.spots.get(HexCoord.ORIGIN).pop).toEqual(pop);

    // mover steps moves 1 space to the left
    const mover = (alsoCursor=true) =>
        store.dispatch(movePlayerAction(HexCoord.LEFT, alsoCursor));
    const curSpot = () => store.getState().board.getSpot(store.getState().cursor);

    expect(mover).toThrowError();  // no cursor
    // place cursor outside bounds
    expect(() => store.dispatch(placeCursorAction(HexCoord.LEFT))).toThrowError();

    // place cursor at right bottom
    const lr = store.getState().board.edges.lowerRight;
    store.dispatch(placeCursorAction(lr));
    expect(store.getState().cursor).toBe(lr);
    expect(store.getState().board.getSpot(lr.getLeft()).pop).toBe(0);
    const before = store.getState().board;
    mover();
    const after = store.getState().board;
    expect(before).not.toBe(after);  // board updated
    expect(store.getState().cursor).toBe(lr.getLeft());

    // can't move more than 1 space
    const left2 = HexCoord.LEFT.getLeft();
    const dest2 = store.getState().cursor.plus(left2);
    // even though the destination is in bounds
    expect((store.getState().board.inBounds(dest2)));
    expect(() => store.dispatch(movePlayerAction(left2))).toThrowError();
    expect(store.getState().board).toBe(after);  // no change occurred due to rejected move

    expect(store.getState().cursor).toBe(lr.getLeft());
    expect(curSpot()).toEqual(new Spot(Player.Human, pop - 1));

    mover(false);
    expect(store.getState().cursor).toBe(lr.getLeft());  // didn't move cursor this time
    const ul = HexCoord.ORIGIN;
    const board = store.getState().board;
    expect(board.getSpot(ul)).toEqual(new Spot(Player.Compy, pop));
    const leftFromRB = (n: number) => board.getSpot(lr.plus(HexCoord.LEFT.times(n)));
    const human1 = new Spot(Player.Human, 1);
    expect(leftFromRB(0)).toEqual(human1);
    expect(leftFromRB(1)).toEqual(human1);
    expect(leftFromRB(2)).toEqual(new Spot(Player.Human, pop-2));
    expect(leftFromRB(3)).toEqual(new Spot(Player.Nobody, 0));
    expect(leftFromRB(3)).toBe(Spot.BLANK);

    // moving pop 1 has no effect
    store.dispatch(placeCursorAction(lr.getLeft()));
    expect(store.getState().board.getSpot(store.getState().cursor)).toEqual(human1);
    const before2 = store.getState().board;
    mover();
    expect(store.getState().board.spots.get(lr.getLeft()).pop).toBe(1);
    // move had no effect, so board not updated
    expect(store.getState().board).toBe(before2);

    // TODO test that you can't move someone else's stuff?
});