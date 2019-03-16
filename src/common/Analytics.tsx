type GTagEvent = 'event'
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

declare function gtag(event: GTagEvent, action: string, details: GTagDetails): void

export enum AnalyticsCategory {
    testing = 'testing', local = 'local'
}

export enum AnalyticsAction {
    test = 'test',
    start = 'start',
    end = 'end',
    again = 'again',
}

export enum AnalyticsLabel {
    quit = 'quit', win = 'win', lose = 'lose',
}

export const logAnalyticsEvent = (
    action: AnalyticsAction,
    category?: AnalyticsCategory,
    additionalTags: {} = {},
    label?: AnalyticsLabel,
    value?: string,
) => {
    const deets = {
        ...additionalTags,
        event_category: category,
        event_label: label,
        value,
    }
    if (inDev())
        console.log(`Analytics event: ${action} — ${JSON.stringify(deets)}`)
    // noinspection TypeScriptUnresolvedFunction
    if (!inTest())
        gtag('event', action, deets)
}

export const inDev = () => process.env.NODE_ENV === 'development'
export const inProd = () => process.env.NODE_ENV === 'production'
export const inTest = () => process.env.NODE_ENV === 'test'