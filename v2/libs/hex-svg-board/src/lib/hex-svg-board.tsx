import styles from './hex-svg-board.module.less'

/* eslint-disable-next-line */
export interface HexSvgBoardProps {}

export function HexSvgBoard(props: HexSvgBoardProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to HexSvgBoard!</h1>
      <p>Stick around.</p>
      <p>Stay close.</p>
    </div>
  )
}

export default HexSvgBoard
