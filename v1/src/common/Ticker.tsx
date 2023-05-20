import * as React from 'react';

// as long as this is present, it will tick
export interface TickerProps {
    tickMillis: number,
    tick: () => void,
    children?: JSX.Element | JSX.Element[];
}

export class Ticker extends React.PureComponent<TickerProps> {
    private timer?: NodeJS.Timer;

    componentDidMount(): void {
        if (!this.timer)
            this.timer = global.setInterval(this.props.tick, this.props.tickMillis);
    }

    componentWillUnmount(): void {
        if (this.timer) {
            global.clearInterval(this.timer);
            this.timer = undefined;
        }
    }

    render(): React.ReactNode {
        return this.props.children
            ? this.props.children
            : <div/>
    }
}