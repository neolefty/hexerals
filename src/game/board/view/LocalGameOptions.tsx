import * as React from 'react'

import {CartPair} from '../../../common/CartPair'
import './LocalGameOptions.css'
import {CheckInput, NumberInput} from '../../../common/Inputs';
import {BasicRobot} from '../model/players/BasicRobot';

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

const LocalGameOptionsLimits = {
    numRobots: [ 0, 15 ],
    difficulty: [ 0, BasicRobot.MAX_IQ ],
    boardWidth: [ 1, 45 ],
    boardHeight: [ 2, 21 ],
    mountainPercent: [ 0, 50 ],
    tickMillis: [ 1, 9999 ],
    startingPop: [ 0, 999 ],
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
            label: string, option: string, title: string,
            level: number = 0, children?: JSX.Element | JSX.Element[],
        ) => (
            <NumberInput
                label={label}
                value={this.props.localOptions[option]}
                title={title}
                min={LocalGameOptionsLimits[option][0]}
                max={LocalGameOptionsLimits[option][1]}
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
                        {numberInput('Robots', 'numRobots', 'How many AI opponents?')}
                        {numberInput('Difficulty', 'difficulty', 'How smart should those robots be?')}
                        {numberInput('Width', 'boardWidth', 'How many tiles wide?')}
                        {numberInput('Height', 'boardHeight', 'How many tiles tall?')}
                    </div>
                    <div className="Level1 Column">
                        {numberInput('Mountains', 'mountainPercent', 'Percent of the map covered by mountains', 1)}
                        {numberInput('Tick', 'tickMillis', 'Milliseconds between turns', 1)}
                        {checkInput('Fog', 'fog', 'Hide the areas you don\'t control.', 1)}
                        {checkInput('Capitals', 'capitals', 'Kill a player when you capture their home.', 1)}
                    </div>
                    <div className="Level2 Column">
                        {numberInput('', 'startingPop', 'Population of your initial tile.', 2, (
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