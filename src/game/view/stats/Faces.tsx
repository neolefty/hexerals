import * as React from 'react'

import {CartPair} from '../../../common/CartPair'
import {DriftColor} from '../../../color/DriftColor'
import {StatsPanelProps} from './StatsPanel'
import {Player} from '../../model/players/Players'
import {TurnStat} from '../../model/stats/TurnStat'
import {PlayerFace} from './PlayerFace'

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

    const orderFaces = (a: Player, b: Player): number => {
        // if currently alive, rank is positive — simply pop
        // if dead, rank is more negative the earlier you died
        const aRank = latest.pop.get(a, demises.get(a, 0) - curTurn)
        const bRank = latest.pop.get(b, demises.get(b, 0) - curTurn)
        return aRank - bRank
    }

    const players = props.boardState.board.players
    const d = Math.min(
        props.displaySize.max * FACES_FRACTION_LENGTH / players.size,
        props.displaySize.min * FACES_FRACTION_WIDTH,
    )
    const dy = props.displaySize.isVertical ? d : 0
    const dx = props.displaySize.isHorizontal ? d : 0
    const y = props.displaySize.isVertical
        ? 0 // vertical always start at the top
        : props.flipped ? props.displaySize.y - d : 0 // horizontal start at the top unless flipped
    const x = props.displaySize.isHorizontal
        ? 0 // horizontal always start at the left
        : props.flipped ? props.displaySize.x - d : 0 // vertical start at left unless flipped
    const side = d - MARGIN
    const viewBox = `${SIZE.scale(-1).toString(' ')} ${SIZE.scale(2).toString(' ')}`

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
                return (
                    <svg
                        key={player}
                        viewBox={viewBox}
                        x={x + dx * (index)}
                        y={y + dy * (index)}
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

