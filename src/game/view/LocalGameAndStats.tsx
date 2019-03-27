import * as React from 'react';

import {CartPair} from '../../common/CartPair';

export interface LgsProps {
    displaySize: CartPair
}

export interface LgsState {
    leftOrUp: boolean  // is the stats pane on the left (horizontal) / top (vertical)?
}

export class LocalGameAndStats extends React.Component<LgsProps, LgsState> {
    render(): React.ReactNode {
        return super.render();
    }
}