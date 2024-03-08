"use client"

import { useLayoutEffect, useState } from "react"
import { List } from "immutable"

// const INITIAL_COLORS = new ColorPodge()
//     .addRandomColor()
//     .addRandomColor()
//     .addRandomColor()

// TODO when copying objects in inner loop, use spread operator in Chrome and Object.assign in Safari

export const Podger = () => {
    const list = List([1, 2, 3])
    // const [podge, setPodge] = useState(INITIAL_COLORS)
    useLayoutEffect(() => {}, [])
    return (
        <div
            style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
        >
            <div style={{ padding: "20px", backgroundColor: "red" }}>red</div>
            <div style={{ padding: "20px", backgroundColor: "blue" }}>blue</div>
            {/*{podge.driftColors.toArray().map((color, i) => (*/}
            {/*    <div*/}
            {/*        key={i}*/}
            {/*        style={{*/}
            {/*            padding: "20px",*/}
            {/*            backgroundColor: color.hexString,*/}
            {/*        }}*/}
            {/*    >*/}
            {/*        {color.hexString}*/}
            {/*    </div>*/}
            {/*))}*/}
        </div>
    )
}
