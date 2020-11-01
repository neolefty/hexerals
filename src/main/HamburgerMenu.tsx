import {useCallback} from "react"
import * as React from "react"
import {useHistory} from "react-router-dom"
import {CartPair} from "../common/CartPair"

interface HamburgerMenuProps {
    style: React.CSSProperties
    displaySize: CartPair
    to: string
}

export const HamburgerMenu = (props: HamburgerMenuProps) => {
    const history = useHistory()
    const handleClick = useCallback(() => history.push(props.to), [history, props.to])
    return (
        <div style={props.style} onClick={handleClick}>
            <svg></svg>
        </div>
    )
}
