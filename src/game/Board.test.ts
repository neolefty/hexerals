import {List} from 'immutable';
import {Board, Spot} from './Board';
import {BoardConstraints, HexCoord} from './Hex';

it('checks rectangular board geometry', () => {
    expect(Board.constructSquare(5).constraints.all().size)
        .toBe(5 * 3 + 4 * 2);
    expect(Board.constructRectangular(10, 20).constraints.all().size)
        .toBe(10 * 10 + 10 * 9);
    const fiveByFour = Board.constructRectangular(5, 4);
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
        x => x.cartX() + 10 * x.cartY(), BoardConstraints.GT
    )).toBe(HexCoord.getCart(7, 3)); // bottom right

    expect(fiveByFour.edges.width).toEqual(9);
    expect(fiveByFour.edges.height).toEqual(4);
    expect(fiveByFour.edges.xRange().count()).toEqual(9);
    expect(List<number>(fiveByFour.edges.xRange()))
        .toEqual(List<number>([0, 1, 2, 3, 4, 5, 6, 7, 8]));
    expect(List<number>(fiveByFour.edges.yRange()))
        .toEqual(List<number>([0, 1, 2, 3]));
    expect(fiveByFour.edges.lowerLeft).toBe(HexCoord.getCart(1, 3));
    expect(fiveByFour.edges.lowerRight).toBe(HexCoord.getCart(7, 3));
    expect(fiveByFour.edges.upperRight).toBe(HexCoord.getCart(8, 0));
    expect(fiveByFour.edges.upperLeft).toBe(HexCoord.ORIGIN);
});

it('converts between hex and cartesian coords', () => {
    const w = 11, h = 5;
    const tenByFive = Board.constructRectangular(w, h);
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
    expect(midHex).toBe(HexCoord.get(2, -4, 2));
    expect(tenByFive.getCartSpot(6, 2)).toBe(Spot.BLANK);
});

it('navigates around a board', () => {
    const sixByTen = Board.constructRectangular(6, 10, 20);
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