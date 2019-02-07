import {TickerBoardView, TickerBoardViewProps} from './TickerBoardView'
import {Layered} from '../../../common/Layered'

export const LocalGameView: React.FunctionComponent = (
    props: TickerBoardViewProps
) => (
    <Layered>
        {props.boardState.}
        <TickerBoardView {...props} />
    </Layered>
)
