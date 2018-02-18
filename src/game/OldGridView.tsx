import * as React from 'react';
import {Spot} from './Board';
import {BoardViewBase} from './BoardView';
import {HexCoord} from './Hex';
import './Board.css';

export class OldGridView extends BoardViewBase {
    render(): React.ReactNode {
        return (
            <div
                className="board"
                tabIndex={0}
                onKeyDown={this.onKeyDown}
            >
                {
                    this.props.board.edges.yRange().reverse().map((cy: number) => (
                        <div key={cy}>
                            {
                                this.props.board.edges.xRange().filter( // remove nonexistent
                                    (cx: number) => (cx + cy) % 2 === 0
                                ).map( // turn cartesian into hex
                                    (cx: number) => HexCoord.getCart(cx, cy)
                                ).filter( // only in-bounds
                                    (coord: HexCoord) => this.props.board.inBounds(coord)
                                ).map(
                                    (coord: HexCoord) => (
                                        <OldGridSpotView
                                            spot={this.props.board.getSpot(coord)}
                                            key={coord.id}
                                            selected={coord === this.props.cursor}
                                            onSelect={() => this.props.onPlaceCursor(coord)}
                                            coord={coord}
                                        />
                                    )
                                )
                            }
                        </div>
                    ))
                }
            </div>
        );
    }
}

export const OldGridSpotView = (props: OldGridSpotProps) => (
    <span
        className={oldGridSpotStyle(props)}
        title={props.spot.owner + ' - ' + props.coord.toString(true)}
        // onClick={props.onSelect}
        onClick={(/*e*/) => props.onSelect && props.onSelect()}
    >
        {props.spot.pop}
    </span>
);

interface OldGridSpotProps {
    spot: Spot;
    selected: boolean;
    coord: HexCoord;

    onSelect?: () => void;
}

const oldGridSpotStyle = (props: OldGridSpotProps) =>
    (props.selected ? 'active ' : '') + 'spot ' + props.spot.owner;