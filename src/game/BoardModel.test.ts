import { createStore } from 'redux';
import { movePlayerAction, placeCursorAction } from '../actions';
import {INITIAL_HEIGHT, INITIAL_STATE, INITIAL_WIDTH} from '../constants';
import { baseReducer} from '../reducers';
import { StoreState } from '../types';
import {HexBoardConstraints, HexCoord} from './Hex';
import {HexBoard, Player} from './HexBoard';
import { Spot } from './HexBoard';

it('checks rectangular board sizes', () => {
    expect(HexBoard.constructSquare(5).constraints.all().size)
        .toBe(5 * 3 + 4 * 2);
    expect(HexBoard.constructRectangular(10, 20).constraints.all().size)
        .toBe(10 * 10 + 10 * 9);
    const fiveByFour = HexBoard.constructRectangular(5, 4);
    // * * * * *
    //  * * * *
    // * * * * *
    //  * * * *  <-- lower-right is at cartesian (7, 3)
    expect(fiveByFour.constraints.extreme(x => x.cartX()).cartX()).toBe(0);  // left 0
    expect(fiveByFour.constraints.extreme(x => x.cartY()).cartY()).toBe(0);  // top 0
    expect(fiveByFour.constraints.extreme(x => - x.cartX()).cartX()).toBe(8);  // right 8
    expect(fiveByFour.constraints.extreme(x => - x.cartY()).cartY()).toBe(3);  // bottom 3
    expect(fiveByFour.constraints.extreme(
        // cartY is first digit, cartX is second digit
        x => x.cartX() + 10 * x.cartY(), HexBoardConstraints.GT
    )).toBe(HexCoord.getCart(7, 3)); // bottom right
});

it('checks hex neighbors', () => {
    expect(HexCoord.ORIGIN.getRight()).toBe(HexCoord.RIGHT);
    expect(HexCoord.ORIGIN.getLeftDown()).toBe(HexCoord.LEFT_DOWN);

    function checkHexNeighbors(c: HexCoord) {
        expect(c.getRight()).toBe(c.plus(HexCoord.RIGHT));
        expect(c.getLeft()).toBe(c.plus(HexCoord.LEFT));
        expect(c.getLeftDown()).toBe(c.plus(HexCoord.LEFT_DOWN));
        expect(c.getLeftUp()).toBe(c.plus(HexCoord.LEFT_UP));
        expect(c.getRightDown()).toBe(c.plus(HexCoord.RIGHT_DOWN));
        expect(c.getRightUp()).toBe(c.plus(HexCoord.RIGHT_UP));

        expect(c.getRight().getLeftDown().getLeftUp()).toBe(c); // triangle
        expect(c.getLeftUp().getLeftDown().getRight()).toBe(c); // triangle
        expect(c.getLeft().getLeftDown().getRightDown()
            .getRight().getRightUp().getLeftUp()).toBe(c); // hexagon loop

        expect(c.getRight().cartX()).toBe(c.cartX() + 2);
        expect(c.getRight().cartY()).toBe(c.cartY());
        expect(c.getLeftDown().cartX()).toBe(c.cartX() - 1);
        expect(c.getLeftDown().cartY()).toBe(c.cartY() + 1);
        expect(c.getLeftUp().cartY()).toBe(c.cartY() - 1);
    }

    checkHexNeighbors(HexCoord.ORIGIN);
    checkHexNeighbors(HexCoord.ORIGIN.getRight());
    checkHexNeighbors(HexCoord.ORIGIN.getLeftDown());
    expect(HexCoord.NONE.getRight()).toBe(HexCoord.NONE); // true, but is it what we want?

    function r() { return Math.floor(Math.random() * 20); } // 0 - 19
    for (let i = 0; i < 20; ++i) {
        const x = r(), y = r();
        checkHexNeighbors(HexCoord.get(x, y, - x - y));
    }
});

it('navigates around a board', () => {
    const sixByTen = HexBoard.constructRectangular(6, 10, 20);
    expect(sixByTen.inBounds(HexCoord.ORIGIN)).toBeTruthy();
    expect(sixByTen.constraints.all().contains(HexCoord.ORIGIN)).toBeTruthy();
    expect(sixByTen.inBounds(HexCoord.NONE)).toBeFalsy();
    expect(sixByTen.constraints.all().contains(HexCoord.NONE)).toBeFalsy();

    // walk from origin RIGHT to the edge
    let c = HexCoord.ORIGIN;
    while (sixByTen.inBounds(c)) {
        c = c.getRight();
        expect(sixByTen.constraints.all().contains(c));
    }
    expect(c.x).toBe(6);

    expect(
        HexCoord.ORIGIN.plus(HexCoord.LEFT_DOWN).plus(HexCoord.LEFT)
    ).toBe(HexCoord.getCart(-3, 1));
});

it('controls game flow via react-redux', () => {
    const store = createStore<StoreState>(baseReducer);
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
    const rb = HexCoord.getCart(INITIAL_WIDTH * 2 - 2, INITIAL_HEIGHT - 1);
    store.dispatch(placeCursorAction(rb));
    expect(store.getState().cursor).toBe(rb);
    expect(store.getState().board.getSpot(rb.getLeft()).pop).toBe(0);
    const before = store.getState().board;
    mover();
    const after = store.getState().board;
    expect(before).not.toBe(after);  // board updated
    expect(store.getState().cursor).toBe(rb.getLeft());

    // can't move more than 1 space
    const left2 = HexCoord.LEFT.getLeft();
    const dest2 = store.getState().cursor.plus(left2);
    // even though the destination is in bounds
    expect((store.getState().board.inBounds(dest2)));
    expect(() => store.dispatch(movePlayerAction(left2))).toThrowError();
    expect(store.getState().board).toBe(after);  // no change occurred due to rejected move

    expect(store.getState().cursor).toBe(rb.getLeft());
    expect(curSpot()).toEqual(new Spot(Player.Human, pop - 1));

    mover(false);
    expect(store.getState().cursor).toBe(rb.getLeft());  // didn't move cursor this time
    const ul = HexCoord.ORIGIN;
    const board = store.getState().board;
    expect(board.getSpot(ul)).toEqual(new Spot(Player.Compy, pop));
    const leftFromRB = (n: number) => board.getSpot(rb.plus(HexCoord.LEFT.times(n)));
    const human1 = new Spot(Player.Human, 1);
    expect(leftFromRB(0)).toEqual(human1);
    expect(leftFromRB(1)).toEqual(human1);
    expect(leftFromRB(2)).toEqual(new Spot(Player.Human, pop-2));
    expect(leftFromRB(3)).toEqual(new Spot(Player.Nobody, 0));
    expect(leftFromRB(3)).toBe(Spot.BLANK);

    // moving pop 1 has no effect
    store.dispatch(placeCursorAction(rb.getLeft()));
    expect(store.getState().board.getSpot(store.getState().cursor)).toEqual(human1);
    const before2 = store.getState().board;
    mover();
    expect(store.getState().board.spots.get(rb.getLeft()).pop).toBe(1);
    // move had no effect, so board not updated
    expect(store.getState().board).toBe(before2);

    // TODO test that you can't move someone else's stuff?
});
