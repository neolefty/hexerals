import * as React from 'react';
import Dimension from '../Dimension';

// declare module 'hsluv' {
//     export hsluv.Hsluv.hsluvToRgb(tuple: number[]): number[];
// }

// import hsluv from 'hsluv';
import * as hsluv from 'hsluv';
import './Colors.css';
import {ColorPodge} from './ColorPodge';
import {ColorsActions, ColorsProps, ColorsState} from './ColorsContainer';

interface ColorWheelProps extends ColorsState, ColorsActions, ColorsProps {
    displaySize: Dimension;
    colors: ColorPodge;
    onAddColor: () => void;
    onRemoveColor: (x: number) => void;
}

export const ColorWheel = (props: ColorWheelProps) => (
    <div>
        <svg
            width={props.displaySize.min}
            height={props.displaySize.min}
            viewBox="-1,-1,2,2"
        >
            {/*<circle className="colorWheel" r="1" />*/}
            {
                props.colors.hsluvColors.map((hsluvColor, i) => {
                    // const rgb = hsluv.hsluvToRgb(hsluvColor);
                    const style = {
                        // stroke: hsluv.hsluvToHex(hsluvColor),
                        fill: hsluv.hsluvToHex(hsluvColor),
                        strokeWidth: '1%',
                    };
                    const r1 = 2.5; // inner radius fraction (2 = half, 3 = third)
                    const r2 = 0.5; // outer radius fraction
                    const delta = Math.PI * 2 / props.colors.hsluvColors.size;
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
                            onClick={() => props.onRemoveColor(i)}
                        />
                    );
                })
            }
            <circle className={'addColor'} r={1/2.5} onClick={props.onAddColor} />
        </svg>
    </div>
);