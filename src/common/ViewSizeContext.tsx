import React, {Context, useContext} from "react"
import {CartPair} from "./CartPair"
import {HasChildren} from "./HasChildren"

export const useDisplaySize = (): CartPair => useContext(DisplaySizeContext)

const DisplaySizeContext: Context<CartPair> = React.createContext(CartPair.ORIGIN)

interface DisplaySizeProviderProps extends HasChildren {
    size: CartPair
}

export const ProvideDisplaySize = (props: DisplaySizeProviderProps) =>
    <DisplaySizeContext.Provider value={props.size}>
        {props.children}
    </DisplaySizeContext.Provider>
