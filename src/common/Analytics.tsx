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

export const logEvent = (
    action: string,
    category?: string,
    label?: string,
    value?: string,
) => {
    // noinspection TypeScriptUnresolvedFunction
    gtag('event', action, {
        event_category: category,
        event_label: label,
        value,
    })
}