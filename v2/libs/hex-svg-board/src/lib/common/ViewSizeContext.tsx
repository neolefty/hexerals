import { Context, PropsWithChildren, useContext, createContext } from "react"
import { CartPair } from "@hexerals/hexlib"

export const useDisplaySize = (): CartPair => useContext(DisplaySizeContext)

const DisplaySizeContext: Context<CartPair> = createContext(CartPair.ORIGIN)

interface ProvideDisplaySizeProps extends PropsWithChildren {
    size: CartPair
}

export const ProvideDisplaySize = (props: ProvideDisplaySizeProps) => (
    <DisplaySizeContext.Provider value={props.size}>
        {props.children}
    </DisplaySizeContext.Provider>
)
