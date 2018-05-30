import * as React from 'react';

// import hsluv from 'hsluv';
import './ColorWheel.css';
import {ColorsActions, ColorsProps, ColorsState} from './ColorsContainer';
import {Component} from 'react';

export interface ColorWheelProps extends ColorsState, ColorsActions, ColorsProps {
}

export class ColorWheel extends Component<ColorWheelProps> {
    private timer?: NodeJS.Timer;

    componentWillMount(): void {
        if (!this.timer)
            this.timer = global.setInterval(this.props.onDiverge, this.props.tick);
    }

    componentWillUnmount(): void {
        if (this.timer) {
            global.clearInterval(this.timer);
            this.timer = undefined;
        }
    }

    render(): React.ReactNode {
        return (
            <svg
                width={this.props.displaySize.min}
                height={this.props.displaySize.min}
                viewBox="-1,-1,2,2"
            >
                {
                    this.props.colors.driftColors.map((driftColor, i) => {
                        const wedgeStyle = {
                            // stroke: driftColor.toHex(),
                            fill: driftColor.toHex(),
                        };
                        const r1 = 2.5; // inner radius fraction (2 = half, 3 = third)
                        const r2 = 0.5; // outer radius fraction
                        const rText = 2.3; // text radius fraction
                        const delta = Math.PI * 2 / this.props.colors.driftColors.size;
                        const a = delta * i, b = delta * (i + 1), m = (a + b) / 2;
                        const cosA = Math.cos(a), cosB = Math.cos(b),
                            sinA = Math.sin(a), sinB = Math.sin(b),
                            cosM = Math.cos(m), sinM = Math.sin(m);
                        const points = `${cosA / r2},${sinA / r2}`
                            + ` ${cosM / r2},${sinM / r2}`
                            + ` ${cosB / r2},${sinB / r2}`
                            + ` ${cosB / r1},${sinB / r1}`
                            + ` ${cosM / r1},${sinM / r1}`
                            + ` ${cosA / r1},${sinA / r1}`;
                        const textX = cosM / rText;
                        const textY = sinM / rText;
                        const textStyle = {
                            fill: driftColor.contrast().toHex(),
                        };
                        return (
                            <g
                                className="colorWedge"
                                key={i}
                                onClick={() => this.props.onRemoveColor(i)}
                            >
                                <polygon
                                    style={wedgeStyle}
                                    points={points}
                                />
                                <text
                                    className="debug"
                                    style={textStyle}
                                    x={textX}
                                    y={textY}
                                    transform={
                                        `rotate(${m * 180 / Math.PI} ${textX},${textY})`
                                        + ` translate(0 0.043)`} // center vertically in wedge
                                >
                                    {driftColor.cie.toHsluvString()}
                                </text>
                            </g>
                        );
                    })
                }
                <g className="addColor">
                    <circle
                        r={1 / 2.5}
                        onClick={this.props.onAddColor}
                    />
                    <text
                        x="0"
                        y="0.13"
                        onClick={this.props.onAddColor}
                    >
                        +
                    </text>
                    <text
                        className="debug"
                        x="0"
                        y="0.30"
                        onClick={this.props.onAddColor}
                    >
                        {Math.round(this.props.colors.closestTwo())}
                    </text>
                </g>
            </svg>
        );
    }
}
