import { List } from 'immutable';
import * as React from 'react';
import { RectangularConstraints } from './Hex';

export interface PerfProps {
    history: List<PerfRecord>;
    inputs: Wh;

    onChange: (wh: Wh) => void;
    onRun: () => void;
}

export const runPerfTest = (wh: Wh) => {
    const start = new Date();
    const constraints = new RectangularConstraints(wh.w, wh.h);
    const n = constraints.all().size;
    const elapsed = new Date().getTime() - start.getTime();
    return new PerfRecord(wh, elapsed, n);
};

export class PerfRecord {
    constructor(
        readonly wh: Wh,
        readonly elapsed: number,
        readonly n: number = wh.area,
    ) {}
    get nPerMs() { return this.n / this.elapsed; }
}

export class Wh {
    constructor(readonly w: number, readonly h: number) {}
    get area() { return this.w * this.h; }
}

export const PerfTest = (props: PerfProps) => {
    return (
        <div>
            <WhInput wh={props.inputs} onChange={props.onChange} onTest={props.onRun}/>
            {
                props.history.map((record: PerfRecord) => (
                    <PerfResultView record={record} />
                ))
            }
        </div>
    );
};

export interface PerfResultProps {
    record: PerfRecord
}

export const PerfResultView = (props: PerfResultProps) => (
    <div>
        Built {props.record.wh.w} x {props.record.wh.h} board
        in {props.record.elapsed} ms.
        | {props.record.n} cells at {props.record.nPerMs} cells per ms
    </div>
);

export interface WhInputProps {
    wh: Wh;
    onChange: (wh: Wh) => void;
    onTest: (wh: Wh) => void;
}

export const WhInput = (props: WhInputProps) => (
    <div>
        <NumberInput value={props.wh.w} label='width' key='width' onChange={
            w => props.onChange(new Wh(w, props.wh.h))
        } />
        <NumberInput value={props.wh.h} label='width' key='width' onChange={
            h => props.onChange(new Wh(props.wh.w, h))
        } />
        <button onClick={() => props.onTest(props.wh)}>Test Performance</button>
    </div>
);

export interface NumberInputProps {
    label: string;
    value: number;
    onChange: (x: number) => void;
}

export const NumberInput = (props: NumberInputProps) => (
    <label>{props.label}: <input type="number" value={props.value} onChange={
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const str = e.currentTarget.value;
            if (str) props.onChange(parseInt(str));
        }
    }/></label>
);
