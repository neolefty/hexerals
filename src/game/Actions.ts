import { MOVE_PLAYER, PLACE_CURSOR } from './Constants';
import { HexCoord } from './Hex';

// derived from https://github.com/Microsoft/TypeScript-React-Starter#typescript-react-starter
// TODO: try https://www.npmjs.com/package/redux-actions
// TODO: figure out immutable approach too, maybe with immutable.js

export interface GenericAction {
    type: string;
}

export interface MovePlayer extends GenericAction {
    type: MOVE_PLAYER;
    delta: HexCoord;
    alsoCursor: boolean; // should the cursor move at the end as well?
}

export interface PlaceCursor extends GenericAction {
    type: PLACE_CURSOR;
    position: HexCoord;
}

export type BoardAction = MovePlayer | PlaceCursor;

export function movePlayerAction(
    delta: HexCoord, alsoCursor: boolean = true
): MovePlayer {
    return {
        type: MOVE_PLAYER,
        delta: delta,
        alsoCursor: alsoCursor,
    };
}

export function placeCursorAction(position: HexCoord): PlaceCursor {
    return {
        type: PLACE_CURSOR,
        position: position,
    };
}