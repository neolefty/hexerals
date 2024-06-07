import "./global.css"
import { ColorSchemeScript, MantineProvider } from "@mantine/core"

export const metadata = {
    title: "Welcome to accessible-colors",
    description: "Generated by create-nx-workspace",
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <head>
                <ColorSchemeScript />
            </head>
            <body>
                <MantineProvider>{children}</MantineProvider>
            </body>
        </html>
    )
}