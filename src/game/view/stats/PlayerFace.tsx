import * as React from 'react'

import {DriftColor} from '../../../color/DriftColor'
import {PlayerFaceShapeProps, FaceShapeProps, PlayerFaceShape} from './PlayerFaceShape'

interface FaceProps extends FaceShapeProps, InscriptionProps {
}

interface InscriptionProps {
    color: DriftColor
    superTitle?: string
    contents?: string
    alt?: string
    verticalShift?: number
}

interface PlayerFaceProps extends PlayerFaceShapeProps, FaceProps {
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

export const PlayerFace = (props: PlayerFaceProps) => (
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