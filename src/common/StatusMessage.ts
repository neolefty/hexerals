// Consider a keyed collection of these instead so you could, for example, get all the "errors"
// What if each message had multiple tags? "Get all errors"
// Also want to pop them -- display to user and indicate that they're handled?
// Or maybe make it stateless—messages have a lifetime? Real errors are forever?

// for now, they just accumulate in a List in the game state
export class StatusMessage {
    constructor(
        readonly tag: string,
        readonly msg: string,
        readonly debug: string = '',
    ) {}

    public toString(): string {
        return `${this.msg} [${this.tag}]`;
    }
}
