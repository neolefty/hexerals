import {HexMove, PlayerMove} from './Move';
import {Hex} from './Hex';
import {Player} from './players/Players';
import {Set} from 'immutable';

it('HexMove compares', () => {
    const up = new HexMove(Hex.ORIGIN, Hex.UP)
    const down = new HexMove(Hex.ORIGIN, Hex.DOWN)
    const up2 = new HexMove(Hex.ORIGIN, Hex.UP)
    expect(up.equals(up2)).toBeTruthy()
    expect(down.equals(up)).toBeFalsy()
})

it('PlayerMove compares', () => {
    const upOne1 = PlayerMove.construct(
        Player.One, new HexMove(Hex.ORIGIN, Hex.UP), 1)
    const downOne1 = PlayerMove.construct(
        Player.One, new HexMove(Hex.ORIGIN, Hex.DOWN), 1)
    const upOne2 = PlayerMove.construct(
        Player.One, new HexMove(Hex.ORIGIN, Hex.UP), 2)
    const upTwo1 = PlayerMove.construct(
        Player.Two, new HexMove(Hex.ORIGIN, Hex.UP), 1)
    expect(upOne1.equals(upOne2)).toBeTruthy()
    expect(upOne1.equals(downOne1)).toBeFalsy()
    expect(upOne1.equals(upTwo1)).toBeFalsy()

    const moves = Set<PlayerMove>([upOne1, upOne2, downOne1])
    expect(moves.size).toBe(2)
})
