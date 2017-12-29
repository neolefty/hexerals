import { Player, Spot } from './GameModel';
import * as React from 'react';
import { GamePlayerControl } from './GameControl';

export const BoardView = (props: { control: GamePlayerControl }) => (
    <div className="board">
        {
            props.control.board.positions.map((spot, i) =>
                <SpotView
                    control={props.control}
                    key={i}
                    position={i}
                />
            )
        }
    </div>
);

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

class SpotView extends React.Component<SpotProps, SpotState> {
    spot: Spot;

    constructor(props: SpotProps) {
        super(props);
        this.spot = props.control.board.positions[props.position];
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
