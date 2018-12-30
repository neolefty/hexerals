import {Board} from './Board';
import {List} from 'immutable';
import {floodShortestPath} from './ShortestPath';
import {Hex} from './Hex';

it ('finds a simple shortest path', () => {
    const ten = Board.constructSquare(10, List())
    // edges.lowerRight is not the rightmost; it's (8, 0)
    const [ ll, ul, lr, ur ] = [ ten.edges.lowerLeft, ten.edges.upperLeft, Hex.getCart(9, 1), ten.edges.upperRight ]
    expect(ll === Hex.ORIGIN).toBeTruthy()
    expect(ul === Hex.getCart(0, 18)).toBeTruthy()
    expect(ul.minus(ll).maxAbs()).toBe(9)
    expect(lr.minus(ll).maxAbs()).toBe(9)
    expect(lr.minus(ul).maxAbs()).toBe(13)

    const simpleShortest = (a: Hex, b: Hex) => {
        // console.log(`path from ${a.toString()} to ${b.toString()} — manhattan ${a.minus(b).maxAbs()}`)
        const path = floodShortestPath(ten.allHexes, a, b)
        // console.log(`  --> ${hexesToString(path)}`)
        expect(path.size).toBe(b.minus(a).maxAbs() + 1)
        expect(path.first() === a).toBeTruthy()
        expect(path.last() === b).toBeTruthy()
    }

    simpleShortest(ll, ul)
    simpleShortest(ul, ll)
    simpleShortest(ll, lr)
    simpleShortest(lr, ul)
    simpleShortest(lr, ur)
})