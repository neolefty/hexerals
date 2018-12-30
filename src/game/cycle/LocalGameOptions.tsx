import * as React from 'react'

import CartPair from '../../common/CartPair'
import './LocalGameOptions.css'

export interface LocalGameOptions {
    // All numbers because our reducer assumes it.
    // If we need a non-number, the reducer should be easy to modify.
    numPlayers: number
    tickMillis: number
    boardWidth: number
    boardHeight: number
    mountainPercent: number

    fog: number  // boolean
    showAdvanced: number  // boolean
}

export interface LGOProps {
    localOptions: LocalGameOptions
    displaySize: CartPair

    changeLocalOption: (name: string, n: number) => void
    newGame: () => void
}

export class LocalGameOptionsView extends React.PureComponent<LGOProps> {
    private isOption = (optionName: string): boolean =>
        this.props.localOptions[optionName] > 0
    private toggleOption = (optionName: string) =>
        this.props.changeLocalOption(optionName, this.isOption(optionName) ? 0 : 1)

    isShowAdvanced = () => this.isOption('showAdvanced')
    toggleAdvanced = () => this.toggleOption('showAdvanced')

    render(): React.ReactNode {
        const optionChanger = (name: string) =>
            (n: number) => this.props.changeLocalOption(name, n)
        const optionToggler = (optionName: string) =>
            () => this.toggleOption(optionName)

        const numberInput = (
            label: string, option: string, min: number, max: number, title: string,
            advanced: boolean = false,
        ) => (
            <NumberInput
                label={label}
                value={this.props.localOptions[option]}
                title={title}
                min={min}
                max={max}
                onChange={optionChanger(option)}
                onEnter={this.props.newGame}
                blockTabbing={advanced ? !this.isShowAdvanced() : false}
            />
        )

        const checkInput = (
            label: string, option: string, title: string, advanced: boolean = false
        ) => (
            <CheckInput
                label={label}
                value={this.isOption(option)}
                title={title}
                onChange={optionToggler(option)}
                onEnter={this.props.newGame}
            />
        )

        return (
            <div
                className={`LocalGameOptionsView Column ${
                    this.isShowAdvanced() ? 'ShowAdvanced' : 'HideAdvanced'
                }`}
                style={{
                    width: this.props.displaySize.x,
                    height: this.props.displaySize.y,
                }}
            >
                <div className="Row">
                    <div className="Basic Column">
                        {numberInput(
                            'Players', 'numPlayers', 1, 12, 'How many players?\n'
                            + 'One will be you, and the others very stupid AIs.'
                        )}
                        {numberInput('Width', 'boardWidth', 1, 23, 'How many tiles wide?')}
                        {numberInput('Height', 'boardHeight', 2, 15, 'How many tiles tall?')}
                    </div>
                    <div className="Advanced Column">
                        {numberInput(
                            'Mountains', 'mountainPercent', 0, 50,
                            'Percent of the map covered by mountains', true
                        )}
                        {numberInput(
                            'Tick', 'tickMillis', 1, 9999,
                            'Milliseconds between turns', true
                        )}
                        {checkInput('Fog', 'fog', 'Hide the areas you don\'t control.', true)}
                    </div>
                    <div>
                        <button
                            onClick={this.toggleAdvanced}
                            title={
                                this.isShowAdvanced()
                                    ? 'Hide advanced options'
                                    : 'Show advanced options'
                            }
                        >
                            {this.isShowAdvanced() ? '<<<' : '>>>'}
                        </button>
                    </div>
                </div>
                <div>
                    <button onClick={this.props.newGame}>
                        Start Game
                    </button>
                </div>
            </div>
        )
    }
}

interface IntInputProps {
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

interface CheckInputProps {
    label: string
    title: string
    value: boolean
    blockTabbing?: boolean

    onChange: () => void
    onEnter: () => void
}

const CheckInput = (props: CheckInputProps) => (
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