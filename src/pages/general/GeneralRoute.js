import DetailThread from "./forum/DetailThread";
import Forum from "./forum/Forum";
import GeneralRoutePath from "./GeneralRoutePath";
import CreateForum from "./forum/CreateForum"

//webinar
import Dashboard from "./webinar/Dashboard";
import EventDetail from "./webinar/details/EventDetail";
import EventList from "./webinar/EventList";
import SpeakerList from "./webinar/SpeakerList";
import SpeakerDetail from "./webinar/details/SpeakerDetail";
import CheckoutPayment from "./webinar/CheckoutPayment";
import WebinarSearchResult from "./webinar/WebinarSearchResult";
import WebinarInvoice from "../e-commerce/customer/account-settings/webinar-tickets/WebinarInvoice";

const forum = [
    { path: GeneralRoutePath.FORUM_MY, component: Forum },
    { path: GeneralRoutePath.FORUM_DETAIL_THREAD, component: DetailThread },
    { path: GeneralRoutePath.FORUM_CREATE, component: CreateForum },
    { path: GeneralRoutePath.FORUM_EDIT, component: CreateForum }
]
const webinar = [
    { path: GeneralRoutePath.WEBINAR_DASHBOARD, component: Dashboard },
    { path: GeneralRoutePath.WEBINAR_LIST_EVENT, component: EventList },
    { path: GeneralRoutePath.WEBINAR_LIST_SPEAKER, component: SpeakerList },
    { path: GeneralRoutePath.WEBINAR_DETAIL_EVENT, component: EventDetail },
    { path: GeneralRoutePath.WEBINAR_DETAIL_SPEAKER, component: SpeakerDetail },
    { path: GeneralRoutePath.WEBINAR_CHECKOUT_PAYMENT, component: CheckoutPayment },
    { path: GeneralRoutePath.WEBINAR_SEARCH_RESULT, component: WebinarSearchResult },
    { path: GeneralRoutePath.WEBINAR_PRINT_INVOICE, component: WebinarInvoice },
]

export const Route = () => {
    let array = []

    if (JSON.parse(process.env.REACT_APP_FEATURE_WEBINAR)) {
        array = array.concat(webinar)
    }
    if (JSON.parse(process.env.REACT_APP_FEATURE_FORUM)) {
        array = array.concat(forum)
    }

    return array
}

export const GeneralRoute = Route()



