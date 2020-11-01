import * as React from "react"
import {ReactNode, useCallback} from "react"
import {useHistory} from "react-router-dom"

interface NavButtonProps {
    to: string
    children?: ReactNode
}

export const NavButton = (props: NavButtonProps) => {
    const history = useHistory()
    const handleClick = useCallback(() => history.push(props.to), [history, props.to])
    return (
        <button onClick={handleClick}>{props.children}</button>
    )
}

export const useNavTo = (path: string) => {
    const history = useHistory()
    return useCallback(() => history.push(path), [history, path])
}
