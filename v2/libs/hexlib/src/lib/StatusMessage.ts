// Consider a keyed collection of these instead so you could, for example,
// get all the "errors"

// What if each message had multiple tags? "Get all errors"
// Also want to pop them -- display to user and indicate that they're handled?
// Or maybe make it stateless—messages have a lifetime? Real errors are forever?

// For now, they just accumulate in a List in the game state
export interface StatusMessage {
    tag: string
    msg: string
    debug: string
}

const BLANK_STATUS_MESSAGE = Object.freeze({
    tag: "",
    msg: "",
    debug: "",
})

const statusMessageToString = (msg: StatusMessage) => `${msg.msg} [${msg.tag}]`
