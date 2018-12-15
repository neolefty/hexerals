import * as React from 'react';

import {DriftColor} from '../../../color/DriftColor';
import {HexCoord} from '../model/HexCoord';
import {BoardViewProps} from './BoardViewBase';
import {FlatTopHex} from './FlatTopHex';

export const centerX = (cartX: number): number => 45 * cartX + 30
export const centerY = (height: number, cartY: number): number => height - (cartY + 1) * 26
export const viewBoxHeight = (boardHeight: number): number => (boardHeight + 1) * 26

interface FilterBoardViewProps extends BoardViewProps {
    filter: (hex: HexCoord) => boolean
}

export class FilterBoardView extends React.Component<FilterBoardViewProps> {
    constructor(props: FilterBoardViewProps) {
        super(props)
    }

    render(): React.ReactNode {
        const bs = this.props.boardState
        const height = viewBoxHeight(bs.board.edges.height)
        // TODO look into SVGFactory / SVGElement
        return (
            <g id="hexMap"> {
                bs.board.constraints.all().filter(
                    this.props.filter
                ).map(hex => {
                    const spot = bs.board.getSpot(hex)
                    const ox = centerX(hex.cartX())
                    const oy = centerY(height, hex.cartY())
                    const color: DriftColor | undefined
                        = this.props.colors && this.props.colors.get(spot.owner)
                    return (
                        <FlatTopHex
                            key={hex.id}
                            color={color}
                            owner={spot.owner}
                            selected={hex === bs.cursor}
                            centerX={ox}
                            centerY={oy}
                            hexRadius={30}
                            onSelect={() => this.props.onPlaceCursor(hex)}
                            contents={spot.pop === 0 ? '' : `${spot.pop}`}
                        >
                            {
                                spot.pop === 0 ? undefined :
                                    <text
                                        x={ox}
                                        y={oy + 0.35 * 26}
                                        fontFamily="Sans-Serif"
                                        fontSize={27}
                                        textAnchor="middle"
                                        fill={color ? color.contrast().toHexString() : '#fff'}
                                    >
                                        {spot.pop}
                                    </text>
                            }
                        </FlatTopHex>
                    )
                })
            }
            </g>
        )
    }
}