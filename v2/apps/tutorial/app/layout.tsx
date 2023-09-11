import { PropsWithChildren } from "react"
import "./global.css"
import { APP_NAME } from "@hexerals/hexlib"
import { Inter } from "next/font/google"

export const metadata = {
    title: `${APP_NAME} • Tutorial`,
    description: `Learn how to play ${APP_NAME}.`,
}

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }: PropsWithChildren) {
    return (
        <html lang="en">
            <body className={inter.className}>{children}</body>
        </html>
    )
}
