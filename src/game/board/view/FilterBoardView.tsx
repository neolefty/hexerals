import * as React from 'react';

import {DriftColor} from '../../../color/DriftColor';
import {HexCoord} from '../model/HexCoord';
import {BoardViewProps} from './BoardViewBase';
import {SpottedHex} from './SpottedHex';

export const viewBoxHeight = (boardHeight: number): number => (boardHeight + 1) * 26

interface FilterBoardViewProps extends BoardViewProps {
    filter: (hex: HexCoord) => boolean
}

export class FilterBoardView extends React.Component<FilterBoardViewProps> {
    constructor(props: FilterBoardViewProps) {
        super(props)
    }

    render(): React.ReactNode {
        const boardState = this.props.boardState
        const h = viewBoxHeight(boardState.board.edges.height)
        // TODO look into SVGFactory / SVGElement
        return (
            <g id="hexMap"> {
                boardState.board.constraints.all().filter(
                    this.props.filter
                ).map(hex => {
                    const spot = boardState.board.getSpot(hex)
                    const maybeColor: DriftColor | undefined
                        = this.props.colors && this.props.colors.get(spot.owner)
                    const color: DriftColor = maybeColor || DriftColor.BLACK
                    return (
                        <SpottedHex
                            key={hex.id}
                            spot={spot}
                            color={color}
                            hex={hex}
                            selected={hex === boardState.cursor}
                            viewBoxHeight={h}
                            onSelect={() => this.props.onPlaceCursor(hex)}
                            render={(spot.pop === 0)
                                ? undefined
                                : (centerX: number, centerY: number) => (
                                    <text
                                        x={centerX}
                                        y={centerY + 0.35 * 26}
                                        fontFamily="Sans-Serif"
                                        fontSize={27}
                                        textAnchor="middle"
                                        fill={color.contrast().toHexString()}
                                    >
                                        {spot.pop}
                                    </text>)
                            }
                        />
                    )
                })
            }
            </g>
        )
    }
}