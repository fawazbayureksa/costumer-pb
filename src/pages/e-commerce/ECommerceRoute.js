import EcommerceRoutePath from "./EcommerceRoutePath";
import ProductList from "./products/ProductList";
import ProductDetail from "./products/ProductDetail";
import ProductSnapshot from "./products/ProductSnapshot";
import Cart from "./Cart";
import CheckoutOrder from "./CheckoutOrder";
import Chat from "./chat/Chat";
import SellerDetail from "./seller/SellerDetail";
import SellerList from "./seller/SellerList";
import CheckoutPay from "./CheckoutPay";
import AwaitingPayment from "./AwaitingPayment";
import ResolutionCenterResponsive from "./drs/ResolutionCenterResponsive";
import Faq from "./drs/Faq";
import Invoice from "./customer/account-settings/my-orders/Invoice";
import CustomerDetail from "./customer/profil-customer/CustomerDetail"
import Auction from "./auction/Auction";

const ECommerceRoute = [
    { path: EcommerceRoutePath.PRODUCTS, component: ProductList },
    { path: EcommerceRoutePath.PRODUCTS_NEW_ARRIVAL, component: ProductList },
    { path: EcommerceRoutePath.PRODUCTS_BEST_SELLER, component: ProductList },
    { path: EcommerceRoutePath.PRODUCT_DETAIL, component: ProductDetail },
    { path: EcommerceRoutePath.PRODUCT_SNAPSHOT, component: ProductSnapshot },
    { path: EcommerceRoutePath.SELLER_LIST, component: SellerList },
    { path: EcommerceRoutePath.SELLER, component: SellerDetail },
    { path: EcommerceRoutePath.CART, component: Cart },
    { path: EcommerceRoutePath.CHECKOUT_ORDER, component: CheckoutOrder },
    { path: EcommerceRoutePath.CHECKOUT_PAY, component: CheckoutPay },
    { path: EcommerceRoutePath.AWAITING_PAYMENT, component: AwaitingPayment },
    { path: EcommerceRoutePath.CHAT, component: Chat },
    { path: EcommerceRoutePath.RESOLUTION_CENTER, component: ResolutionCenterResponsive },
    { path: EcommerceRoutePath.FAQ, component: Faq },
    { path: EcommerceRoutePath.INVOICE, component: Invoice },
    { path: EcommerceRoutePath.CUSTOMER, component: CustomerDetail },
    { path: EcommerceRoutePath.AUCTION, component: Auction },
];

export default ECommerceRoute;