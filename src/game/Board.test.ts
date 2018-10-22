import * as assert from 'assert';
import {List} from 'immutable';
import {Board, Spot, TwoCornersArranger} from './Board';
import {BoardConstraints, HexCoord} from './Hex';
import {pickNPlayers, Player} from './Players';
import {StatusMessage} from '../StatusMessage';
import {PlayerMove} from './MovementQueue';

// noinspection JSUnusedGlobalSymbols
export function printBoard(board: Board) {
    let out = '';
    board.edges.yRange().reverse().forEach((y: number) => {
        let line = '';
        board.edges.xRange().forEach((x: number) => {
            let c = ' ';
            if ((x + y) % 2 === 0 && board.inBounds(HexCoord.getCart(x, y))) {
                const spot = board.getCartSpot(x, y);
                if (spot.owner === Player.Two)
                    c = spot.pop === 0 ? 'o' : (spot.pop === 1 ? 'p' : 'P');
                else if (spot.owner === Player.One)
                    c = spot.pop === 0 ? '=' : (spot.pop === 1 ? 'c' : 'C');
                else
                    c = '-';
            }
            line += c;
        });
        out += line + '\n';
        // console.log(line);
    });
    console.log(out);
}

it('checks rectangular board geometry', () => {
    const arr = new TwoCornersArranger();
    const twoPlayers = pickNPlayers(2);
    expect(Board.constructSquare(5, twoPlayers, arr).constraints.all().size)
        .toBe(5 * 3 + 4 * 2);

    expect(Board.constructRectangular(10, 20, twoPlayers, arr).constraints.all().size)
        .toBe(10 * 10 + 10 * 9);
    const fiveByFour = Board.constructRectangular(5, 4, twoPlayers, arr);
    // _ - _ - _ - _ - _  <-- upper-right is at cartesian (7, 3)
    // _ - _ - _ - _ - _
    expect(fiveByFour.constraints.extreme(x => x.cartX()).cartX()).toBe(0);  // left 0
    expect(fiveByFour.constraints.extreme(x => x.cartY()).cartY()).toBe(0);  // top 0
    expect(fiveByFour.constraints.extreme(x => - x.cartX()).cartX()).toBe(8);  // right 8
    expect(fiveByFour.constraints.extreme(x => - x.cartY()).cartY()).toBe(3);  // bottom 3
    expect(fiveByFour.constraints.extreme(
        // cartY is first digit, cartX is second digit
        x => x.cartX() + 10 * x.cartY(), BoardConstraints.GT
    )).toBe(HexCoord.getCart(7, 3)); // bottom right

    expect(fiveByFour.edges.width).toEqual(9);
    expect(fiveByFour.edges.height).toEqual(4);
    expect(fiveByFour.edges.xRange().count()).toEqual(9);
    expect(List<number>(fiveByFour.edges.xRange()))
        .toEqual(List<number>([0, 1, 2, 3, 4, 5, 6, 7, 8]));
    expect(List<number>(fiveByFour.edges.yRange()))
        .toEqual(List<number>([0, 1, 2, 3]));

    // for some reason, these both cause a stack overflow:
    // expect(upperLeft).toBe(HexCoord.ORIGIN);
    // expect(upperLeft).toEqual(HexCoord.ORIGIN);
    expect(fiveByFour.edges.upperLeft === HexCoord.ORIGIN).toBeFalsy();
    expect(fiveByFour.edges.upperLeft === HexCoord.getCart(1, 3)).toBeTruthy();
    expect(fiveByFour.edges.upperRight === HexCoord.getCart(7, 3)).toBeTruthy();
    expect(fiveByFour.edges.lowerRight === HexCoord.getCart(8, 0)).toBeTruthy();
    expect(fiveByFour.edges.lowerLeft === HexCoord.ORIGIN).toBeTruthy();
    // expect(fiveByFour.edges.upperLeft).toBe(HexCoord.getCart(1, 3));
    // expect(fiveByFour.edges.upperRight).toBe(HexCoord.getCart(7, 3));
    // expect(fiveByFour.edges.lowerRight).toBe(HexCoord.getCart(8, 0));
    // expect(fiveByFour.edges.lowerLeft).toBe(HexCoord.ORIGIN);
});

it('converts between hex and cartesian coords', () => {
    const w = 11, h = 5;
    const tenByFive = Board.constructRectangular(
        w, h, pickNPlayers(2), new TwoCornersArranger());
    // h x w, but every other row (that is, h/2 rows) is short by 1
    expect(tenByFive.constraints.all().size == w * h - Math.trunc(h/2));

    // returns a function that, when called,
    const metaCartSpot = (cx: number, cy: number) => (
        () => tenByFive.getCartSpot(cx, cy)
    );

    expect(metaCartSpot(6, 3)).toThrow();  // assert sum is even
    expect(metaCartSpot(-1, -1)).toThrow();  // out of bounds
    expect(metaCartSpot(w, h)).toThrow();  // out of bounds
    expect(metaCartSpot(w, 0)).toThrow();  // out of bounds
    expect(metaCartSpot(0, h)).toThrow();  // out of bounds

    const midHex = HexCoord.getCart(6, 2);
    expect(midHex === HexCoord.get(6, -2, -4)).toBeTruthy();
    // expect(midHex).toBe(HexCoord.get(6, -2, -4));
    expect(tenByFive.getCartSpot(6, 2)).toBe(Spot.BLANK);
});

it('navigates around a board', () => {
    const sixByTen = Board.constructRectangular(
        6, 10, pickNPlayers(2), new TwoCornersArranger(20));
    expect(sixByTen.inBounds(HexCoord.ORIGIN)).toBeTruthy();
    expect(sixByTen.constraints.all().contains(HexCoord.ORIGIN)).toBeTruthy();
    expect(sixByTen.inBounds(HexCoord.NONE)).toBeFalsy();
    expect(sixByTen.constraints.all().contains(HexCoord.NONE)).toBeFalsy();

    // staggered walk from origin to the right edge
    let c = HexCoord.ORIGIN;
    while (sixByTen.inBounds(c.getRightUp().getRightDown())) {
        c = c.getRightUp().getRightDown();
        expect(sixByTen.constraints.all().contains(c));
    }
    expect(c === sixByTen.edges.lowerRight).toBeTruthy();
    assert(c === sixByTen.edges.lowerRight);
    expect(c).toEqual(sixByTen.edges.lowerRight);
    expect(c).toBe(sixByTen.edges.lowerRight);
    expect(c.x).toBe(10);

    expect(
        HexCoord.ORIGIN.plus(HexCoord.RIGHT_UP).plus(HexCoord.UP)
    ).toBe(HexCoord.getCart(1, 3));
    // This causes a stack overflow in V8, where === does not. Why?
    // See jest source code -- packages/expect/matchers.js and
    // possibly packages/jest-matcher-utils/src. Could stringification be
    // the culprit, maybe with HexCoord.neighborsCache? Is there a way to hide that?
    // Or is it something else (probably)?
    // expect(
    //     HexCoord.ORIGIN.plus(HexCoord.RIGHT_UP).plus(HexCoord.UP)
    // ).toBe(HexCoord.getCart(1, 5));
});

it('validates moves', () => {
    const threeByFour = Board.constructRectangular(
        3, 4, pickNPlayers(2), new TwoCornersArranger(20));
    const messages: StatusMessage[] = [];
    const options = threeByFour.validateOptions(messages);

    expect(threeByFour.validate(PlayerMove.construct(
        Player.Zero, threeByFour.edges.lowerLeft, HexCoord.UP))).toBeTruthy();
    expect(threeByFour.edges.lowerLeft).toEqual(HexCoord.ORIGIN);
    expect(threeByFour.validate(PlayerMove.construct(
        Player.One, threeByFour.edges.upperRight, HexCoord.DOWN))).toBeTruthy();

    // would go off the board
    expect(threeByFour.validate(PlayerMove.construct(
        Player.One, threeByFour.edges.upperRight, HexCoord.UP
    ), options)).toBeFalsy();
    expect(messages[messages.length-1].tag).toBe('out of bounds');
    expect(messages[messages.length-1].msg.startsWith('destination')).toBeTruthy();

    // would start off the board
    expect(threeByFour.validate(PlayerMove.construct(
        Player.Zero, HexCoord.DOWN, HexCoord.UP
    ), options)).toBeFalsy();
    expect(messages[messages.length-1].tag).toBe('out of bounds');
    expect(messages[messages.length-1].msg.startsWith('start')).toBeTruthy();

    // too far
    expect(threeByFour.validate(PlayerMove.construct(
        Player.Zero, HexCoord.ORIGIN, HexCoord.RIGHT_UP.plus(HexCoord.RIGHT_UP)
    ), options)).toBeFalsy();
    expect(messages[messages.length-1].tag).toBe('illegal move');
    expect(messages[messages.length-1].msg.includes('2')).toBeTruthy();

    // wrong owner
    const oneOriginUp = PlayerMove.construct(
        Player.One, HexCoord.ORIGIN, HexCoord.UP);
    expect(threeByFour.validate(oneOriginUp, options)).toBeFalsy();
    expect(messages[messages.length-1].tag).toBe('wrong player');
    expect(threeByFour.validate(oneOriginUp)).toBeFalsy();

    // pop of only 1
    const moved = threeByFour.applyMove(PlayerMove.construct(
        Player.Zero, HexCoord.ORIGIN, HexCoord.UP)).board;
    const movedOptions = moved.validateOptions(messages);
    expect(moved.validate(PlayerMove.construct(
        Player.Zero, HexCoord.ORIGIN, HexCoord.UP
    ), movedOptions)).toBeFalsy();
    expect(messages[messages.length-1].tag).toBe('insufficient population');
    movedOptions.ignoreSmallPop = true;
    expect(moved.validate(PlayerMove.construct(
        Player.Zero, HexCoord.ORIGIN, HexCoord.UP
    ), movedOptions)).toBeTruthy();
});