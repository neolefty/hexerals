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
    showAdvanced: number
}

export interface LGOProps {
    localOptions: LocalGameOptions
    displaySize: CartPair

    changeLocalOption: (name: string, n: number) => void
    newGame: () => void
}

export class LocalGameOptionsView
    extends React.Component<LGOProps>
{
    isAdvancedVisible = (): boolean => this.props.localOptions.showAdvanced > 0

    toggleAdvanced = () => {
        this.props.changeLocalOption('showAdvanced', this.isAdvancedVisible() ? 0 : 1)
    }

    render(): React.ReactNode {
        const optionChanger = (name: string) =>
            (n: number) => this.props.changeLocalOption(name, n)

        return (
            <div
                className={`LocalGameOptionsView Column ${
                    this.isAdvancedVisible() ? 'ShowAdvanced' : 'HideAdvanced'
                }`}
                style={{
                    width: this.props.displaySize.x,
                    height: this.props.displaySize.y,
                }}
            >
                <div className="Row">
                    <div className="Basic Column">
                        <NumberInput
                            label="Players"
                            value={this.props.localOptions.numPlayers}
                            title="How many players? One will be you, and the others very stupid AIs."
                            min={1}
                            max={12}
                            onChange={optionChanger('numPlayers')}
                            onEnter={this.props.newGame}
                        />
                        <NumberInput
                            label="Width"
                            title="How many hexes across?"
                            value={this.props.localOptions.boardWidth}
                            min={1}
                            max={23}
                            onChange={optionChanger('boardWidth')}
                            onEnter={this.props.newGame}
                        />
                        <NumberInput
                            label="Height"
                            title="How many hexes tall?"
                            value={this.props.localOptions.boardHeight}
                            min={2}
                            max={15}
                            onChange={optionChanger('boardHeight')}
                            onEnter={this.props.newGame}
                        />
                    </div>
                    <div className="Advanced Column">
                        <NumberInput
                            label="Mountains"
                            title="Percent of the map covered in mountains."
                            value={this.props.localOptions.mountainPercent}
                            min={0}
                            max={50}
                            onChange={optionChanger('mountainPercent')}
                            onEnter={this.props.newGame}
                            blockTabbing={!this.isAdvancedVisible()}
                        />
                        <NumberInput
                            label="Tick"
                            title="Milliseconds between turns."
                            value={this.props.localOptions.tickMillis}
                            min={1}
                            max={9999}
                            onChange={optionChanger('tickMillis')}
                            onEnter={this.props.newGame}
                            blockTabbing={!this.isAdvancedVisible()}
                        />
                    </div>
                    <div>
                        <button onClick={this.toggleAdvanced}>
                            {this.isAdvancedVisible() ? '<<<' : '>>>'}
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
    onEnter?: () => void
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
            tabIndex={props.blockTabbing ? -1 : undefined}
            onKeyPress={
                (e: React.KeyboardEvent) => {
                    if (props.onEnter && e.key === 'Enter') {
                        e.preventDefault()
                        props.onEnter()
                    }
                }
            }
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