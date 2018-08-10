import * as React from 'react';
import {Component} from 'react';
import {Map} from 'immutable';
import {ColorPodge} from './ColorPodge';
import {DriftColor} from './DriftColor';
import Dimension from '../Dimension';

const SPACE_FILL = 0.65;
const MIN_STEP_MILLIS = 16; // no faster than 60 fps
const MAX_STEP_MILLS = 250; // anything longer than 1/4 sec was probably suspension
const VELOCITY_MAX = 0.25 / 100; // per ms; whole space is 1x1 square
const COLOR_NEIGHBORHOOD = 20; // multiple of radius
// const VELOCITY_MAX = 0.25 / 1000; // per ms; whole space is 1x1 square

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
        return new Coord(
            Math.random() * xRange * 2 - xRange,
            Math.random() * yRange * 2 - yRange
        );
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
    mutateUnit() { return this.mutateScale(1 / this.mag()); }

    d2(that: Coord) {
        const dx = this.x - that.x;
        const dy = this.y - that.y;
        return dx * dx + dy * dy;
    }
    mag() { return Math.sqrt(this.mag2()); }
    diff(that: Coord) { return new Coord(this.x - that.x, this.y - that.y); }
    copy() { return new Coord(this.x, this.y); }
    mag2() { return this.x * this.x + this.y * this.y; }

    toString(fixed: number = 5) {
        return `(${this.x.toFixed(fixed)}, ${this.y.toFixed(fixed)})`;
    }
}

export const ColorBlob = (props: ColorBlobProps) => (
    <circle
        r={props.radius}
        cx={props.coord.x}
        cy={props.coord.y}
        style={{fill: props.color.toHexString()}}
        onClick={() => props.onRemove()}
    />
);

export class ColorBlobs extends Component<ColorBlobsProps> {
    private locations: Map<number, Coord> = Map();
    private velocities: Map<number, Coord> = Map();
    private lastStep = new Date();
    private readonly f = 3;
    private readonly debug = false;

    render(): React.ReactNode {
        this.step();
        const r = this.getRadius();
        return (
            <svg
                width={this.props.displaySize.min}
                height={this.props.displaySize.min}
                viewBox="-1,-1,2,2"
            >
                <circle r="1" style={{strokeWidth: '0.6%', stroke: '#444'}}/>
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

    step() {
        const now = new Date();
        const elapsed = now.getTime() - this.lastStep.getTime();
        if (elapsed >= MIN_STEP_MILLIS) { // limit the recalculations per second
            this.lastStep = now;
            this.evolve(Math.min(MAX_STEP_MILLS, elapsed));
        }
    }

    private ensureLocations() {
        this.props.colors.driftColors.forEach((color: DriftColor) => {
            this.getLocation(color.key);
            this.getVelocity(color.key);
        });
    }

    private log(s: string) {
        if (this.debug)
            console.log(s);
    }

    private evolve(elapsed: number) {
        if (this.props.colors.driftColors.size === 0)
            return;

        this.ensureLocations();
        const r = this.getRadius();
        const closestColors = Math.sqrt(this.props.colors.closestTwo());
        const furthestColors = Math.sqrt(this.props.colors.furthestTwo());
        const colorDistanceReciprocal = 1 / (furthestColors - closestColors);
        const m: Map<number, Coord> = Map();
        const forces = m.asMutable();
        const nReciprocal = 1 / (Math.max(1, this.props.colors.driftColors.size - 1));
        // walls
        this.log(`*** cycle: ${closestColors.toFixed(this.f)} to ${furthestColors.toFixed(this.f)}`);
        this.props.colors.driftColors.forEach((color: DriftColor) => {
            this.log(`${color.toHslString()}`);

            const force = new Coord();
            forces.set(color.key, force);
            const location = this.getLocation(color.key);

            const x = false;
            if (x)
                force.mutateAdd(this.repelSquareWalls(r, location));
            force.mutateAdd(this.repelRoundWalls(r, location));
            force.mutateAdd(this.attractDarkToCenter(color, location));
            // force.mutateAdd(this.attractCenter(r, location));

            if (this.props.colors.driftColors.size >= 2)
                force.mutateAdd(this.repelOtherBlobs(r, color, location));
            // moving 2 colors by color distance doesn't make sense
            if (this.props.colors.driftColors.size >= 3)
                force.mutateAdd(this.attractRepelColors(
                    color, location, r * COLOR_NEIGHBORHOOD,
                    nReciprocal, colorDistanceReciprocal,
                ));

            this.log(` = net ${force.toString(this.f)}`);
        });

        // update locations
        const scale = elapsed * VELOCITY_MAX;
        const useVel = true;
        forces.forEach((force: Coord, key: number) => {
            if (useVel) {
                const v = this.velocities.get(key);
                v.mutateAdd(force.mutateScale(scale * 0.001));
                v.mutateScale(0.95); // drag
                this.locations.get(key).mutateAdd(v.copy().mutateScale(elapsed));
            }
            else
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
            const result = new Coord();
            this.velocities = this.velocities.set(i, result);
            return result;
        }
    }

    getRadius() {
        const areaPerBlob = 4 * SPACE_FILL / this.props.colors.driftColors.size;
        return Math.sqrt(areaPerBlob / Math.PI);
    }

    private attractRepelColors(
        color: DriftColor, location: Coord,
        neighborhood: number,
        nReciprocal: number, colorDistanceReciprocal: number,
    ) {
        let colorDistSum = 0;
        const neighborhood2 = neighborhood * neighborhood;
        const result = new Coord();
        const m: Map<number, number> = Map();
        const colorDists = m.asMutable();
        this.props.colors.driftColors.forEach((other: DriftColor) => {
            if (other !== color) {
                const otherLoc = this.getLocation(other.key);
                if (otherLoc.d2(location) < neighborhood2) {
                    const colorDist = Math.sqrt(color.perceptualDistance2(other));
                    colorDists.set(other.key, colorDist);
                    colorDistSum += colorDist;
                }
            }
        });
        if (colorDists.size > 1) {
            const nRecipActual = 1 / colorDists.size;
            const colorDistMean = colorDistSum * nReciprocal;
            this.props.colors.driftColors.forEach((other: DriftColor) => {
                if (colorDists.has(other.key)) {
                    const colorDist = colorDists.get(other.key);
                    const cdNorm = (colorDist - colorDistMean) * colorDistanceReciprocal;
                    const otherLoc = this.getLocation(other.key);
                    // the more other colors, the more we need to scale down the forces
                    const unit = location.diff(otherLoc).mutateUnit();
                    // roughly -1 (attract) to 1 (repel)
                    this.log(`     - to ${other.toHslString()}: norm ${cdNorm} (unit ${unit}) | raw ${colorDist} | `);
                    const vec = unit.mutateScale(cdNorm * nRecipActual * VELOCITY_MAX * 300);
                    result.mutateAdd(vec);
                }
            });
        }
        this.log(` - colors: ${result}`);
        return result;
    }

    // returns a 2D force
    private repelSquareWalls(radius: number, location: Coord) {
        const result = new Coord();
        // walls
        if (location.x < radius)
            result.x += (radius - location.x);
        if (location.y < radius)
            result.y += (radius - location.y);
        if ((location.x + radius) > 1)
            result.x -= (location.x + radius - 1);
        if (location.y + radius > 1)
            result.y -= (radius + location.y - 1);
        this.log(` - walls: ${result.toString(this.f)}`);
        return result;
    }

    private repelRoundWalls(r: number, location: Coord) {
        const innerR = 1 - r; // radius blob's centers should remain inside
        // distance outside inner radius, squared
        const d2 = location.mag2() - innerR * innerR;
        if (d2 > 0)
            return location.copy().mutateScale(-Math.sqrt(d2) * 0.6);
        else
            return new Coord();
    }

    private attractDarkToCenter(color: DriftColor, location: Coord) {
        const fromDark = DriftColor.MAX_BRIGHT - color.cie.hsl[2];
        return location.copy().mutateScale(-.3 * DriftColor.RECIP_BRIGHT * fromDark);
    }

    private repelOtherBlobs(r: number, color: DriftColor, location: Coord) {
        const diam = r + r;
        const result = new Coord();
        this.props.colors.driftColors.forEach((other: DriftColor) => {
            if (other !== color) {
                // this.log(` - to ${other.toHsluvString()}`);
                const otherLoc = this.getLocation(other.key);
                const dist2 = location.d2(otherLoc);
                // if (dist2 < (r * r) / 20)
                //     debugger;
                const vec = location.diff(otherLoc);
                // repel any overlap
                const diam2 = diam * diam;
                if (dist2 < diam2) { // overlap?
                    // TODO make more efficient?
                    const centerDist = vec.mag();
                    vec.mutateScale(1 / centerDist); // unit vector
                    const overlap = diam - centerDist;
                    result.mutateAdd(vec.mutateScale(0.6 * overlap));

                    // const dist = Math.sqrt(dist2);
                    // const mag = diam - dist;
                    // const vecScale = vec.copy().mutateScale(mag);
                    // // this.log(`     - overlap: ${vecScale.toString(this.f)} -- diam = ${diam.toFixed(this.f)} -- overlap ${dist2.toFixed(this.f)}/${diam2.toFixed(this.f)} = ${dist.toFixed(this.f)}/${diam.toFixed(this.f)}--> ${vec.toString(this.f)} * ${(mag).toFixed(this.f)} = ${vecScale.toString(this.f)}`);
                    // result.mutateAdd(vecScale);

                    // result.mutateAdd(vec.mutateScale(0.1));
                }
            }
        });
        this.log(` - blobs: ${result}`);
        return result;
    }
}

export interface ColorBlobProps {
    color: DriftColor;
    coord: Coord;
    onRemove: () => void;
    radius: number;
}
