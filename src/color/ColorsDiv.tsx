import {ColorWheel, ColorWheelProps} from './ColorWheel';
import * as React from 'react';
import {ColorBlobs} from './ColorBlobs';
import {Ticker} from '../Ticker';
import Dimension from '../Dimension';

export const ColorsDiv = (props: ColorWheelProps) => {
    const rod = Math.min(props.displaySize.w * 0.5, props.displaySize.h)
    const square = new Dimension(rod, rod);
    return (
        <div>
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
            </Ticker>«
        </div>
    )
}