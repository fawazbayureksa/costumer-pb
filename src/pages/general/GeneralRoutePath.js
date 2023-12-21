const GeneralRoutePath = {
    FORUM_MY: "/forum/my",
    FORUM_MY_LIST: "/forum/my/list",
    FORUM_MY_POST: "/forum/my/post",
    FORUM_MY_SAVED: "/forum/my/saved",
    FORUM_MY_LIKED: "/forum/my/liked",
    FORUM_MY_CATEGORY: "/forum/my/category",
    FORUM_MY_SELECT_CATEGORY: "/forum/my/list-category/:id",
    FORUM_DETAIL_THREAD: "/forum/detail-thread/:id",
    FORUM_CREATE: "/forum/create-thread",
    FORUM_EDIT: "/forum/edit-thread/:id",

    //Webinar
    WEBINAR_DASHBOARD: "/webinar/dashboard",
    WEBINAR_LIST_EVENT: "/webinar/list-event",
    WEBINAR_LIST_SPEAKER: "/webinar/list-speaker",
    WEBINAR_DETAIL_EVENT: "/webinar/detail-event/:id",
    WEBINAR_DETAIL_SPEAKER: "/webinar/detail-speaker/:id",
    WEBINAR_CHECKOUT_PAYMENT: "/webinar/checkout-payment/:invoice",
    WEBINAR_SEARCH_RESULT: "/webinar/search-result/:search",
    WEBINAR_PRINT_INVOICE: "/webinar/invoice/:invoice"
}

export default GeneralRoutePath;