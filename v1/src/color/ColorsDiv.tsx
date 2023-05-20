import {ColorWheel, ColorWheelProps} from './ColorWheel';
import * as React from 'react';
import {ColorBlobs} from './ColorBlobs';
import {Ticker} from '../common/Ticker';
import {CartPair} from '../common/CartPair';

export const ColorsDiv = (props: ColorWheelProps) => {
    const rod = Math.min(props.displaySize.x * 0.5, props.displaySize.y)
    const square = new CartPair(rod, rod);
    return (
        <div style={{textAlign: 'center'}}>
            <Ticker
                tickMillis={props.tick}
                tick={props.onDiverge}
            >
                <ColorWheel
                    {...props}
                    displaySize={square}
                />
                <ColorBlobs
                    displaySize={square}
                    colors={props.colors}
                    onRemoveColor={props.onRemoveColor}
                />
            </Ticker>
        </div>
    )
}