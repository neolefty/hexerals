import * as React from "react"
import "./Layered.css"
import { PropsWithChildren } from "react"

export const Layered = ({ children }: PropsWithChildren) => {
    // noinspection JSDeprecatedSymbols
    if (Array.isArray(children)) {
        return (
            <div className="LayeredContainer">
                {(children as React.ReactNodeArray).map((kid, index) => (
                    <div key={index} className="LayeredChild">
                        {kid}
                    </div>
                ))}
            </div>
        )
    } else if (children) {
        return children as React.ReactElement
    } else return null
}
