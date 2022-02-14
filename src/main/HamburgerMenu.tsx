import {useCallback} from "react"
import * as React from "react"
import {useNavigate} from "react-router-dom"
import {CartPair} from "../common/CartPair"

interface HamburgerMenuProps {
    style: React.CSSProperties
    displaySize: CartPair
    to: string
}

export const HamburgerMenu = (props: HamburgerMenuProps) => {
    const navigate = useNavigate()
    const handleClick = useCallback(() => navigate(props.to), [navigate, props.to])
    return (
        <div style={props.style} onClick={handleClick}>
            <svg></svg>
        </div>
    )
}
