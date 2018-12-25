import * as React from 'react'
import Dimension from '../../common/Dimension'
import './LocalGameOptions.css'

export interface LocalGameOptions {
    numPlayers: number
    tickMillis: number
    boardWidth: number
    boardHeight: number
    mountainPercent: number
}

export interface LocalGameOptionsViewProps {
    localOptions: LocalGameOptions
    displaySize: Dimension

    changeLocalOption: (name: string, n: number) => void
    newGame: () => void
}

export const LocalGameOptionsView = (props: LocalGameOptionsViewProps) => {
    const optionChanger = (name: string) =>
        (n: number) => props.changeLocalOption(name, n)

    return (
        <div
            className="LocalGameOptionsView"
            style={{
                width: props.displaySize.w,
                height: props.displaySize.h,
            }}
        >
            <NumberInput
                label="Players"
                value={props.localOptions.numPlayers}
                title="How many players? One will be you, and the others very stupid AIs."
                min={1}
                max={12}
                onChange={optionChanger('numPlayers')}
            />
            <NumberInput
                label="Width"
                title="How many hexes across?"
                value={props.localOptions.boardWidth}
                min={1}
                max={23}
                onChange={optionChanger('boardWidth')}
            />
            <NumberInput
                label="Height"
                title="How many hexes tall?"
                value={props.localOptions.boardHeight}
                min={2}
                max={15}
                onChange={optionChanger('boardHeight')}
            />
            <NumberInput
                label="Tick"
                title="Milliseconds between turns."
                value={props.localOptions.tickMillis}
                min={1}
                max={9999}
                onChange={optionChanger('tickMillis')}
            />
            <NumberInput
                label="Mountains"
                title="Percent of the map covered in mountains."
                value={props.localOptions.mountainPercent}
                min={0}
                max={50}
                onChange={optionChanger('mountainPercent')}
            />
            <button
                onClick={props.newGame}
            >
                Start Game
            </button>
        </div>
    )
}

interface IntInputProps {
    label: string
    title: string
    value: number
    onChange: (x: number) => void
    min: number
    max: number
    step?: number
}

const minMax = (x: number, min: number, max: number) =>
    Math.max(min, Math.min(max, x))

const NumberInput = (props: IntInputProps) => (
    <label
        className="IntInput"
        title={props.title}
    >
        {props.label}
        <input
            type="number"
            min={props.min}
            max={props.max}
            step={props.step || 1}
            value={props.value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const str = e.currentTarget.value
                const step = props.step || 1
                if (str) {
                    const parsed = (step === Math.floor(step))
                        ? parseInt(str, 10)
                        : parseFloat(str)
                    if (!isNaN(parsed))
                        props.onChange(
                            minMax(parsed, props.min, props.max)
                        )
                }
            }}
        />
    </label>
)
