import { Card } from "@mantine/core"
import { Podger } from "./Podger"

export default async function Index() {
    return (
        <>
            <h1>Accessible Colors</h1>
            <Card>Mantine Card</Card>
            <button>Clicky</button>
            <Podger />
        </>
    )
}
