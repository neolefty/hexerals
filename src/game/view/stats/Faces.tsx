import * as React from 'react'

import {CartPair} from '../../../common/CartPair'
import {DriftColor} from '../../../color/DriftColor'
import {StatsPanelProps} from './StatsPanel'
import {Player} from '../../model/players/Players'
import {TurnStat} from '../../model/stats/TurnStat'
import {PlayerFace} from './PlayerFace'
import {packSquares} from './PackSquares'

// viewbox is -SIZE to SIZE — for example, -10,-10 to 10,10
const SIZE = new CartPair(10, 10)

// space between faces
const MARGIN = 5

// lengthwise, how much of the status panel do faces take up (0.5 would be half)
const FACES_FRACTION_LENGTH = 0.9
const FACES_FRACTION_WIDTH = 1

interface FacesProps extends StatsPanelProps {
    faceText?: (stat: TurnStat, player: Player) => string
    superTitle?: string
}

const verticalShift = (isAlive: boolean, isHuman: boolean) =>
    isAlive
        ? (isHuman ? -2.5 : 0)
        : (isHuman ? -2.5 : -2.5)

export const Faces = (props: FacesProps) => {
    const stats = props.boardState.stats
    const latest = stats.last
    const demises = stats.lastTurns
    const curTurn = latest.turn
    const players = props.boardState.board.players
    const ds = props.displaySize
    const facesArea = ds.scaleXY(
        ds.isHorizontal ? FACES_FRACTION_LENGTH : FACES_FRACTION_WIDTH,
        ds.isVertical ? FACES_FRACTION_LENGTH : FACES_FRACTION_WIDTH,
    )
    const vert = facesArea.isVertical
    const horiz = facesArea.isHorizontal
    const grid = packSquares(players.size, facesArea.x / facesArea.y)

    const orderFaces = (a: Player, b: Player): number => {
        // if currently alive, rank is positive — simply pop
        // if dead, rank is more negative the earlier you died
        const aRank = latest.pop.get(a, demises.get(a, 0) - curTurn)
        const bRank = latest.pop.get(b, demises.get(b, 0) - curTurn)
        return aRank - bRank
    }

    const d = Math.min(facesArea.x / grid.x, facesArea.y / grid.y)
    const dx = horiz ? d : (props.flipped ? -d : d)
    const dy = vert ? d : (props.flipped ? -d : d)
    const startY = vert
        ? 0 // vertical always start at the top
        : props.flipped ? ds.y - d : 0 // horizontal start at the top unless flipped
    const startX = horiz
        ? 0 // horizontal always start at the left
        : props.flipped // start on outside
            ? ds.x - d // vertical flipped — start in right column
            : 0 // vertical not flipped — start in left column
    const side = d - MARGIN
    const viewBox = `${SIZE.scale(-1).toString(' ')} ${SIZE.scale(2).toString(' ')}`
    // push faces up to front of UI — highest one close to leading edge of graph
    const bump = grid.product - players.size

    return (
        <>{
            players.sort(orderFaces).map((player, index) => {
                const color = props.colors.get(player, DriftColor.GREY_60)
                const isAlive = !demises.has(player)
                const isHuman = !props.boardState.players.isRobot(player)
                const superTitle = isAlive ? 'pop' : 'R I P'
                const contents = demises.has(player)
                    ? `${Math.floor(demises.get(player, -1)/2)}`
                    : props.faceText && props.faceText(latest, player)
                const bumped = index + bump
                let x = vert ? bumped % grid.x : Math.floor(bumped / grid.y)
                let y = vert ? Math.floor(bumped / grid.x) : bumped % grid.y
                // if (vert && !props.flipped)
                //     x = grid.x - x - 1
                // if (horiz && !props.flipped)
                //     y = grid.y - y - 1
                return (
                    <svg
                        key={player}
                        viewBox={viewBox}
                        x={startX + dx * x}
                        y={startY + dy * y}
                        width={side}
                        height={side}
                    >
                        <PlayerFace
                            alive={isAlive}
                            human={isHuman}
                            color={color}
                            contents={contents}
                            superTitle={superTitle}
                            verticalShift={verticalShift(isAlive, isHuman)}
                        />
                    </svg>
                )
            })
        }</>
    )
}

