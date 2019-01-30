import * as React from 'react';
import './Layered.css'

export const Layered: React.FunctionComponent = ({children}) => {
    // noinspection JSDeprecatedSymbols
    if (Array.isArray(children)) {
        return (
            <div className="LayeredContainer">{
                (children as React.ReactNodeArray).map(
                    (kid, index) => (
                        <div
                            key={index}
                            className="LayeredChild"
                        >
                            {kid}
                        </div>
                    )
                )
            }</div>
        )
    }
    else if (children) {
        return children as React.ReactElement<any>
    }
    else
        return null
}
