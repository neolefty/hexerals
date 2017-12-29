// import { createStore } from redux

export class Player {
    public static COMPY = new Player('Compy');
    public static HUMAN = new Player('Human');
    public static NOBODY = new Player('');

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

    // resolve a combination of this and that
    resolve(that: Spot): Spot {
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
    // positions: Array<Spot>; // alt syntax
    positions: Spot[];

    constructor(size: number) {
        this.positions = new Array<Spot>(size);
        for (let i = 0; i < size; ++i) {
            this.positions[i] = new Spot(Player.NOBODY, 0);
        }
        this.positions[0] = new Spot(Player.COMPY, 3);
        this.positions[size - 1] = new Spot(Player.HUMAN, 3);
    }

    // do a move
    apply(move: Move) {
        const origin = this.positions[move.coord];
        const dest = this.positions[move.dest()];

        if (origin.pop > 1) {
            const from = new Spot(origin.owner, 1);
            const march = new Spot(origin.owner, origin.pop - 1);
            const to = dest.resolve(march);

            this.positions[move.coord] = from;
            this.positions[move.dest()] = to;
        }
    }
}

export class Move {
    coord: number; // index on positions
    step: number;  // +-1

    constructor(coord: number, step: number) {
        this.coord = coord;
        this.step = step;
    }

    // where will this Move end?
    dest(): number {
        return this.coord + this.step;
    }
}
