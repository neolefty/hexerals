import * as React from 'react';
import { RectangularConstraints } from './Hex';

export interface PerfTestProps {
    w: number;
    h: number;
}

export const PerfTest = (props: PerfTestProps) => {
    const start = new Date();
    const constraints = new RectangularConstraints(props.w, props.h);
    const n = constraints.all().size;
    const elapsed = new Date().getTime() - start.getTime();
    const cpms = n / elapsed;
    return (
        <div>
            Built {props.w} x {props.h} board in {elapsed} ms. |
            {n} cells at {cpms} cells per ms
        </div>
    );
};