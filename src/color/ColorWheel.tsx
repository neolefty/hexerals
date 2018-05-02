import * as React from 'react';

// import hsluv from 'hsluv';
import * as hsluv from 'hsluv';
import './Colors.css';
import {ColorsActions, ColorsProps, ColorsState} from './ColorsContainer';
import {Component} from 'react';

interface ColorWheelProps extends ColorsState, ColorsActions, ColorsProps {
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
                    this.props.colors.hsluvColors.map((hsluvColor, i) => {
                        // const rgb = hsluv.hsluvToRgb(hsluvColor);
                        const style = {
                            // stroke: hsluv.hsluvToHex(hsluvColor),
                            fill: hsluv.hsluvToHex(hsluvColor),
                            strokeWidth: '1%',
                        };
                        const r1 = 2.5; // inner radius fraction (2 = half, 3 = third)
                        const r2 = 0.5; // outer radius fraction
                        const delta = Math.PI * 2 / this.props.colors.hsluvColors.size;
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
                        return (
                            <polygon
                                style={style}
                                points={points}
                                key={i}
                                onClick={() => this.props.onRemoveColor(i)}
                            />
                        );
                    })
                }
                <g className="addColor">
                    <circle
                        r={1 / 2.5}
                        onClick={this.props.onAddColor}
                    />
{/*
                    <text
                        x="0"
                        y="0.15"
                        onClick={this.props.onAddColor}
                    >+</text>
*/}
                    <text
                        x="0"
                        y="0.15"
                        onClick={this.props.onAddColor}
                    >
                        {this.props.colors.closestTwo()}
                    </text>
                </g>
            </svg>
        );
    }
}
