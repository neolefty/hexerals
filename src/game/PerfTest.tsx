import { List } from 'immutable';
import * as React from 'react';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';

import {GenericAction} from '../App';
import { RectangularConstraints } from './Hex';

export interface PerfState {
    history: List<PerfRecord>;
    inputs: Wh;
}

export function PerfReducer(
    state: PerfState = INITIAL_PERF_STATE, action: PerfAction
): PerfState {
    // if (isQueuePerfTest(action)) {
    //     console.log(`Queue perf test ${action.wh}`)
    // }
    if (isRunPerfTest(action))
        return { ...state, history: state.history.push(runPerfTest(action.wh)) };
    else if (isChangeWh(action))
        return { ...state, inputs: action.wh };
    else
        return state;
}

const QUEUE_PERF_TEST = 'QUEUE_PERF_TEST';
type QUEUE_PERF_TEST = typeof QUEUE_PERF_TEST;
// function isQueuePerfTest(action: PerfAction): action is QueuePerfTest {
//     return action.type === QUEUE_PERF_TEST; }
const RUN_PERF_TEST = 'RUN_PERF_TEST';
type RUN_PERF_TEST = typeof RUN_PERF_TEST;
function isRunPerfTest(action: PerfAction): action is RunPerfTest {
    return action.type === RUN_PERF_TEST; }
const CHANGE_WH = 'CHANGE_WH';
type CHANGE_WH = typeof CHANGE_WH;
function isChangeWh(action: PerfAction): action is ChangeWh {
    return action.type === CHANGE_WH; }

interface RunPerfTest extends GenericAction { type: RUN_PERF_TEST; wh: Wh; }
interface ChangeWh extends GenericAction { type: CHANGE_WH; wh: Wh; }
interface QueuePerfTest extends GenericAction { type: QUEUE_PERF_TEST; wh: Wh; }
type PerfAction = RunPerfTest | ChangeWh | QueuePerfTest;

function changeWhAction(wh: Wh): ChangeWh { return {type: CHANGE_WH, wh: wh}; }
// function queuePerfTestAction(wh: Wh): QueuePerfTest { return {type: QUEUE_PERF_TEST, wh: wh}; }
function runPerfTestAction(wh: Wh): RunPerfTest { return {type: RUN_PERF_TEST, wh: wh}; }

const mapStateToPerfProps = (state: PerfState) => ({
    history: state.history,
    inputs: state.inputs,
});

const mapDispatchToPerfProps = (dispatch: Dispatch<PerfState>) => ({
    onChange: (wh: Wh) => { dispatch(changeWhAction(wh)); },
    onQueue: (wh: Wh) => {
        setTimeout((x: Wh) => dispatch(runPerfTestAction(x)), 0, wh);
    },
});

export const runPerfTest = (wh: Wh) => {
    const start = new Date();
    const constraints = new RectangularConstraints(wh.w, wh.h);
    const n = constraints.all().size;
    const elapsed = new Date().getTime() - start.getTime();
    return new PerfRecord(wh, elapsed, n);
};

export interface PerfProps extends PerfState {
    onChange: (wh: Wh) => void;
    onQueue: () => void;
}

const PerfTest = (props: PerfProps) => (
    <div>
        <WhInput wh={props.inputs} onChange={props.onChange} onTest={props.onQueue}/>
        {
            props.history.map((record: PerfRecord, index: number) => (
                <PerfResultView record={record} key={index} />
            ))
        }
    </div>
);

export const PerfContainer = connect(mapStateToPerfProps, mapDispatchToPerfProps)(
    PerfTest
);

const WhInput = (props: WhInputProps) => (
    <div>
        <NumberInput
            value={props.wh.w}
            label="width"
            key="width"
            onChange={w => props.onChange(new Wh(w, props.wh.h))}
        />
        <NumberInput
            value={props.wh.h}
            label="height"
            key="height"
            onChange={h => props.onChange(new Wh(props.wh.w, h))}
        />
        <button onClick={() => props.onTest(props.wh)}>Test Performance</button>
    </div>
);

class PerfRecord {
    constructor(
        readonly wh: Wh,
        readonly elapsed: number,
        readonly n: number = wh.area,
    ) {}
    get nPerMs() { return this.n / this.elapsed; }
}

class Wh {
    constructor(readonly w: number, readonly h: number) {}
    get area() { return this.w * this.h; }
}

const INITIAL_PERF_STATE = {
    history: List<PerfRecord>(),
    inputs: new Wh(500, 200),
};

interface PerfResultProps {
    record: PerfRecord;
}

const PerfResultView = (props: PerfResultProps) => (
    <div>
        Built {props.record.wh.w} x {props.record.wh.h} board
        in {props.record.elapsed} ms.
        | {props.record.n} cells at {props.record.nPerMs} cells per ms
    </div>
);

interface WhInputProps {
    wh: Wh;
    onChange: (wh: Wh) => void;
    onTest: (wh: Wh) => void;
}

interface NumberInputProps {
    label: string;
    value: number;
    onChange: (x: number) => void;
}

const NumberInput = (props: NumberInputProps) => (
    <label>{props.label}:
        <input
            type="number"
            value={props.value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const str = e.currentTarget.value;
                if (str) props.onChange(parseInt(str, 10));
            }}
        />
    </label>
);
