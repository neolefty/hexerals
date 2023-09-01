import {MovementQueue, QueueAndMoves} from './MovementQueue';
import {Player} from '../players/Players';
import {Hex} from '../hex/Hex';
import {PlayerMove} from './Move';

it('checks sanity', () => {
    const q0 = new MovementQueue();
    expect(q0.popEach(() => true)).toBeUndefined();
    expect(q0.size).toBe(0);
    const q1 = q0.addMove(PlayerMove.constructDelta(
        Player.Zero, Hex.ORIGIN, Hex.DOWN));
    expect(q1.size).toBe(1);
    expect(q0.size).toBe(0);
    const q2 = q1.addMove(PlayerMove.constructDelta(
        Player.Zero, Hex.DOWN, Hex.DOWN));
    expect(q2.size).toBe(2);
    const q3 = q2.addMove(PlayerMove.constructDelta(
        Player.One, Hex.ORIGIN, Hex.UP));
    expect(q3.size).toBe(3);

    expect(q3.playerIsQueuedTo(
        Player.Zero, Hex.DOWN.plus(Hex.DOWN))).toBeTruthy();
    expect(q3.playerIsQueuedTo(Player.Zero, Hex.LEFT_UP)).toBeFalsy();
    const q4 = q3.addMove(PlayerMove.constructDelta(
        Player.Zero, Hex.UP, Hex.LEFT_DOWN));
    expect(q4.playerIsQueuedTo(Player.Zero, Hex.LEFT_UP)).toBeTruthy();
});

it('pops', () => {
    // empty queue always undefined
    expect(new MovementQueue().popEach(() => true)).toBeUndefined();

    const p0_originDown = PlayerMove.constructDelta(
        Player.Zero, Hex.ORIGIN, Hex.DOWN);
    const p1_originDown = PlayerMove.constructDelta(
        Player.One, Hex.ORIGIN, Hex.DOWN);

    const q = new MovementQueue()

        .addMove(p0_originDown)
        .addMove(PlayerMove.constructDelta(Player.Zero, Hex.DOWN, Hex.DOWN))
        .addMove(PlayerMove.constructDelta(Player.Zero, Hex.ORIGIN, Hex.UP))

        .addMove(PlayerMove.constructDelta(Player.One, Hex.DOWN, Hex.LEFT_UP))
        .addMove(p1_originDown)
        .addMove(PlayerMove.constructDelta(Player.One, Hex.DOWN, Hex.DOWN));

    expect(q.size).toBe(6);
    const qm: QueueAndMoves | undefined = q.popEach(
        (move: PlayerMove) => (move.delta === Hex.DOWN)
    );
    expect(qm).not.toBeUndefined();
    if (qm) { // satisfy compiler
        expect(qm.queue.size).toBe(3);
        expect(qm.moves.size).toBe(2);
        expect(qm.moves.contains(p0_originDown)).toBeTruthy();
        expect(qm.moves.contains(p1_originDown)).toBeTruthy();
    }

    // reject all moves -- should empty the queue
    const qmFalse = q.popEach(() => false);
    expect(qmFalse).not.toBeUndefined();
    if (qmFalse) { // satisfy compiler
        expect(qmFalse.queue.size).toBe(0);
        expect(qmFalse.moves.size).toBe(0);
        expect(qmFalse.queue.popEach(() => true)).toBeUndefined();
    }
});