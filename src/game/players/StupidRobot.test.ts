import {StoreTester} from '../board/view/StoreTester';
import {Player} from './Players';
import {StupidRobot} from './StupidRobot';

it('makes moves', () => {
    const st = new StoreTester(10, 10)
    const stupid = new StupidRobot()
    st.setRobot(Player.Zero, stupid)
    st.setRobot(Player.One, stupid)
    // noinspection PointlessBooleanExpressionJS
    const countNonEmptyHexes = () => st.spots.filter(spot => !!(spot && spot.pop > 0)).size
    // two spots should have non-zero population
    expect(countNonEmptyHexes()).toEqual(2)
    st.queueRobots()
    st.doMoves()
    // after each robot moves once, they should each own 2 hexes -- 4 total
    expect(countNonEmptyHexes()).toEqual(4)
})