import * as React from 'react';

export interface NumberInputProps {
    label: string
    title: string
    value: number
    min: number
    max: number
    step?: number
    blockTabbing?: boolean

    onChange: (x: number) => void
    onEnter: () => void
}

const minMax = (x: number, min: number, max: number) =>
    Math.max(min, Math.min(max, x))
const onEnterKey = (effect: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        e.preventDefault()
        effect()
    }
}
export const NumberInput = (props: NumberInputProps) => (
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
            tabIndex={props.blockTabbing ? -1 : undefined}
            onKeyPress={onEnterKey(props.onEnter)}
            style={{width: `${props.max.toString().length * 0.65 + 1.3}em`}}
            onChange={
                (e: React.ChangeEvent<HTMLInputElement>) => {
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
                }
            }
        />
    </label>
)

export interface CheckInputProps {
    label: string
    title: string
    value: boolean
    blockTabbing?: boolean

    onChange: () => void
    onEnter: () => void
}

export const CheckInput = (props: CheckInputProps) => (
    <label
        className="CheckInput"
        title={props.title}
    >
        {props.label}
        <input
            type="checkbox"
            checked={props.value}
            tabIndex={props.blockTabbing ? -1 : undefined}
            onChange={props.onChange}
            onKeyPress={onEnterKey(props.onEnter)}
        />
    </label>
)