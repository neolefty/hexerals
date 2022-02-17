import {CartPair} from '../../../common/CartPair'
import {Hex} from '../../model/hex/Hex'
import * as React from 'react'

// persist a touch event and connect it to a Hex
export class HexTouch {
    readonly screen: CartPair
    readonly client: CartPair
    readonly page: CartPair
    readonly id: number

    // from attribute hex-id
    readonly hex: Hex  // can be Hex.NONE

    constructor(t: React.Touch) {
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
            const hexIdString: string | null = elem.getAttribute('hex-id')
            if (hexIdString)
                return Hex.getById(parseInt(hexIdString, 10))
        }
        return Hex.NONE
    }

    toString(): string {
        return `Touch #${this.id} at ${this.hex ? this.hex.toString() : 'no hex'} — screen ${this.screen.round()} / client ${ this.client.round()} / page ${this.page.round()}`
    }
}
