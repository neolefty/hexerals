export enum Player {
    Compy, Human, Nobody
}

// contents of a space on the board
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
    // board: Array<Spot>; // alt syntax
    board: Spot[];

    constructor(size: number) {
        this.board = new Array<Spot>(size);
        for (let i = 0; i < size; ++i) {
            this.board[i] = new Spot(Player.Nobody, 0);
        }
        this.board[0] = new Spot(Player.Compy, 3);
        this.board[size - 1] = new Spot(Player.Human, 3);
    }

    // do a move
    apply(move: Move) {
        const origin = this.board[move.coord];
        const dest = this.board[move.dest()];

        if (origin.pop > 1) {
            const from = new Spot(1, origin.owner);
            const march = new Spot(origin.pop - 1, origin.owner);
            const to = dest.resolve(march);

            this.board[move.coord] = from;
            this.board[move.dest()] = to;
        }
    }
}

export class Move {
    coord: number; // index on board
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