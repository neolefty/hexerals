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
}

export const ColorWheel = (props: ColorWheelProps) => (
    <div>
        <svg
            width={props.displaySize.min}
            height={props.displaySize.min}
            viewBox="-1.05,-1.05,2.10,2.10"
        >
            {/*<circle className="colorWheel" r="1" />*/}
            {
                // List([
                //     ColorPodge.randomColor(),
                //     ColorPodge.randomColor(),
                //     ColorPodge.randomColor()
                // ])
                props.colors.hsluvColors.map((hsluvColor, i) => {
                    // const rgb = hsluv.hsluvToRgb(hsluvColor);
                    const style = {
                        // stroke: hsluv.hsluvToHex(hsluvColor),
                        fill: hsluv.hsluvToHex(hsluvColor),
                        strokeWidth: '1%',
                    };
                    const s = 3; // inner radius fraction (2 = half, 3 = third)
                    const delta = Math.PI * 2 / props.colors.hsluvColors.size;
                    const a = delta * i, b = delta * (i + 1), m = (a + b) / 2;
                    const cosA = Math.cos(a), cosB = Math.cos(b),
                        sinA = Math.sin(a), sinB = Math.sin(b),
                        cosM = Math.cos(m), sinM = Math.sin(m);
                    const points = `${cosA},${sinA} ${cosM},${sinM} ${cosB},${sinB}`
                        + ` ${cosB / s},${sinB / s} ${cosM / s},${sinM / s} ${cosA / s},${sinA / s}`;
                    return (
                        <polygon style={style} points={points} key={i} />
                    );
                })
            }
        </svg>
    </div>
);