import * as React from 'react'
import {AnalyticsAction, AnalyticsCategory, logEvent} from '../../../common/Analytics';
import './TestTracking.css'

const nodeEnv = process.env.NODE_ENV
// const gtagKey = `REACT_APP_GTAG_ID_${nodeEnv.toUpperCase()}`
// const gtagId = process.env[gtagKey]
const gtagId = process.env.REACT_APP_GTAG_ID
// console.log(process.env)

interface TestTrackingProps {}
interface TestTrackingState {
    label: string
    value: string
}

const DEFAULT_STATE = {
    label: 'foo',
    value: 'bar',
}

export class TestTracking
    extends React.Component<TestTrackingProps, TestTrackingState>
{
    constructor(props: TestTrackingProps) {
        super(props)
        this.state = DEFAULT_STATE
    }

    render(): React.ReactNode {
        return (
            <div>
                <table>
                    <tbody>
                    <tr>
                        <th>env</th>
                        <td>{nodeEnv}</td>
                    </tr>
                    <tr>
                        <th>file</th>
                        <td>{process.env.REACT_APP_FILE}</td>
                    </tr>
                    <tr>
                        <th>gtag ID</th>
                        <td>{gtagId}</td>
                    </tr>
                    </tbody>
                </table>
                <h3>Test Event</h3>
                <div><label>
                    <span>label</span>
                    <input
                        type='text'
                        id='label'
                        value={this.state.label}
                        onChange={e => this.setState({
                            ...this.state,
                            label: e.currentTarget.value
                        })}
                    />
                </label></div>
                <div><label>
                    <span>value</span>
                    <input
                        type='text'
                        id='value'
                        value={this.state.value}
                        onChange={e => this.setState({
                            ...this.state,
                            value: e.currentTarget.value
                        })}
                    />
                </label></div>
                <div><button
                    onClick={() =>
                        logEvent(
                            AnalyticsAction.test,
                            AnalyticsCategory.testing,
                            this.state.label,
                            this.state.value,
                        )
                    }
                >Track</button></div>

            </div>
        )
    }
}
