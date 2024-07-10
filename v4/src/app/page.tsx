import styles from "./page.module.css"
import { createDumbBoard } from "./_lib/game-model/GenerateBoard"

export default async function Home() {
    const board = createDumbBoard()
    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <h1>Hexerals v4</h1>
                <p>A simple board has {board.spots.length} spots.</p>
            </main>
        </div>
    )
}
