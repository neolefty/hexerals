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

// Warning: mutable and used mutably
class Coord {
    x: number;
    y: number;
    static rand(xRange: number = 1, yRange: number = 1) {
        return new Coord(Math.random() * xRange, Math.random() * yRange);
    }
    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }
    scale(n: number) { // mutates
        this.x *= n;
        this.y *= n;
        return this;
    }
    add(that: Coord) { // mutates
        this.x += that.x;
        this.y += that.y;
        return this;
    }
    copy() {
        return new Coord(this.x, this.y);
    }
    toString() { return `(${this.x}, ${this.y})`; }
}

const SPACE_FILL = 0.5;
const MIN_STEP_MILLIS = 16; // no faster than 60 fps
const VELOCITY_MAX = 0.25 / 1000; // per ms; whole space is 1x1 square

export class ColorBlobs extends Component<ColorBlobsProps> {
    private locations: Map<number, Coord> = Map();
    private lastStep = new Date();

    step() {
        const now = new Date();
        const elapsed = now.getTime() - this.lastStep.getTime();
        if (elapsed >= MIN_STEP_MILLIS) {
            this.lastStep = now;
            this.evolve(elapsed);
        }
    }

    private evolve(elapsed: number) {
        const r = this.getRadius();
        const f: Map<number, Coord> = Map();
        const forces = f.asMutable();
        // walls
        this.props.colors.driftColors.forEach((color: DriftColor) => {
            const force = new Coord();
            forces.set(color.key, force);
            const location = this.getCoord(color.key);
            if (location.x < r)
                force.x += (r - location.x);
            if (location.y < r)
                force.y += (r - location.y);
            if ((location.x + r) > 1)
                force.x -= (location.x + r - 1);
            if (location.y + r > 1)
                force.y -= (r + location.y - 1);
        });

        // update locations
        const scale = elapsed * VELOCITY_MAX;
        forces.forEach((force: Coord, key: number) => {
            this.locations.get(key).add(force.scale(scale));
        });
    }

    getCoord(i: number) {
        if (this.locations.has(i))
            return this.locations.get(i);
        else {
            const result = Coord.rand();
            this.locations = this.locations.set(i, result);
            return result;
        }
    }

    getRadius() {
        const areaPerBlob = SPACE_FILL / this.props.colors.driftColors.size;
        return Math.sqrt(areaPerBlob / Math.PI);
    }

    render(): React.ReactNode {
        this.step();
        const r = this.getRadius();
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
                            radius={r}
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
    radius: number;
}

export const ColorBlob = (props: ColorBlobProps) => (
    <circle
        r={props.radius}
        cx={props.coord.x}
        cy={props.coord.y}
        style={{fill: props.color.toHex()}}
        onClick={() => props.onRemove()}
    />
);