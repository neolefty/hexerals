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
export class Coord {
    x: number;
    y: number;
    static rand(xRange: number = 1, yRange: number = 1) {
        return new Coord(Math.random() * xRange, Math.random() * yRange);
    }
    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }
    mutateScale(n: number) { // mutates
        this.x *= n;
        this.y *= n;
        return this;
    }
    mutateAdd(that: Coord) { // mutates
        this.x += that.x;
        this.y += that.y;
        return this;
    }
    diff(that: Coord) {
        return new Coord(this.x - that.x, this.y - that.y);
    }
    d2(that: Coord) {
        const dx = this.x - that.x;
        const dy = this.y - that.y;
        return dx * dx + dy * dy;
    }
    copy() {
        return new Coord(this.x, this.y);
    }
    toString(fixed: number = 5) {
        return `(${this.x.toFixed(fixed)}, ${this.y.toFixed(fixed)})`;
    }
}

const SPACE_FILL = 0.5;
const MIN_STEP_MILLIS = 16; // no faster than 60 fps
const VELOCITY_MAX = 0.25 / 100; // per ms; whole space is 1x1 square
// const VELOCITY_MAX = 0.25 / 1000; // per ms; whole space is 1x1 square

export class ColorBlobs extends Component<ColorBlobsProps> {
    private locations: Map<number, Coord> = Map();
    private velocities: Map<number, Coord> = Map();
    private lastStep = new Date();

    step() {
        const now = new Date();
        const elapsed = now.getTime() - this.lastStep.getTime();
        if (elapsed >= MIN_STEP_MILLIS) {
            this.lastStep = now;
            this.evolve(elapsed);
        }
    }

    private ensureLocations() {
        this.props.colors.driftColors.forEach((color: DriftColor) => {
            this.getLocation(color.key);
            this.getVelocity(color.key);
        });
    }

    private evolve(elapsed: number) {
        this.ensureLocations();
        const r = this.getRadius();
        // const closestTwo = this.props.colors.closestTwo();
        const diam = r * 2;
        const diam2 = diam * diam;
        const fTemp: Map<number, Coord> = Map();
        const forces = fTemp.asMutable();
        // walls
        this.props.colors.driftColors.forEach((color: DriftColor) => {
            const force = new Coord();
            forces.set(color.key, force);
            const location = this.getLocation(color.key);

            // walls
            if (location.x < r)
                force.x += (r - location.x);
            if (location.y < r)
                force.y += (r - location.y);
            if ((location.x + r) > 1)
                force.x -= (location.x + r - 1);
            if (location.y + r > 1)
                force.y -= (r + location.y - 1);

            // other blobs
            this.props.colors.driftColors.forEach((other: DriftColor) => {
                if (other !== color) {
                    const otherLoc = this.getLocation(other.key);
                    const dist2 = location.d2(otherLoc);
                    // nearby
                    if (dist2 < diam2) { // overlap?
                        const dist = Math.sqrt(dist2);
                        const vec = location.diff(otherLoc);
                        const mag = diam - dist;
                        const vecScale = vec.copy().mutateScale(mag);
                        // const f = 4;
                        // console.log(`${color.toHex()} -- diam = ${diam.toFixed(f)} -- overlap ${dist2.toFixed(f)}/${diam2.toFixed(f)} = ${dist.toFixed(f)}/${diam.toFixed(f)}--> ${vec.toString(f)} * ${(mag).toFixed(f)} = ${vecScale.toString(f)}`);
                        force.mutateAdd(vecScale);
                        // force.mutateAdd(location.diff(otherLoc).mutateScale(d - r));
                        // force.mutateAdd(location.diff(otherLoc).mutateScale(1 / d2));
                    }
                    // color
                    // const colorDist = color.perceptualDistance(other);
                }
            });
        });

        // update locations
        const scale = elapsed * VELOCITY_MAX;
        forces.forEach((force: Coord, key: number) => {
            // const v = this.velocities.get(key);
            // v.mutateAdd(force.mutateScale(scale));
            // this.locations.get(key).mutateAdd(v.copy().mutateScale(elapsed));
            this.locations.get(key).mutateAdd(force.mutateScale(scale));
        });
    }

    getLocation(i: number) {
        if (this.locations.has(i))
            return this.locations.get(i);
        else {
            const result = Coord.rand();
            this.locations = this.locations.set(i, result);
            return result;
        }
    }

    getVelocity(i: number) {
        if (this.velocities.has(i))
            return this.velocities.get(i);
        else {
            const result = Coord.rand();
            this.velocities = this.velocities.set(i, result);
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
                            coord={this.getLocation(drift.key)}
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