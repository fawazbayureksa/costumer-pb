import AccountSettings from "./account-settings/AccountSettings";
import CustomerRoutePath from "./CustomerRoutePath";
import Membership from "./account-settings/my-account/membership/membership"

const CustomerRoute = [
    { path: CustomerRoutePath.ACCOUNT_SETTINGS, component: AccountSettings },
    { path: CustomerRoutePath.ACCOUNT_SETTINGS_MEMBERSHIP, component: Membership }
]

export default CustomerRoute;