import * as React from 'react'
import {Map} from 'immutable'
import {ColorPodge} from './ColorPodge'
import {DriftColor} from './DriftColor'
import {CartPair} from '../common/CartPair'

const SPACE_FILL = 0.65
const MIN_STEP_MILLIS = 16 // no faster than 60 fps
const MAX_STEP_MILLIS = 250 // anything longer than 1/4 sec was probably suspension
const VELOCITY_MAX = 0.25 / 100 // per ms whole space is 1x1 square
const COLOR_NEIGHBORHOOD = 20 // multiple of radius
// const VELOCITY_MAX = 0.25 / 1000 // per ms whole space is 1x1 square

export interface ColorBlobsProps {
    colors: ColorPodge
    displaySize: CartPair
    onRemoveColor: (x: number) => void
}

// Warning: mutable and used mutably
export class Coord {
    x: number
    y: number

    static rand(xRange: number = 1, yRange: number = 1) {
        return new Coord(
            Math.random() * xRange * 2 - xRange,
            Math.random() * yRange * 2 - yRange
        )
    }

    constructor(x: number = 0, y: number = 0) {
        this.x = x
        this.y = y
    }

    mutate(that: Coord) {
        this.x = that.x
        this.y = that.y
        return this
    }
    mutateScale(n: number) { // mutates
        this.x *= n
        this.y *= n
        return this
    }
    mutateAdd(that: Coord) { // mutates
        this.x += that.x
        this.y += that.y
        return this
    }
    mutateUnit() { return this.mutateScale(1 / this.mag()) }

    d2(that: Coord) {
        const dx = this.x - that.x
        const dy = this.y - that.y
        return dx * dx + dy * dy
    }
    mag() { return Math.sqrt(this.mag2()) }
    diff(that: Coord) { return new Coord(this.x - that.x, this.y - that.y) }
    copy() { return new Coord(this.x, this.y) }
    mag2() { return this.x * this.x + this.y * this.y }

    plus(that: Coord) { return this.copy().mutateAdd(that) }
    times(n: number) { return this.copy().mutateScale(n) }

    toString(fixed: number = 5) {
        return `(${this.x.toFixed(fixed)}, ${this.y.toFixed(fixed)})`
    }
}

const minMax = (lo: number, hi: number, x: number) =>
    Math.min(hi, Math.max(lo, x))

export const ColorBlob = (props: ColorBlobProps) => {
    const delta = props.acceleration.times(-1100)
        .plus(props.position.times(props.radius * -0.2))
    const pos1 = props.position.plus(delta)
    const pos2 = props.position.plus(delta.times(1.5))
    const speed = props.velocity.mag()
    const contrast1 = minMax(5, 25, Math.floor(speed * 20000))
    const contrast2 = minMax(10, 50, Math.floor(speed * 40000))
    return (
        <g>
            <circle
                r={props.radius}
                cx={props.position.x}
                cy={props.position.y}
                style={{fill: props.color.toHexString()}}
                onClick={() => props.onRemove()}
            />
            <circle
                r={props.radius * 0.7}
                cx={pos1.x}
                cy={pos1.y}
                style={{fill: props.color.texture(contrast1).toHexString()}}
                onClick={() => props.onRemove()}
            />
            <circle
                r={props.radius * 0.5}
                cx={pos2.x}
                cy={pos2.y}
                style={{fill: props.color.texture(contrast2).toHexString()}}
                onClick={() => props.onRemove()}
            />
        </g>
    )
}

export class ColorBlobs extends React.PureComponent<ColorBlobsProps> {
    private positions: Map<number, Coord> = Map()
    private velocities: Map<number, Coord> = Map()
    private accelerations: Map<number, Coord> = Map()
    private lastStep = new Date()
    private readonly f = 3
    private readonly debug = false

    render(): React.ReactNode {
        this.step()
        const r = this.getRadius()
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
                            color={drift}
                            onRemove={() => this.props.onRemoveColor(i)}
                            key={i}
                            radius={r}
                            position={this.getPosition(drift.key)}
                            velocity={this.getVelocity(drift.key)}
                            acceleration={this.getAcceleration(drift.key)}
                        />
                    ))
                }
            </svg>
        )
    }

    step() {
        const now = new Date()
        const elapsed = now.getTime() - this.lastStep.getTime()
        if (elapsed >= MIN_STEP_MILLIS) { // limit the recalculations per second
            this.lastStep = now
            this.evolve(Math.min(MAX_STEP_MILLIS, elapsed))
        }
    }

    private ensureLocations() {
        this.props.colors.driftColors.forEach((color: DriftColor) => {
            this.getPosition(color.key)
            this.getVelocity(color.key)
            this.getAcceleration(color.key)
        })
    }

    private log(s: string) {
        if (this.debug)
            /* tslint:disable:no-console */
            console.log(s)
            /* tslint:enable */
    }

    private evolve(elapsed: number) {
        if (this.props.colors.driftColors.size === 0)
            return

        this.ensureLocations()
        const r = this.getRadius()
        const closestColors = Math.sqrt(this.props.colors.closestTwo())
        const furthestColors = Math.sqrt(this.props.colors.furthestTwo())
        const colorDistanceReciprocal = 1 / (furthestColors - closestColors)
        const forces = Map<number, Coord>().asMutable()
        const nReciprocal = 1 / (Math.max(1, this.props.colors.driftColors.size - 1))
        // walls
        this.log(`*** cycle: ${closestColors.toFixed(this.f)} to ${furthestColors.toFixed(this.f)}`)
        this.props.colors.driftColors.forEach((color: DriftColor) => {
            this.log(`${color.toHslString()}`)

            const force = new Coord()
            forces.set(color.key, force)
            const location = this.getPosition(color.key)

            const x = false
            if (x)
                force.mutateAdd(this.repelSquareWalls(r, location))
            force.mutateAdd(this.repelRoundWalls(r, location))
            force.mutateAdd(ColorBlobs.attractDarkToCenter(color, location))
            // force.mutateAdd(this.attractCenter(r, location))

            if (this.props.colors.driftColors.size >= 2)
                force.mutateAdd(this.repelOtherBlobs(r, color, location))
            // moving 2 colors by color distance doesn't make sense
            if (this.props.colors.driftColors.size >= 3)
                force.mutateAdd(this.attractRepelColors(
                    color, location, r * COLOR_NEIGHBORHOOD,
                    nReciprocal, colorDistanceReciprocal,
                ))

            this.log(` = net ${force.toString(this.f)}`)
        })

        // update positions
        const scale = elapsed * VELOCITY_MAX
        forces.forEach((force: Coord, key: number) => {
            const v = this.velocities.get(key) as Coord
            const a = this.accelerations.get(key) as Coord
            a.mutate(force.mutateScale(scale * 0.001))
            v.mutateAdd(a)
            v.mutateScale(0.95) // drag
            const p = this.positions.get(key) as Coord
            p.mutateAdd(v.copy().mutateScale(elapsed))
        })
    }

    getPosition(i: number): Coord {
        if (this.positions.has(i))
            return this.positions.get(i) as Coord
        else {
            const result = Coord.rand()
            this.positions = this.positions.set(i, result)
            return result
        }
    }

    getVelocity(i: number): Coord {
        if (this.velocities.has(i))
            return this.velocities.get(i) as Coord
        else {
            const result = new Coord()
            this.velocities = this.velocities.set(i, result)
            return result
        }
    }

    getAcceleration(i: number): Coord {
        if (this.accelerations.has(i))
            return this.accelerations.get(i) as Coord
        else {
            const result = new Coord()
            this.accelerations = this.accelerations.set(i, result)
            return result
        }
    }

    getRadius() {
        const areaPerBlob = 4 * SPACE_FILL / this.props.colors.driftColors.size
        return Math.sqrt(areaPerBlob / Math.PI)
    }

    private attractRepelColors(
        color: DriftColor, location: Coord,
        neighborhood: number,
        nReciprocal: number, colorDistanceReciprocal: number,
    ) {
        let colorDistSum = 0
        const neighborhood2 = neighborhood * neighborhood
        const result = new Coord()
        const colorDists = Map<number, number>().asMutable()
        this.props.colors.driftColors.forEach((other: DriftColor) => {
            if (other !== color) {
                const otherLoc = this.getPosition(other.key)
                if (otherLoc.d2(location) < neighborhood2) {
                    const colorDist = Math.sqrt(color.perceptualD2(other))
                    colorDists.set(other.key, colorDist)
                    colorDistSum += colorDist
                }
            }
        })
        if (colorDists.size > 1) {
            const nRecipActual = 1 / colorDists.size
            const colorDistMean = colorDistSum * nReciprocal
            this.props.colors.driftColors.forEach((other: DriftColor) => {
                if (colorDists.has(other.key)) {
                    const colorDist = colorDists.get(other.key) as number
                    const cdNorm = (colorDist - colorDistMean) * colorDistanceReciprocal
                    const otherLoc = this.getPosition(other.key)
                    // the more other colors, the more we need to scale down the forces
                    const unit = location.diff(otherLoc).mutateUnit()
                    // roughly -1 (attract) to 1 (repel)
                    this.log(`     - to ${other.toHslString()}: norm ${cdNorm} (unit ${unit}) | raw ${colorDist} | `)
                    const vec = unit.mutateScale(cdNorm * nRecipActual * VELOCITY_MAX * 300)
                    result.mutateAdd(vec)
                }
            })
        }
        this.log(` - colors: ${result}`)
        return result
    }

    // returns a 2D force
    private repelSquareWalls(radius: number, location: Coord) {
        const result = new Coord()
        // walls
        if (location.x < radius)
            result.x += (radius - location.x)
        if (location.y < radius)
            result.y += (radius - location.y)
        if ((location.x + radius) > 1)
            result.x -= (location.x + radius - 1)
        if (location.y + radius > 1)
            result.y -= (radius + location.y - 1)
        this.log(` - walls: ${result.toString(this.f)}`)
        return result
    }

    private repelRoundWalls(r: number, location: Coord) {
        const innerR = 1 - r // radius blob's centers should remain inside
        // distance outside inner radius, squared
        const d2 = location.mag2() - innerR * innerR
        if (d2 > 0)
            return location.copy().mutateScale(-Math.sqrt(d2) * 0.6)
        else
            return new Coord()
    }

    // tslint:disable-next-line:member-order
    private static attractDarkToCenter(color: DriftColor, location: Coord) {
        const fromDark = DriftColor.MAX_BRIGHT - color.lightness
        return location.copy().mutateScale(-.3 * DriftColor.RECIP_BRIGHT * fromDark)
    }

    private repelOtherBlobs(r: number, color: DriftColor, location: Coord) {
        const diam = r + r
        const result = new Coord()
        this.props.colors.driftColors.forEach((other: DriftColor) => {
            if (other !== color) {
                // this.log(` - to ${other.toHsluvString()}`)
                const otherLoc = this.getPosition(other.key)
                const dist2 = location.d2(otherLoc)
                // if (dist2 < (r * r) / 20)
                //     debugger
                const vec = location.diff(otherLoc)
                // repel any overlap
                const diam2 = diam * diam
                if (dist2 < diam2) { // overlap?
                    // TODO make more efficient?
                    const centerDist = vec.mag()
                    vec.mutateScale(1 / centerDist) // unit vector
                    const overlap = diam - centerDist
                    result.mutateAdd(vec.mutateScale(0.6 * overlap))

                    // const dist = Math.sqrt(dist2)
                    // const mag = diam - dist
                    // const vecScale = vec.copy().mutateScale(mag)
                    // // this.log(`     - overlap: ${vecScale.toString(this.f)} -- diam = ${diam.toFixed(this.f)} -- overlap ${dist2.toFixed(this.f)}/${diam2.toFixed(this.f)} = ${dist.toFixed(this.f)}/${diam.toFixed(this.f)}--> ${vec.toString(this.f)} * ${(mag).toFixed(this.f)} = ${vecScale.toString(this.f)}`)
                    // result.mutateAdd(vecScale)

                    // result.mutateAdd(vec.mutateScale(0.1))
                }
            }
        })
        this.log(` - blobs: ${result}`)
        return result
    }
}

export interface ColorBlobProps {
    color: DriftColor
    onRemove: () => void
    radius: number
    position: Coord
    velocity: Coord
    acceleration: Coord
}
