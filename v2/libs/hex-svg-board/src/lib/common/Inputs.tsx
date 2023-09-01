import * as React from "react"
import Dropdown from "react-dropdown"
import "react-dropdown/style.css"
import "./Inputs.css"

import { minMax } from "@hexerals/hexlib"
import { Map } from "immutable"

export interface InputProps {
    label: string
    title: string
    blockTabbing?: boolean
    onEnter: () => void
}

export interface NumberInputProps extends InputProps {
    value: number
    min: number
    max: number
    step?: number
    onChange: (x: number) => void
    children?: JSX.Element | JSX.Element[]
}

const onEnterKey = (effect: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
        e.preventDefault()
        effect()
    }
}
export const NumberInput = (props: NumberInputProps) => (
    <label className="IntInput" title={props.title}>
        {props.children}
        {props.label}
        <input
            type="number"
            min={props.min}
            max={props.max}
            step={props.step || 1}
            value={props.value}
            tabIndex={props.blockTabbing ? -1 : undefined}
            onKeyPress={onEnterKey(props.onEnter)}
            style={{ width: `${props.max.toString().length * 0.65 + 1.3}em` }}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const str = e.currentTarget.value
                const step = props.step || 1
                if (str) {
                    const parsed =
                        step === Math.floor(step)
                            ? parseInt(str, 10)
                            : parseFloat(str)
                    if (!isNaN(parsed))
                        props.onChange(minMax(parsed, props.min, props.max))
                }
            }}
        />
    </label>
)

export interface CheckInputProps extends InputProps {
    value: boolean
    onToggle: () => void
}
export const CheckInput = (props: CheckInputProps) => (
    <label className="CheckInput" title={props.title}>
        {props.label}
        <input
            type="checkbox"
            checked={props.value}
            tabIndex={props.blockTabbing ? -1 : undefined}
            onChange={props.onToggle}
            onKeyPress={onEnterKey(props.onEnter)}
        />
    </label>
)

export interface SelectNumberProps extends InputProps {
    value: number
    choices: Map<string, number>
    onChange: (x: number) => void
}
export const SelectNumber = (props: SelectNumberProps) => (
    <label className="SelectNumber" title={props.title}>
        {props.label}
        <select
            onChange={(e: React.ChangeEvent) => {
                const str = e.currentTarget.nodeValue
                const x = str ? parseInt(str, 10) : props.value
                if (isNaN(x)) console.warn(`${str} is not a number`)
                else if (x !== props.value) props.onChange(x)
            }}
            value={props.value}
        >
            {props.choices.entrySeq().map(([name, value], index) => (
                <option key={index} value={value}>
                    {name}
                </option>
            ))}
        </select>
    </label>
)

export const DropdownNumber = (props: SelectNumberProps) => (
    <label className="SelectNumber" title={props.title}>
        {props.label}
        <Dropdown
            options={props.choices
                .entrySeq()
                .map(([name, value]) => ({ value: `${value}`, label: name }))
                .toArray()}
            onChange={({ value, label }) =>
                props.onChange(Number.parseFloat(value))
            }
            key={props.label}
            value={`${props.value}`}
        />
    </label>
)
