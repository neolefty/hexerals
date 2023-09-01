import {CycleReducerTester} from './CycleReducerTester';
import {StatusMessage} from '../../../common/StatusMessage';
import {TAG_MAP_TOO_SMALL} from '../setup/TileArranger';
import {Player} from '../players/Players';
import {Hex} from '../hex/Hex'

it('small maps generate warning', () => {
    [true, false].forEach(b => {
        const crt: CycleReducerTester = new CycleReducerTester()
        crt.useSpreadArranger(b)
        crt.openLocalGame(1, 1)
        expect(crt.messages.size).toBe(1)
        expect(crt.messages.first(StatusMessage.BLANK).tag === TAG_MAP_TOO_SMALL)
    })
})

it('non-random arranger is corners', () => {
    const crt = new CycleReducerTester()
    crt.useSpreadArranger(false)
    crt.openLocalGame()
    expect(crt.getTile(crt.ll).owner).toBe(Player.Zero)
    expect(crt.getTile(crt.ur).owner).toBe(Player.One)
})

it('increments population at non-default intervals', () => {
    const crt = new CycleReducerTester()
    const turn = () => crt.localBoard ? crt.localBoard.turn : -1
    crt.changeLocalOption('roundTicks', 4)
    crt.changeLocalOption('startingPop', 10)
    crt.useSpreadArranger(false)
    crt.openLocalGame()
    crt.queueMove(crt.ll)
    crt.doMoves()
    crt.tick(3)
    expect(turn()).toBe(3)
    expect(crt.getTile(Hex.UP).pop).toBe(9)
    crt.tick()
    expect(turn()).toBe(4)
    expect(crt.getTile(Hex.UP).pop).toBe(10)
})