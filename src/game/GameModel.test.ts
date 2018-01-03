import {createStore} from 'redux';
import {movePlayerAction, placeCursorAction} from '../actions';
import {baseReducer, initialState} from '../reducers';
import {StoreState} from '../types';
import {Player, Spot} from './GameModel';

it('controls game flow via react-redux', () => {
    const store = createStore<StoreState>(baseReducer);
    const n = initialState.board.positions.size;
    const p = initialState.board.positions.get(0).pop;
    expect(store.getState().board.positions.size).toEqual(n);
    expect(store.getState().board.positions.get(0).pop).toEqual(p);

    const mover = (alsoCursor=true) =>
        store.dispatch(movePlayerAction(-1, alsoCursor));
    expect(mover).toThrowError();
    expect(() => store.dispatch(placeCursorAction(-1))).toThrowError();
    store.dispatch(placeCursorAction(n-1));
    expect(store.getState().cursor).toBe(n-1);
    expect(store.getState().board.positions.get(n-2).pop).toBe(0);
    const before = store.getState().board;
    mover();

    // can't move more than 1 space
    expect(() => store.dispatch(movePlayerAction(-2))).toThrowError();

    expect(store.getState().board).not.toBe(before);  // board state changed
    expect(store.getState().cursor).toBe(n-2);
    expect(store.getState().board.positions.get(n-2).pop).toBe(p - 1);

    mover(false);
    expect(store.getState().cursor).toBe(n-2); // didn't move cursor this time
    const spots = store.getState().board.positions;
    expect(spots.get(0)).toEqual(new Spot(Player.Compy, p));
    expect(spots.get(n-4)).toEqual(new Spot(Player.Nobody, 0));
    expect(spots.get(n-3)).toEqual(new Spot(Player.Human, p-2));
    expect(spots.get(n-2)).toEqual(new Spot(Player.Human, 1));
    expect(spots.get(n-1)).toEqual(new Spot(Player.Human, 1));

    // moving pop 1 has no effect
    store.dispatch(placeCursorAction(n-1));
    const before2 = store.getState().board;
    mover();
    expect(store.getState().board.positions.get(n-1).pop).toBe(1);
    expect(store.getState().board).toBe(before2);

    // TODO test that you can't move someone else's stuff?
});
