import {MovementQueue, PlayerMove, QueueAndMoves} from './MovementQueue';
import {Player} from './Players';
import {HexCoord} from './Hex';

it('checks sanity', () => {
    const q0 = new MovementQueue();
    expect(q0.popEach(() => true)).toBeUndefined();
    expect(q0.size).toBe(0);
    const q1 = q0.addMove(PlayerMove.construct(
        Player.Zero, HexCoord.ORIGIN, HexCoord.DOWN));
    expect(q1.size).toBe(1);
    expect(q0.size).toBe(0);
    const q2 = q1.addMove(PlayerMove.construct(
        Player.Zero, HexCoord.DOWN, HexCoord.DOWN));
    expect(q2.size).toBe(2);
    const q3 = q2.addMove(PlayerMove.construct(
        Player.One, HexCoord.ORIGIN, HexCoord.UP));
    expect(q3.size).toBe(3);

    expect(q3.playerIsQueuedTo(
        Player.Zero, HexCoord.DOWN.plus(HexCoord.DOWN))).toBeTruthy();
    expect(q3.playerIsQueuedTo(Player.Zero, HexCoord.LEFT_UP)).toBeFalsy();
    const q4 = q3.addMove(PlayerMove.construct(
        Player.Zero, HexCoord.UP, HexCoord.LEFT_DOWN));
    expect(q4.playerIsQueuedTo(Player.Zero, HexCoord.LEFT_UP)).toBeTruthy();
});

it('pops', () => {
    // empty queue always undefined
    expect(new MovementQueue().popEach(() => true)).toBeUndefined();

    const p0_originDown = PlayerMove.construct(
        Player.Zero, HexCoord.ORIGIN, HexCoord.DOWN);
    const p1_originDown = PlayerMove.construct(
        Player.One, HexCoord.ORIGIN, HexCoord.DOWN);

    const q = new MovementQueue()

        .addMove(p0_originDown)
        .addMove(PlayerMove.construct(Player.Zero, HexCoord.DOWN, HexCoord.DOWN))
        .addMove(PlayerMove.construct(Player.Zero, HexCoord.ORIGIN, HexCoord.UP))

        .addMove(PlayerMove.construct(Player.One, HexCoord.DOWN, HexCoord.LEFT_UP))
        .addMove(p1_originDown)
        .addMove(PlayerMove.construct(Player.One, HexCoord.DOWN, HexCoord.DOWN));

    expect(q.size).toBe(6);
    const qm: QueueAndMoves | undefined = q.popEach(
        (move: PlayerMove) => (move.delta === HexCoord.DOWN)
    );
    expect(qm).not.toBeUndefined();
    if (qm) { // satisfy compiler
        expect(qm.queue.size).toBe(3);
        expect(qm.moves.size).toBe(2);
        expect(qm.moves.contains(p0_originDown)).toBeTruthy();
        expect(qm.moves.contains(p1_originDown)).toBeTruthy();
    }

    // reject all moves -- should empty the queue
    const qmFalsed = q.popEach(() => false);
    expect(qmFalsed).not.toBeUndefined();
    if (qmFalsed) { // satisfy compiler
        expect(qmFalsed.queue.size).toBe(0);
        expect(qmFalsed.moves.size).toBe(0);
        expect(qmFalsed.queue.popEach(() => true)).toBeUndefined();
    }
});