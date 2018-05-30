import * as React from 'react';
import {Component} from 'react';
import {Map} from 'immutable';
import {ColorPodge} from './ColorPodge';
import {DriftColor} from './DriftColor';
import Dimension from '../Dimension';

export interface ColorBlobsProps {
    colors: ColorPodge;
    displaySize: Dimension;
    onRemoveColor: (x: number) => void;
}

class Coord {
    x: number;
    y: number;
    static rand(xRange: number = 1, yRange: number = 1) {
        return new Coord(Math.random() * xRange, Math.random() * yRange);
    }
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export class ColorBlobs extends Component<ColorBlobsProps> {
    private locations: Map<number, Coord> = Map();

    getCoord(i: number) {
        if (this.locations.has(i))
            return this.locations.get(i);
        else {
            const result = Coord.rand();
            this.locations = this.locations.set(i, result);
            return result;
        }
    }

    render(): React.ReactNode {
        return (
            <svg
                width={this.props.displaySize.min}
                height={this.props.displaySize.min}
                viewBox="0,0,1,1"
            >
                {
                    this.props.colors.driftColors.map((drift: DriftColor, i: number) => (
                        <ColorBlob
                            coord={this.getCoord(drift.key)}
                            color={drift}
                            onRemove={() => this.props.onRemoveColor(i)}
                            key={i}
                        />
                    ))
                }
            </svg>
        );
    }
}

export interface ColorBlobProps {
    color: DriftColor;
    coord: Coord;
    onRemove: () => void;
}

export const ColorBlob = (props: ColorBlobProps) => (
    <circle
        r={0.1}
        cx={props.coord.x}
        cy={props.coord.y}
        style={{fill: props.color.toHex()}}
        onClick={() => props.onRemove()}
    />
);