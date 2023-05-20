import * as React from 'react'

import {DriftColor} from '../../../color/DriftColor'

export interface FaceShapeProps {
    color: DriftColor
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
        <ellipse cy='-5' rx='5' ry='3'/>
        <rect x='-5' y='-5' width='10' height='10' stroke='none'/>
        <line x1='5' y1='-5' x2='5' y2='5'/>
        <line x1='-5' y1='-5' x2='-5' y2='5'/>
        <polygon
            points='-8,9 -8,8 -6,5 6,5 8,8 8,9'
            fill={props.color.texture().hexString}
        />
    </>
)
const RobotFaceShape = (props: FaceShapeProps) => (
    <>
        <rect x='-5' y='-4' width='10' height='12' rx='1' ry='1'/>
        <line y1='-6' y2='-4'/>
        <circle cy='-7' r='1'/>
    </>
)
export const RobotGraveShape = (props: FaceShapeProps) =>
    HumanGraveShape(props)

export interface PlayerFaceShapeProps extends FaceShapeProps {
    alive: boolean
    human: boolean
}

export const PlayerFaceShape = (props: PlayerFaceShapeProps) => {
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