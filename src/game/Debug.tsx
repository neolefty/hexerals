import * as React from 'react';

export interface DebugProps {
    messages: string[];
}

export const Debug = (props: DebugProps) => (
    <div>
        {
            props.messages.map((s, i) => (
                <div key={i}>{s}</div>
            ))
        }
    </div>
);