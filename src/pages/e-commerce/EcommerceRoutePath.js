const EcommerceRoutePath = {
    PRODUCTS: "/products",
    PRODUCTS_NEW_ARRIVAL: "/products/new_arrival",
    PRODUCTS_BEST_SELLER: "/products/best_seller",
    PRODUCT_DETAIL: "/product/:seller_slug/:product_slug",
    PRODUCT_SNAPSHOT: "/product-snapshot/:id",

    SELLER: "/seller/:seller_slug",
    SELLER_LIST: "/sellers",
    CUSTOMER: "/customer/:id",

    CART: "/cart",
    CHECKOUT_ORDER: "/checkout-order",
    CHECKOUT_PAY: "/checkout-pay/:invoice_number",
    AWAITING_PAYMENT: "/awaiting-payment/:id",
    INVOICE: "/invoice/:id",

    CHAT: "/chat",

    RESOLUTION_CENTER: "/resolution-center",
    FAQ: "/faq",

    //Auction
    AUCTION: "/auction/my",
}

export default EcommerceRoutePath;