import { Map } from "immutable"
import { inDev, inTest } from "./Environment"

// TODO replace all enums with union types
export enum AnalyticsCategory {
    testing = "testing",
    local = "local",
}

export enum AnalyticsAction {
    test = "test",
    start = "start", // game start
    end = "end", // game end
    return = "return", // return to menu or lobby
    again = "again", // do the same thing again
}

export enum AnalyticsLabel {
    // end of game
    quit = "quit",
    win = "win",
    lose = "lose",
}

export type Tagger = (
    action: AnalyticsAction,
    category?: AnalyticsCategory,
    label?: AnalyticsLabel,
    value?: string,
    deets?: Record<never, never>
) => void

let taggers: Map<symbol, Tagger> = Map()

export const registerTagger = (key: symbol, tagger: Tagger): void => {
    taggers = taggers.set(key, tagger)
}

export const unregisterTagger = (key: symbol): void => {
    taggers = taggers.remove(key)
}

export const logAnalyticsEvent = (
    action: AnalyticsAction,
    category?: AnalyticsCategory,
    label?: AnalyticsLabel,
    value?: string,
    deets = {}
) => {
    taggers.forEach((tagger) => tagger(action, category, label, value, deets))
}

const combineGoogleTags = (
    category?: AnalyticsCategory,
    label?: AnalyticsLabel,
    value?: string,
    deets?: Record<never, never>
) => ({
    ...deets,
    event_category: category,
    event_label: label,
    value,
})

if (inDev())
    registerTagger(Symbol("console"), (action, category, label, value, deets) =>
        console.log(
            `Analytics event: ${action} — ${JSON.stringify(
                combineGoogleTags(category, label, value, deets)
            )}`
        )
    )

// -------------
// gtag stuff:
// -------------
type GTagEvent = "event"
interface GTagDetails {
    event_category?: string
    event_label?: string
    value?: string

    // other values from gtag docs:
    // https://developers.google.com/analytics/devguides/collection/gtagjs/events
    add_payment_info?: string
    add_to_cart?: string
    add_to_wishlist?: string
    begin_checkout?: string
    checkout_progress?: string
    generate_lead?: string
    login?: string
    purchase?: string
    refund?: string
    remove_from_cart?: string
    search?: string
    select_content?: string
    set_checkout_option?: string
    share?: string
    sign_up?: string
    view_item?: string
    view_item_list?: string
    view_promotion?: string
    view_search_results?: string
}

declare function gtag(
    event: GTagEvent,
    action: string,
    details: GTagDetails
): void

if (!inTest())
    // noinspection TypeScriptUnresolvedFunction
    registerTagger(
        Symbol("google analytics"),
        (action, category, label, value, deets) =>
            gtag(
                "event",
                action,
                combineGoogleTags(category, label, value, deets)
            )
    )
