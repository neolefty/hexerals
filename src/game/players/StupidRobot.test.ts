import {BoardReducerTester} from '../board/view/BoardReducerTester';
import {Player} from './Players';
import {StupidRobot} from './StupidRobot';

it('makes moves', () => {
    const brt = new BoardReducerTester(10, 10)
    const stupid = new StupidRobot()
    brt.setRobot(Player.Zero, stupid)
    brt.setRobot(Player.One, stupid)
    const countNonEmptyHexes = () =>
        brt.board.filterTiles(tile => tile.pop > 0).size
    // two tiles should have non-zero population
    expect(countNonEmptyHexes()).toEqual(2)
    brt.queueRobots()
    brt.doMoves()
    // after each robot moves once, they should each own 2 hexes -- 4 total
    expect(countNonEmptyHexes()).toEqual(4)
})