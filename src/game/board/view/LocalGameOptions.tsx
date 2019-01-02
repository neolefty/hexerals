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
    startingPop: number

    // booleans
    fog: number
    capitals: number
    levelVisible: number  // advanced options visible?
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

    isLevelVisible = (level: number) =>
        this.props.localOptions.levelVisible >= level
    toggleAdvanced = () =>
        this.props.changeLocalOption(
            'levelVisible',
            (this.props.localOptions.levelVisible + 1) % 3 // 0, 1, 2
        )

    render(): React.ReactNode {
        const optionChanger = (name: string) =>
            (n: number) => this.props.changeLocalOption(name, n)
        const optionToggler = (optionName: string) =>
            () => this.toggleOption(optionName)

        const numberInput = (
            label: string, option: string, min: number, max: number, title: string,
            level: number = 0, children?: JSX.Element | JSX.Element[],
        ) => (
            <NumberInput
                label={label}
                value={this.props.localOptions[option]}
                title={title}
                min={min}
                max={max}
                onChange={optionChanger(option)}
                onEnter={this.props.newGame}
                blockTabbing={!this.isLevelVisible(level)}
                children={children}
            />
        )

        const checkInput = (
            label: string, option: string, title: string, advanced: number = 0
        ) => (
            <CheckInput
                label={label}
                value={this.isOption(option)}
                title={title}
                onChange={optionToggler(option)}
                onEnter={this.props.newGame}
                blockTabbing={!this.isLevelVisible(advanced)}
            />
        )

        return (
            <div
                className={`LocalGameOptionsView Column Show${
                    this.props.localOptions.levelVisible
                }`}
                style={{
                    width: this.props.displaySize.x,
                    height: this.props.displaySize.y,
                }}
            >
                <div className="Row">
                    <div className="Level0 Column">
                        {numberInput('Robots', 'numRobots', 0, 11, 'How many AI opponents?')}
                        {numberInput('Difficulty', 'difficulty', 0, BasicRobotSettings.MAX_INTELLIGENCE, 'How smart should those robots be?')}
                        {numberInput('Width', 'boardWidth', 1, 29, 'How many tiles wide?')}
                        {numberInput('Height', 'boardHeight', 2, 15, 'How many tiles tall?')}
                    </div>
                    <div className="Level1 Column">
                        {numberInput('Mountains', 'mountainPercent', 0, 50, 'Percent of the map covered by mountains', 1)}
                        {numberInput('Tick', 'tickMillis', 1, 9999, 'Milliseconds between turns', 1)}
                        {checkInput('Fog', 'fog', 'Hide the areas you don\'t control.', 1)}
                        {checkInput('Capitals', 'capitals', 'Kill a player when you capture their home.', 1)}
                    </div>
                    <div className="Level2 Column">
                        {numberInput('', 'startingPop', 0, 1000000, 'Population of your initial tile.', 2, (
                            <div><span>Starting</span><br/><span>Population</span></div>
                        ))}
                    </div>
                    <div>
                        <button
                            onClick={this.toggleAdvanced}
                            title={[
                                'Show advanced options',
                                'Show more advanced options',
                                'Hide advanced options',
                            ][this.props.localOptions.levelVisible]}
                        >
                            {['>>>', '>>>', '<<<'][this.props.localOptions.levelVisible]}
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