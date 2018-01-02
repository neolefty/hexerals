import * as constants from '../constants';

// derived from https://github.com/Microsoft/TypeScript-React-Starter#typescript-react-starter
// TODO: try https://www.npmjs.com/package/redux-actions
// TODO: figure out immutable approach too, maybe with immutable.js (
export interface MovePlayer {
    type: constants.MOVE_PLAYER;
    delta: number;
    alsoCursor: boolean;
}

export interface PlaceCursor {
    type: constants.PLACE_CURSOR;
    position: number;
}

export type BoardAction = MovePlayer | PlaceCursor;

export function movePlayerAction(delta: number, alsoCursor: boolean): MovePlayer {
    return {
        type: constants.MOVE_PLAYER,
        delta: delta,
        alsoCursor: alsoCursor,
    };
}

export function placeCursorAction(position: number): PlaceCursor {
    return {
        type: constants.PLACE_CURSOR,
        position: position,
    };
}
