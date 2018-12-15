import {Player} from '../../players/Players';
import {List, Map} from 'immutable';
import {INITIAL_POP} from '../BoardConstants';
import {HexCoord} from './HexCoord';
import {Board} from './Board';
import {Spot} from './Spot';

export interface StartingArranger {
    arrange(board: Board): Map<HexCoord, Spot>;
}

export class RandomArranger implements StartingArranger {
    public static construct(players: List<Player>) {
        return new RandomArranger(INITIAL_POP, players);
    }

    constructor(readonly startingArmy: number, readonly players: List<Player>) {
    }

    public arrange(board: Board): Map<HexCoord, Spot> {
        const allHexes: HexCoord[] = board.constraints.all().toArray();
        let starts = Map<HexCoord, Spot>();
        this.players.forEach((player: Player) => {
            if (player !== Player.Nobody && allHexes.length > 0) {
                const i = Math.floor(Math.random() * allHexes.length);
                const hex = allHexes.splice(i, 1)[0];
                starts = starts.set(hex, new Spot(player, this.startingArmy));
            }
        });
        return starts;
    }
}

// place starting population in lower left, upper right, upper left, and lower right
export class CornersArranger implements StartingArranger {
    constructor(readonly startingArmy: number, readonly players: Iterable<Player>) {
    }

    public arrange(board: Board): Map<HexCoord, Spot> {
        let starts = Map<HexCoord, Spot>();
        const corners = [
            (b: Board) => b.edges.lowerLeft,
            (b: Board) => b.edges.upperRight,
            (b: Board) => b.edges.upperLeft,
            (b: Board) => b.edges.lowerRight,
        ];
        let i = 0;
        for (let p in this.players) { // not sure why we can't use of instead of in
            if (p && this.players[p]) {
                const hex = corners[i++](board);
                starts = starts.set(hex, new Spot(this.players[p], this.startingArmy));
            }
        }
        return starts;
    }
}

// place starting population in lower left & upper right
export class TwoCornersArranger extends CornersArranger {
    constructor(startingArmy: number = 1) {
        super(startingArmy, [Player.Zero, Player.One]);
    }
}