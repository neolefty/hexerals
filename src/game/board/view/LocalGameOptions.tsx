import * as React from 'react'

import CartPair from '../../../common/CartPair'
import './LocalGameOptions.css'
import {CheckInput, NumberInput} from '../../../common/Inputs';
import {BasicRobotSettings} from '../model/players/BasicRobot';

export interface LocalGameOptions {
    // All numbers because our reducer assumes it.
    // If we need a non-number, the reducer should be easy to modify.
    numRobots: number
    tickMillis: number
    boardWidth: number
    boardHeight: number
    mountainPercent: number
    difficulty: number

    // booleans
    fog: number
    capitals: number
    showAdvanced: number  // advanced options visible?
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
                blockTabbing={advanced ? !this.isShowAdvanced() : false}
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
                            'Robots', 'numRobots', 0, 11, 'How many AI opponents?'
                        )}
                        {numberInput(
                            'Difficulty', 'difficulty', 0, BasicRobotSettings.MAX_INTELLIGENCE, 'How smart should those robots be?'
                        )}
                        {numberInput('Width', 'boardWidth', 1, 29, 'How many tiles wide?')}
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
                        {checkInput('Capitals', 'capitals', 'Kill a player when you capture their home.', true)}
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