import * as React from "react"
import {ReactNode, useCallback} from "react"
import {useNavigate} from "react-router-dom"

interface NavButtonProps {
    to: string
    children?: ReactNode
}

export const NavButton = (props: NavButtonProps) => {
    const navigate = useNavigate()
    const handleClick = useCallback(() => navigate(props.to), [navigate, props.to])
    return (
        <button onClick={handleClick}>{props.children}</button>
    )
}

export const useNavTo = (path: string) => {
    const navigate = useNavigate()
    return useCallback(() => navigate(path), [navigate, path])
}
