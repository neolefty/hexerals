import * as React from 'react'

import {CartPair} from '../../../common/CartPair'
import {DriftColor} from '../../../color/DriftColor'
import {StatsPanelProps} from './StatsPanel'
import {Player} from '../../model/players/Players'
import {TurnStat} from '../../model/stats/TurnStat'

// viewbox is -SIZE to SIZE — for example, -10,-10 to 10,10
const SIZE = new CartPair(10, 10)

// space between faces
const MARGIN = 5

// how much of the status panel do faces take up (0.5 would be half)
const FACES_FRACTION = 0.9

interface FaceProps extends FaceShapeProps, InscriptionProps {
}

interface FaceShapeProps {
    color: DriftColor
}

interface InscriptionProps {
    color: DriftColor
    superTitle?: string
    contents?: string
    alt?: string
    verticalShift?: number
}

const HumanFaceShape = (props: FaceShapeProps) => (
    <ellipse
        rx='6' ry='7'
        stroke={props.color.texture().hexString}
        strokeWidth='1'
        fill={props.color.hexString}
    />
)

const HumanGraveShape = (props: FaceShapeProps) => (
    <>
        <ellipse cy='-5' rx='5' ry='3' />
        <rect x='-5' y='-5' width='10' height='10' stroke='none' />
        <line x1='5' y1='-5' x2='5' y2='5' />
        <line x1='-5' y1='-5' x2='-5' y2='5' />
        <polygon
            points='-8,9 -8,8 -6,5 6,5 8,8 8,9'
            fill={props.color.texture().hexString}
        />
    </>
)

const RobotFaceShape = (props: FaceShapeProps) => (
    <>
        <rect x='-5' y='-4' width='10' height='12' rx='1' ry='1' />
        <line y1='-6' y2='-4' />
        <circle cy='-7' r='1' />
    </>
)

const RobotGraveShape = (props: FaceShapeProps) =>
    HumanGraveShape(props)

interface PlayerFaceShapeProps extends FaceShapeProps {
    alive: boolean
    human: boolean
}

interface PlayerFaceProps extends PlayerFaceShapeProps, FaceProps {}

const PlayerFaceShape = (props: PlayerFaceShapeProps) => {
    return props.human
        ? (props.alive
            ? (<HumanFaceShape color={props.color}/>)
            : (<HumanGraveShape color={props.color}/>)
        )
        : (props.alive
            ? (<RobotFaceShape color={props.color}/>)
            : (<RobotGraveShape color={props.color}/>)
        )
}

const Inscription = (props: InscriptionProps) => (
    <>
        {
            props.alt ? (<title>{props.alt}</title>) : undefined
        }
        {
            props.contents ? (
                <text
                    y={(props.verticalShift || 0) + 5.5}
                    fill={props.color.contrast().hexString}
                    fontSize="5.5"
                    textAnchor="middle"
                    stroke="none"
                >{props.contents}</text>
            ) : undefined
        }
        {
            props.superTitle ? (
                <text
                    y={props.verticalShift || 0}
                    fill={props.color.contrast().hexString}
                    fontSize="2.7"
                    textAnchor="middle"
                    stroke="none"
                >{props.superTitle}</text>
            ) : undefined
        }
    </>
)

const PlayerFace = (props: PlayerFaceProps) => (
    <g
        stroke={props.color.texture().hexString}
        strokeWidth='1'
        fill={props.color.hexString}
        strokeLinecap='round'
    >
        <PlayerFaceShape {...props} />
        <Inscription {...props} />
    </g>
)

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
    const y = props.displaySize.isVertical ? props.displaySize.y - MARGIN : MARGIN
    const x = MARGIN
    const d = props.displaySize.max * FACES_FRACTION / players.size
    const dy = props.displaySize.isVertical ? -d : 0
    const dx = props.displaySize.isHorizontal ? d : 0
    const side = d - MARGIN
    const viewBox = `${SIZE.scale(-1).toString(' ')} ${SIZE.scale(2).toString(' ')}`

    return (
        <>{
            players.sort(orderFaces).map((player, index) => {
                const color = props.colors.get(player, DriftColor.GREY_60)
                const isAlive = !demises.has(player)
                const isHuman = !props.boardState.players.isRobot(player)
                const superTitle = isAlive ? 'pop' : 'turn'
                const contents = demises.has(player)
                    ? `${Math.floor(demises.get(player, -1)/2)}`
                    : props.faceText && props.faceText(latest, player)
                return (
                    <svg
                        key={player}
                        viewBox={viewBox}
                        x={x + dx * (index)}
                        y={y + dy * (index + 1)}
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

