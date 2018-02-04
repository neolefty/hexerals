import {HexCoord, RectangularConstraints} from './Hex';

it('checks hex neighbors', () => {
    expect(HexCoord.ORIGIN.getRightDown()).toBe(HexCoord.RIGHT_DOWN);
    expect(HexCoord.ORIGIN.getUp()).toBe(HexCoord.UP);

    function checkHexNeighbors(c: HexCoord) {
        expect(c.getRightUp()).toBe(c.plus(HexCoord.RIGHT_UP));
        expect(c.getRightDown()).toBe(c.plus(HexCoord.RIGHT_DOWN));
        expect(c.getDown()).toBe(c.plus(HexCoord.DOWN));
        expect(c.getLeftDown()).toBe(c.plus(HexCoord.LEFT_DOWN));
        expect(c.getLeftUp()).toBe(c.plus(HexCoord.LEFT_UP));
        expect(c.getUp()).toBe(c.plus(HexCoord.UP));

        expect(c.getRightDown().getUp().getLeftDown()).toBe(c); // triangle
        expect(c.getLeftUp().getDown().getRightUp()).toBe(c); // triangle
        expect(c.getLeftUp().getLeftDown().getDown()
            .getRightDown().getRightUp().getUp()).toBe(c); // hexagon loop

        expect(c.getUp().cartY()).toBe(c.cartY() + 2);
        expect(c.getUp().cartX()).toBe(c.cartX());
        expect(c.getLeftDown().cartX()).toBe(c.cartX() - 1);
        expect(c.getLeftDown().cartY()).toBe(c.cartY() - 1);
        expect(c.getLeftUp().cartY()).toBe(c.cartY() + 1);
    }

    checkHexNeighbors(HexCoord.ORIGIN);
    checkHexNeighbors(HexCoord.ORIGIN.getDown());
    checkHexNeighbors(HexCoord.ORIGIN.getRightUp());
    expect(HexCoord.NONE.getRightUp()).toBe(HexCoord.NONE); // true, but is it what we want?

    function r() { return Math.floor(Math.random() * 20); } // 0 - 19
    for (let i = 0; i < 20; ++i) {
        const x = r(), y = r();
        checkHexNeighbors(HexCoord.get(x, y, - x - y));
    }
});

const timeRect = (w: number, h: number) => {
    // const start = new Date();
    const constraints = new RectangularConstraints(w, h);
    const n = constraints.all().size;
    expect(n).toBe(w * h - Math.trunc(h / 2));
    // const elapsed = new Date().getTime() - start.getTime();
    // const msPerCell = elapsed / n;
    // const cellPerMs = Math.round(100/msPerCell) / 100;
    // console.log(`Elapsed for ${ w } x ${ h } rectangular constraints: ${
    //     elapsed } ms -- ${ cellPerMs } cell per ms / ${ msPerCell } ms per cell`);
};

it('checks small and medium boards constraints', () => {
    [ 1, 10, 50, 100, 200, 200 ].forEach(n => timeRect(n, n));
});

// it('checks large boards constraints', () => {
//     [ 500, 1000 ].forEach(n => timeRect(n, n));
// });