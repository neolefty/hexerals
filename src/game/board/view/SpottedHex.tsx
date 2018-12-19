import * as React from 'react';
import {Spot} from '../model/Spot';
import {FlatTopHex} from './FlatTopHex';
import {HexCoord} from '../model/HexCoord';
import {DriftColor} from '../../../color/DriftColor';

interface SpottedHexProps {
    spot: Spot
    hex: HexCoord
    viewBoxHeight: number
    selected: boolean
    onSelect?: () => void | undefined
    color?: DriftColor
    render?: (centerX: number, centerY: number) => JSX.Element | undefined
}

export const centerX = (cartX: number): number => 45 * cartX + 30
export const centerY = (height: number, cartY: number): number => height - (cartY + 1) * 26
export const SpottedHex = (props: SpottedHexProps) => {
    const x: number = centerX(props.hex.cartX())
    const y: number = centerY(props.viewBoxHeight, props.hex.cartY())
    return (
        <FlatTopHex
            owner={props.spot.owner}
            terrain={props.spot.terrain}
            color={props.color}
            selected={props.selected}
            centerX={x}
            centerY={y}
            hexRadius={30}
            onSelect={props.onSelect}
        >
            {props.render && props.render(x, y)}
        </FlatTopHex>
    )
}

interface LocatedComponentProps {
    centerX: number
    centerY: number
}

export class LocatedComponent extends React.Component<LocatedComponentProps> {}