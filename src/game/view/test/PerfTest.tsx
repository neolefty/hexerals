import {List} from 'immutable'
import * as React from "react"
import {Dispatch, useReducer} from "react"
import {RectangularConstraints} from '../../model/board/Constraints'
import {DEFAULT_LOCAL_GAME_OPTIONS} from '../../model/board/LocalGameOptions'

export interface PerfState {
    history: List<PerfRecord>
    inputs: Wh
}

export function PerfReducer(
    state: PerfState, action: PerfAction
): PerfState {
    switch(action.type) {
        case RUN_PERF_TEST:
            return { ...state, history: state.history.push(runPerfTest(action.wh)) }
        case CHANGE_WH:
            return { ...state, inputs: action.wh }
        case QUEUE_PERF_TEST:
            console.log(`Queue perf test ${action.wh}`)
            return state
    }

}

const QUEUE_PERF_TEST = 'perftest queue'
const RUN_PERF_TEST = 'perftest run'
const CHANGE_WH = 'perftest change wh'

interface RunPerfTest { type: typeof RUN_PERF_TEST; wh: Wh }
interface ChangeWh { type: typeof CHANGE_WH; wh: Wh }
interface QueuePerfTest { type: typeof QUEUE_PERF_TEST; wh: Wh }
type PerfAction = RunPerfTest | ChangeWh | QueuePerfTest

function changeWhAction(wh: Wh): ChangeWh { return {type: CHANGE_WH, wh: wh} }
// function queuePerfTestAction(xy: Wh): QueuePerfTest { return {type: QUEUE_PERF_TEST, xy: xy} }
function runPerfTestAction(wh: Wh): RunPerfTest { return {type: RUN_PERF_TEST, wh: wh} }

const mapStateToPerfProps = (state: PerfState) => ({
    history: state.history,
    inputs: state.inputs,
})

const mapDispatchToPerfProps = (dispatch: Dispatch<PerfAction>) => ({
    onChange: (wh: Wh) => { dispatch(changeWhAction(wh)) },
    onQueue: (wh: Wh) => {
        setTimeout((x: Wh) => dispatch(runPerfTestAction(x)), 0, wh)
    },
})

export const runPerfTest = (wh: Wh) => {
    const start = new Date()
    const constraints = new RectangularConstraints(wh.defaultLocalGameOptions)
    const n = constraints.all.size
    const elapsed = new Date().getTime() - start.getTime()
    return new PerfRecord(wh, elapsed, n)
}

export interface PerfProps extends PerfState {
    onChange: (wh: Wh) => void
    onQueue: (wh: Wh) => void
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
)

export const PerfContainer = () => {
    const [ state, dispatch ] = useReducer(PerfReducer, INITIAL_PERF_STATE)
    return (
        <PerfTest
            {...mapStateToPerfProps(state)}
            {...mapDispatchToPerfProps(dispatch)}
        />
    )
}

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
)

class PerfRecord {
    constructor(
        readonly wh: Wh,
        readonly elapsed: number,
        readonly n: number = wh.area,
    ) {}
    get nPerMs() { return this.n / this.elapsed }
}

class Wh {
    constructor(readonly w: number, readonly h: number) {}
    get area() { return this.w * this.h }
    get defaultLocalGameOptions() {
        return {
            ...DEFAULT_LOCAL_GAME_OPTIONS,
            boardWidth: this.w,
            boardHeight: this.h,
        }
    }
}

const INITIAL_PERF_STATE = {
    history: List<PerfRecord>(),
    inputs: new Wh(500, 200),
}

interface PerfResultProps {
    record: PerfRecord
}

const PerfResultView = (props: PerfResultProps) => (
    <div>
        Built {props.record.wh.w} x {props.record.wh.h} board
        in {props.record.elapsed} ms.
        | {props.record.n} cells at {props.record.nPerMs} cells per ms
    </div>
)

interface WhInputProps {
    wh: Wh
    onChange: (wh: Wh) => void
    onTest: (wh: Wh) => void
}

interface NumberInputProps {
    label: string
    value: number
    onChange: (x: number) => void
}

const NumberInput = (props: NumberInputProps) => (
    <label>{props.label}:
        <input
            type="number"
            value={props.value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const str = e.currentTarget.value
                if (str) props.onChange(parseInt(str, 10))
            }}
        />
    </label>
)
