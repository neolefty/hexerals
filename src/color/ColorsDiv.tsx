import {ColorWheel, ColorWheelProps} from './ColorWheel';
import * as React from 'react';
import {ColorBlobs} from './ColorBlobs';
import {Ticker} from '../Ticker';

export const ColorsDiv = (props: ColorWheelProps) => (
    <div>
        <Ticker
            tickMillis={props.tick}
            tick={props.onDiverge}
        >
            <ColorWheel {...props}/>
            <ColorBlobs
                colors={props.colors}
                displaySize={props.displaySize}
                onRemoveColor={props.onRemoveColor}
            />
        </Ticker>«
    </div>
);