import {packSquares} from './PackSquares'
import {CartPair} from '../../../common/CartPair'

it('handles simple cases', () => {
    expect(packSquares(1, 1).equals(new CartPair(1, 1))).toBeTruthy()
    expect(packSquares(2, 2).equals(new CartPair(2, 1))).toBeTruthy()
    expect(packSquares(2, .5).equals(new CartPair(1, 2))).toBeTruthy()
    expect(packSquares(5, .9).equals(new CartPair(2, 3))).toBeTruthy()
    expect(packSquares(5, 1.1).equals(new CartPair(3, 2))).toBeTruthy()
    expect(packSquares(1000, 1000).equals(new CartPair(1000, 1))).toBeTruthy()
    expect(packSquares(1000, 0.001).equals(new CartPair(1, 1000))).toBeTruthy()
})

it ('fills the space', () => {
    // 4x2 fits just as well as 3x2
    expect(packSquares(6, 2).equals(new CartPair(4, 2))).toBeTruthy()
    expect(packSquares(5, .5).equals(new CartPair(2, 4))).toBeTruthy()
})