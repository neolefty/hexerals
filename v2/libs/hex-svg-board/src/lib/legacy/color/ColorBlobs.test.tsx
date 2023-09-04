import {Coord} from "./ColorBlobs";

it('coords', () => {
    const a = new Coord(1, 1);
    const b = new Coord(2, 3);
    expect(a.diff(b).x).toEqual(-1);
    expect(a.diff(b).y).toEqual(-2);
    expect(a.copy().mutateScale(3).x).toEqual(3);
    expect(b.copy().mutateScale(3).y).toEqual(9);
    expect(a.x).toEqual(1);
    expect(a.d2(b)).toEqual(5);
    expect(a.copy().mutateAdd(b).x).toEqual(3);
    expect(a.copy().mutateAdd(b).y).toEqual(4);
});