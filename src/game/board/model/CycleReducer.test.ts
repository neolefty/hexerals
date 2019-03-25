import {CycleReducerTester} from './CycleReducerTester';
import {StatusMessage} from '../../../common/StatusMessage';
import {MAP_TOO_SMALL} from './Arranger';
import {Player} from './players/Players';

it('small maps generate warning', () => {
    [true, false].forEach(b => {
        const crt: CycleReducerTester = new CycleReducerTester()
        crt.useSpreadArranger(b)
        crt.openLocalGame(1, 1)
        expect(crt.messages.size).toBe(1)
        expect(crt.messages.first(StatusMessage.BLANK).tag === MAP_TOO_SMALL)
    })
})

it ('non-random arranger is corners', () => {
    const crt = new CycleReducerTester()
    crt.useSpreadArranger(false)
    crt.openLocalGame()
    expect(crt.getTile(crt.ll).owner).toBe(Player.Zero)
    expect(crt.getTile(crt.ur).owner).toBe(Player.One)
})