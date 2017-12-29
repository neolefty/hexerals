import {Board, Move, Player, Spot} from './GameModel';
import {GamePlayerControl} from './GameControl';

it('game model basics', () => {
    const n = 10;
    const control = new GamePlayerControl(Player.HUMAN, Board.construct(n, 4));
    const mover = () => control.createMove(-1);
    expect(mover).toThrowError();
    control.cursor = n;
    expect(mover).toThrowError();

    control.cursor = 9;
    expect(mover()).toEqual(new Move(9, -1));
    expect(mover().dest()).toEqual(8);

    control.apply(mover());
    expect(control.board.getSpot(0)).toEqual(new Spot(Player.COMPY, 4));
    expect(control.board.getSpot(7)).toEqual(new Spot(Player.NOBODY, 0));
    expect(control.board.getSpot(8)).toEqual(new Spot(Player.HUMAN, 3));
    expect(control.board.getSpot(9)).toEqual(new Spot(Player.HUMAN, 1));

    control.cursor = 1;  // no owner, 0 pop
    expect(control.getCursorSpot()).toEqual(new Spot(Player.NOBODY, 0));
    expect(mover).toThrowError();  // can't move someone else's stuff
    control.cursor = 9;
    expect(control.getCursorSpot()).toEqual(new Spot(Player.HUMAN, 1));
    const same: Board = control.board.apply(mover());  // can't move pop 1
    expect(same).toBe(control.board);
});
