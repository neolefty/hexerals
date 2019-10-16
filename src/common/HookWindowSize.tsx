import {useEffect, useState} from "react"
import {CartPair} from "./CartPair"

const getWindowSize = () =>
    new CartPair(window.innerWidth, window.innerHeight)

export const useWindowSize = (): CartPair => {
    const [size, setSize] = useState(CartPair.ORIGIN)

    const dimensionListener = () =>
        setSize(getWindowSize())

    useEffect(() => {
        dimensionListener() // initial value
        window.addEventListener('resize', dimensionListener)
        return () =>
            window.removeEventListener('resize', dimensionListener)
    }, [])

    return size
}