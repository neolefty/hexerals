import {ColorWheel, ColorWheelProps} from './ColorWheel';
import * as React from 'react';
import {ColorBlobs} from './ColorBlobs';

export const ColorsDiv = (props: ColorWheelProps) => (
    <div>
        <ColorWheel {...props}/>
        <ColorBlobs
            colors={props.colors}
            displaySize={props.displaySize}
            onRemoveColor={props.onRemoveColor}
        />
    </div>
);