import {HexCoord, RectangularConstraints} from './Hex';

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

const timeRect = (w: number, h: number) => {
    const start = new Date();
    const constraints = new RectangularConstraints(w, h);
    const n = constraints.all().size;
    expect(n).toBe(w * h - Math.trunc(h / 2));
    const elapsed = new Date().getTime() - start.getTime();
    const msPerCell = elapsed / n;
    console.log(`Elapsed for ${ w } x ${ h } rectangular constraints: ${ 
        elapsed } ms -- ${ msPerCell } ms per cell`);
};

it('checks small and medium boards constraints', () => {
    [ 1, 10, 50, 100, 200 ].forEach(n => timeRect(n, n));
});

// it('checks large boards constraints', () => {
//     [ 500, 1000 ].forEach(n => timeRect(n, n));
// });