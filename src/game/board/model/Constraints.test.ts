import {List} from 'immutable';

import {CornersPlayerArranger} from './PlayerArranger';
import {Hex} from './Hex';
import {Board} from './Board';
import {pickNPlayers} from './players/Players';
import {BoardConstraints} from './Constraints';

it('checks rectangular board geometry', () => {
    const arr = [new CornersPlayerArranger()]
    const twoPlayers = pickNPlayers(2)
    expect(Board.constructRectangular(9, 3, twoPlayers, arr).constraints.all().size)
        .toBe(5 * 3 + 4 * 2)

    expect(Board.constructRectangular(19, 10.5, twoPlayers, arr).constraints.all().size)
        .toBe(10 * 10 + 10 * 9)
    const nineByTwalf = Board.constructRectangular(9, 2.5, twoPlayers, arr)
    // _ - _ - _ - _ - _  <-- upper-right is at cartesian (7, 3)
    // _ - _ - _ - _ - _
    expect(nineByTwalf.constraints.extreme(x => x.cartX).cartX).toBe(0)  // left 0
    expect(nineByTwalf.constraints.extreme(x => x.cartY).cartY).toBe(0)  // top 0
    expect(nineByTwalf.constraints.extreme(x => - x.cartX).cartX).toBe(8)  // right 8
    expect(nineByTwalf.constraints.extreme(x => - x.cartY).cartY).toBe(3)  // bottom 3
    expect(nineByTwalf.constraints.extreme(
        // cartY is first digit, cartX is second digit
        x => x.cartX + 10 * x.cartY, BoardConstraints.GT
    ) === Hex.getCart(7, 3)).toBeTruthy() // bottom right

    expect(nineByTwalf.edges.width).toEqual(9)
    expect(nineByTwalf.edges.height).toEqual(4)
    expect(nineByTwalf.edges.xRange().count()).toEqual(9)
    expect(List<number>(nineByTwalf.edges.xRange()))
        .toEqual(List<number>([0, 1, 2, 3, 4, 5, 6, 7, 8]))
    expect(List<number>(nineByTwalf.edges.yRange()))
        .toEqual(List<number>([0, 1, 2, 3]))

    // for some reason, these both cause a stack overflow:
    // expect(upperLeft === Hex.ORIGIN).toBeTruthy()
    // expect(upperLeft).toEqual(Hex.ORIGIN)
    expect(nineByTwalf.edges.upperLeft === Hex.ORIGIN).toBeFalsy()
    expect(nineByTwalf.edges.upperLeft === Hex.getCart(1, 3)).toBeTruthy()
    expect(nineByTwalf.edges.upperRight === Hex.getCart(7, 3)).toBeTruthy()
    expect(nineByTwalf.edges.lowerRight === Hex.getCart(8, 0)).toBeTruthy()
    expect(nineByTwalf.edges.lowerLeft === Hex.ORIGIN).toBeTruthy()
    // expect(nineByTwalf.edges.upperLeft === Hex.getCart(1, 3)).toBeTruthy()
    // expect(nineByTwalf.edges.upperRight === Hex.getCart(7, 3)).toBeTruthy()
    // expect(nineByTwalf.edges.lowerRight === Hex.getCart(8, 0)).toBeTruthy()
    // expect(nineByTwalf.edges.lowerLeft === Hex.ORIGIN).toBeTruthy()
})