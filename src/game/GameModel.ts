// import { createStore } from redux
// import { set, fromArray, ListStructure } from '@collectable/list';
// import { List } from 'immutable';
import { List } from 'collectable';
import * as assert from 'assert';

export class Player {
    static readonly COMPY = new Player('Compy');
    static readonly HUMAN = new Player('Human');
    static readonly NOBODY = new Player('');
    static readonly ERROR = new Player('Error'); // should never appear

    name: string;
    constructor(name: string) {
        this.name = name;
    }
}

// contents of a space on the positions
export class Spot {
    pop: number;
    owner: Player;

    constructor(owner: Player, pop: number) {
        this.pop = pop;
        this.owner = owner;
    }

    // settle a combination of this and that
    settle(that: Spot): Spot {
        // same owner? combine them
        if (this.owner === that.owner)
            return new Spot(this.owner, this.pop + that.pop);
        // different owners? subtract smaller from larger (this wins a tie)
        else if (this.pop >= that.pop)
            return new Spot(this.owner, this.pop - that.pop);
        else
            return new Spot(that.owner, that.pop - this.pop);
    }
}

export class Board {
    static construct(size: number, initialPop: number = 3) {  // create a blank Board
        const positions = new Array<Spot>(size);
        for (let i = 0; i < size; ++i) {
            positions[i] = new Spot(Player.NOBODY, 0);
        }
        positions[0] = new Spot(Player.COMPY, initialPop);
        positions[size - 1] = new Spot(Player.HUMAN, initialPop);
        return new Board(List.fromArray(positions));
    }

    // TODO figure out how to use List<Spot> and its instance methods?
    constructor(readonly positions: List.Instance<Spot>) {}

    getSpot(index: number): Spot {
        // List.get accepts any number, including NaN (bug?)
        assert(index >= 0 && index < List.size(this.positions));
        // deal with List.get() returning (Spot | undefined).
        return List.get(index, this.positions) || new Spot(Player.ERROR, -1);
    }

    // do a move
    apply(move: Move): Board {
        const origin = this.getSpot(move.coord);
        const dest = this.getSpot(move.dest());

        if (origin.pop > 1) {
            const from = new Spot(origin.owner, 1);
            const march = new Spot(origin.owner, origin.pop - 1);
            const to = dest.settle(march);

            return new Board(
                List.set(move.coord, from, List.set(move.dest(), to, this.positions))
                // this.positions.set(move.coord, from).set(move.dest(), to)
            );
        }
        else  // no effect if 1 or less population in origin
            return this;
    }
}

export class Move {
    constructor(readonly coord: number, readonly step: number) {}

    // where will this Move end?
    dest(): number {
        return this.coord + this.step;
    }
}
