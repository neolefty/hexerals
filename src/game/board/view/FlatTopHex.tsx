import * as React from 'react'

import {TerrainView} from './TerrainView'
import {Hex} from '../model/Hex'
import {Terrain} from '../model/Terrain';
import {CartPair} from '../../../common/CartPair';
import {HEX_POINTS} from './HexConstants';
import {HexViewProps} from './HexViewProps';

export interface FlatTopHexProps extends HexViewProps {
    centerX: number
    centerY: number
}

// Attribute of the top <g>, for retrieval from Touch events
const HEX_ID_ATTRIBUTE = 'hex-id'

// persist a touch event and connect it to a Hex
class HexTouch {
    readonly screen: CartPair
    readonly client: CartPair
    readonly page: CartPair
    readonly id: number

    // from attribute hex-id
    readonly hex: Hex  // can be Hex.NONE

    constructor(t: Touch) {
        this.id = t.identifier
        this.screen = new CartPair(t.screenX, t.screenY)
        this.client = new CartPair(t.clientX, t.clientY)
        this.page = new CartPair(t.pageX, t.pageY)
        this.hex = this.getHexFromPoint()
    }

    private getHexFromPoint(): Hex {
        const elements: Element[] = document.elementsFromPoint(this.client.x, this.client.y)
        for (let elem of elements) {
            // in the presence of malformed hex-id
            const hexIdString: string | null = elem.getAttribute(HEX_ID_ATTRIBUTE)
            if (hexIdString)
                return Hex.getById(parseInt(hexIdString, 10))
        }
        return Hex.NONE;
    }

    toString(): string {
        return `Touch #${this.id} at ${this.hex ? this.hex.toString() : 'no hex'} — screen ${this.screen.round} / client ${ this.client.round} / page ${this.page.round}`
    }
}

// a hexagon centered at (x, y)
export class FlatTopHex
    extends React.PureComponent<FlatTopHexProps>
{
    constructor(props: FlatTopHexProps) {
        super(props)
        this.logEvent = this.logEvent.bind(this)
        this.onTouchStart = this.onTouchStart.bind(this)
        this.onTouchMove = this.onTouchMove.bind(this)
        this.onTouchEnd = this.onTouchEnd.bind(this)
    }

    onTouchStart(e: React.TouchEvent) {
        // this.logEvent(e)
        if (this.props.onPlaceCursor) {
            for (let i = 0; i < e.touches.length; ++i) {
                const hexTouch = new HexTouch(e.touches[i])
                // console.log(`  — set cursor ${hexTouch}`)
                this.props.onPlaceCursor(hexTouch.id, hexTouch.hex, false)
            }
            if (e.cancelable)
                e.preventDefault()
        }
    }

    onTouchMove(e: React.TouchEvent) {
        // this.logEvent(e)
        if (this.props.onDrag) {
            for (let i = 0; i < e.touches.length; ++i) {
                const hexTouch = new HexTouch(e.touches[i])
                // console.log(`  — ${hexTouch.toString()}`)
                if (hexTouch.hex !== Hex.NONE)
                    this.props.onDrag(hexTouch.id, hexTouch.hex)
            }
            if (e.cancelable)
                e.preventDefault()
        }
    }

    onTouchEnd(e: React.TouchEvent) {
        // this.logEvent(e)
        if (this.props.onClearCursor) {
            for (let i = 0; i < e.changedTouches.length; ++i) {
                const hexTouch = new HexTouch(e.changedTouches[i])
                // console.log(`  — clearing cursor — ${hexTouch}`)
                this.props.onClearCursor(hexTouch.id)
            }
            if (e.cancelable)
                e.preventDefault()
        }
    }

    logEvent(e: React.SyntheticEvent, prefix: string = '') {
        // tslint:disable-next-line
        console.log(
            `${prefix}@${this.props.hex} ${e.nativeEvent.type} — ${this.props.tile} ${this.props.color.toHexString()}`)
    }

    render(): React.ReactNode {
        const hexIdAttribute = {}
        hexIdAttribute[HEX_ID_ATTRIBUTE] = this.props.hex.id

        const children: JSX.Element[] = [(
            <polygon
                {...hexIdAttribute}
                key="bg"
                points={HEX_POINTS}
                style={
                    this.props.color && {
                        fill: this.props.color.toHexString()
                    }
                }
            />
        )]

        if (this.props.selected)
            children.push(
                <polygon
                    key="cursor"
                    className="cursor"
                    points={HEX_POINTS}
                    style={{
                        stroke: this.props.color.contrast().toHexString(),
                    }}
                />
            )

        children.push(
            <polygon
                key="hover"
                className="hover"
                points={HEX_POINTS}
                style={{
                    stroke: this.props.color.contrast().toHexString(),
                }}
            />
        )

        if (this.props.tile.terrain !== Terrain.Empty) children.push(
            <TerrainView
                key={this.props.hex.id}
                tile={this.props.tile}
                color={this.props.color}
            />
        )

        if (Array.isArray(this.props.children))
            children.push(...this.props.children as JSX.Element[])
        else if (this.props.children)
            children.push(this.props.children as JSX.Element)

        return (
            <g
                transform={`translate(${this.props.centerX} ${this.props.centerY})`}
                className={`FlatTopHex ${this.props.tile.owner} tile${this.props.selected ? ' active' : ''}`}

                onTouchStart={this.onTouchStart}
                onTouchMove={this.onTouchMove}
                onTouchCancel={this.onTouchEnd}
                onTouchEnd={this.onTouchEnd}

                onMouseEnter={(e) => {
                    // left mouse button
                    if (this.props.onDrag && e.buttons === 1) {
                        this.props.onDrag(0, this.props.hex)
                        e.preventDefault()
                    }
                }}
                onMouseDown={(e) => {
                    if (this.props.onPlaceCursor) {
                        this.props.onPlaceCursor(0, this.props.hex, true)
                        e.preventDefault()
                    }
                }}
            >
                {children}
            </g>
        )    }
}