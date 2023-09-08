import { PropsWithChildren } from "react"
import "./global.css"
import { APP_NAME } from "@hexerals/hexlib"

export const metadata = {
    title: `${APP_NAME} • Tutorial`,
    description: `Learn how to play ${APP_NAME}.`,
}

export default function RootLayout({ children }: PropsWithChildren) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
