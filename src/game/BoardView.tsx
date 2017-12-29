import { Player, Spot } from './GameModel';
import * as React from 'react';
import { List } from 'collectable';
import { GamePlayerControl } from './GameControl';
import * as assert from 'assert';

export const BoardView = (props: { control: GamePlayerControl }) => (
    <div className="board">
        {
            List.map(
                (spot, i) => <SpotView control={props.control} key={i} position={i} />,
                props.control.board.positions
            )
        }
    </div>
);

// TODO remove dependence on GamePlayerControl? (use Spot instead?)
interface SpotProps {
    control: GamePlayerControl;
    key: number;
    position: number;
}

interface SpotState {
    selected: boolean;
    pop: number;
    owner: Player;
}

export class SpotView extends React.Component<SpotProps, SpotState> {
    spot: Spot;

    constructor(props: SpotProps) {
        super(props);
        const t: Spot | undefined = List.get(props.position, props.control.board.positions);
        assert(t !== undefined);
        this.spot = t || new Spot(Player.NOBODY, -1);
        this.state = this.deriveState();
    }

    public render() {
        return (
            <span
                className={this.state.selected ? 'active spot' : 'spot'}
                key={this.props.position}
                title={this.spot.owner.name}
                onClick={(e) => this.select(e)}
            >
                {this.spot.pop}
            </span>
        );
    }

    public select(e: React.MouseEvent<HTMLSpanElement>) {
        this.props.control.cursor = this.props.position;
        this.setState(this.deriveState());
        e.preventDefault();
    }

    private deriveState(): SpotState {
        return {
            selected: this.props.control.cursor === this.props.position,
            pop: this.spot.pop,
            owner: this.spot.owner
        };
    }
}
