import { useState } from "react"
import { Modal } from "react-bootstrap"
import { Trans, useTranslation } from "react-i18next"
import { CurrencyFormat2 } from "../../components/helpers/CurrencyFormat"
import SwalToast from "../../components/helpers/SwalToast"
import PwpConditions from "./products/product-detail/PwpConditions"

const calculateDiscountByTypeForPwp = (discount_type, price, discount, max_discount) => {
    let discount_amount_per_item = 0
    if (discount_type === "fixed") {
        discount_amount_per_item = discount
    } else if (discount_type === "percentage") {
        discount_amount_per_item = Math.floor(price * discount / 100)
        if (max_discount) {
            discount_amount_per_item = Math.min(discount_amount_per_item, max_discount)
        }
    } else if (discount_type === "none") {
        discount_amount_per_item = 0
    }

    return discount_amount_per_item
}
const calculateDiscountByTypeForVoucher = (discount_type, price, discount, max_discount) => {
    let finalDiscount = 0
    if (discount_type === "fixed") {
        finalDiscount = discount
    } else if (discount_type === "percentage") {
        finalDiscount = Math.floor(price * discount / 100)
        if (max_discount) {
            finalDiscount = Math.min(finalDiscount, max_discount)
        }
    }

    if (finalDiscount > price) {
        finalDiscount = price
    }

    return finalDiscount
}
const prepareVouchers = (data, voucherCustomers) => {
    let voucherStructs = []

    for (const voucherCustomer of voucherCustomers) {
        let forAllProducts = false
        let categoryIDs = new Set()
        let productIDs = new Set()

        for (const condition of voucherCustomer.voucher.conditions) {
            if (condition.type === "min_purchase") {
                continue
            } else if (parseInt(condition.value) === 0) { // for product or category, value 0 means all products are included
                forAllProducts = true
            } else if (condition.type === "category") { // for category, value is not 0
                categoryIDs.add(parseInt(condition.value))
            } else if (condition.type === "product") { // for product, value is not 0
                productIDs.add(parseInt(condition.value))
            }
        }
        console.log("forAllProducts", forAllProducts)
        console.log("categoryIDs", categoryIDs)
        console.log("productIDs", productIDs)

        let uniqueCartID = new Set()
        let uniqueMpSellerID = new Set()
        if (forAllProducts) {
            for (const datum of data) {
                for (const cart of datum.carts) {
                    for (const item of cart.items) {
                        uniqueCartID.add(item.id)
                    }
                }
                uniqueMpSellerID.add(datum.seller.id)
            }
        } else if (categoryIDs.size > 0) {
            for (const datum of data) {
                for (const cart of datum.carts) {
                    for (const item of cart.items) {
                        if (categoryIDs.has(item.mp_product.mp_category_id)) {
                            uniqueCartID.add(item.id)
                            uniqueMpSellerID.add(datum.seller.id)
                        }
                    }
                }
            }
        } else if (productIDs.size > 0) {
            for (const datum of data) {
                for (const cart of datum.carts) {
                    for (const item of cart.items) {
                        if (productIDs.has(item.mp_product_id)) {
                            uniqueCartID.add(item.id)
                            uniqueMpSellerID.add(datum.seller.id)
                        }
                    }
                }
            }
        }
        console.log("uniqueCartID", uniqueCartID)
        console.log("uniqueMpSellerID", uniqueMpSellerID)

        voucherStructs.push({
            voucher_customer_id: voucherCustomer.id,
            cart_ids: uniqueCartID,      //unique set
            seller_ids: uniqueMpSellerID,  //unique set
            voucher: voucherCustomer.voucher,
            total_already_used: 0,

            seller_id_to_voucher_discount: {}, //key-value pair
            seller_id_to_eligible_for_discount: {}, //key-value pair
        })
    }

    return voucherStructs
}

const calculateVoucher = (voucherStructs, sellerID, cart, shippingFee, selected_ids) => {
    let totalVoucherDiscount = 0
    let voucherStructIndex = 0

    for (const voucherStruct of voucherStructs) {
        let eligibleForDiscount = 0

        // ================================== Check if voucher for this mp seller exist ==================================
        if (!voucherStruct.seller_ids.has(sellerID)) {
            continue
        }

        let individualVoucherDiscount = 0
        if (voucherStruct.voucher.discount_for == "product") {

            let currentPriceTotal = 0

            for (const item of cart.items) {
                // ================================== Check if voucher for this cart exist ==================================
                if (!voucherStruct.cart_ids.has(item.id)) {
                    continue
                }
                if (selected_ids.indexOf(item.id) < 0) { // skipped if does not selected
                    continue
                }

                // ================================== Check pwp discount ==================================
                let currentPrice = item.mp_product_sku.price * item.quantity
                currentPriceTotal += currentPrice
            }

            // current price is taken after pwp discount is applied
            if (cart.total_discount) {
                currentPriceTotal = currentPriceTotal - cart.total_discount
            }
            individualVoucherDiscount = calculateDiscountByTypeForVoucher(voucherStruct.voucher.discount_type, currentPriceTotal, voucherStruct.voucher.discount, voucherStruct.voucher.max_discount)
            eligibleForDiscount = currentPriceTotal

        } else if (voucherStruct.voucher.discount_for == "shipping") {
            individualVoucherDiscount = calculateDiscountByTypeForVoucher(voucherStruct.voucher.discount_type, shippingFee, voucherStruct.voucher.discount, voucherStruct.voucher.max_discount)
            eligibleForDiscount = shippingFee
        }

        if (voucherStruct.voucher.max_discount) {
            let remainingUsage = voucherStruct.voucher.max_discount - voucherStruct.total_already_used
            individualVoucherDiscount = Math.min(individualVoucherDiscount, remainingUsage)
        }
        if (voucherStruct.voucher.discount_type === "fixed") {
            let remainingUsage = voucherStruct.voucher.discount - voucherStruct.total_already_used
            individualVoucherDiscount = Math.min(individualVoucherDiscount, remainingUsage)
        }

        voucherStructs[voucherStructIndex].total_already_used += individualVoucherDiscount

        // =================================== Initialize if not exist ===================================
        if (!voucherStructs[voucherStructIndex].seller_id_to_voucher_discount[sellerID]) {
            voucherStructs[voucherStructIndex].seller_id_to_voucher_discount[sellerID] = 0
        }
        if (!voucherStructs[voucherStructIndex].seller_id_to_eligible_for_discount[sellerID]) {
            voucherStructs[voucherStructIndex].seller_id_to_eligible_for_discount[sellerID] = 0
        }
        voucherStructs[voucherStructIndex].seller_id_to_voucher_discount[sellerID] += individualVoucherDiscount
        voucherStructs[voucherStructIndex].seller_id_to_eligible_for_discount[sellerID] += eligibleForDiscount
        totalVoucherDiscount += individualVoucherDiscount

        console.log(JSON.parse(JSON.stringify(voucherStructs[voucherStructIndex])), "grr")
        voucherStructIndex++
    }

    return totalVoucherDiscount
}

/**
 * Prepare map for carts and pwp
 * @param {object} data data from api data
 * @returns {object} original data, mapForCart: map of data grouped by pwp id, mapForPwp: map of conditions grouped by pwp id
 */
export const cartCheckoutGetDataShown = (data) => {
    // ============================== Check PWP ==============================
    let data_shown = []

    for (const datum of data) {
        let mapForCart = {}
        let mapForPwp = {}
        let cartForAuction = []

        for (const cart of datum.carts) {
            // ===================================== Check for pwp detail =====================================
            if (cart.mp_product.mp_product_pwp_detail && cart.mp_product.mp_product_pwp_detail.mp_product_pwp_id) {
                if (!mapForCart[cart.mp_product.mp_product_pwp_detail.mp_product_pwp_id]) {
                    mapForCart[cart.mp_product.mp_product_pwp_detail.mp_product_pwp_id] = []
                }
                mapForCart[cart.mp_product.mp_product_pwp_detail.mp_product_pwp_id].push(cart)
            }
            else if (cart.mp_product.type === "auction") {
                cartForAuction.push(cart)
            }
            else {
                if (!mapForCart[0]) {
                    mapForCart[0] = []
                }
                mapForCart[0].push(cart)
            }
            // ===================================== Check for pwp parent =====================================
            if (cart.mp_product.mp_product_pwp && cart.mp_product.mp_product_pwp.id) {
                mapForPwp[cart.mp_product.mp_product_pwp.id] = cart.mp_product.mp_product_pwp
            }
        }

        data_shown.push({
            ...datum,
            mapForCart: mapForCart,
            mapForPwp: mapForPwp,
            cartForAuction: cartForAuction
        })

    }
    return data_shown
}

/**
 * Process data from cartCheckoutGetDataShown 
 * @param {object} data data from cartCheckoutGetDataShown
 * @param {array} selected_ids array of selected cart ids
 * @returns {object} original data except the carts
 */
export const cartCheckoutGetDataShown2 = (data, selected_ids, voucherCustomers) => {
    // ============================== Prepare vouchers ==============================
    let voucherStructs = prepareVouchers(data, voucherCustomers)
    console.log(JSON.parse(JSON.stringify(voucherStructs)))
    // ============================== Check PWP ==============================
    let data_shown = []
    for (const datum of data) {

        let new_carts = []
        for (const pwpID in datum.mapForCart) {
            // ===================================== Check is satisfy conditions =====================================
            let main_is_satisfied = false;
            let satisfied_non_mains = 0;
            for (const x of datum.mapForCart[pwpID]) {
                let pwp_detail = x.mp_product.mp_product_pwp_detail
                if (pwp_detail) {
                    if (datum.mapForPwp[pwp_detail.mp_product_pwp_id]) {
                        if (selected_ids.indexOf(x.id) >= 0) {
                            if (x.quantity >= pwp_detail.min_qty) {
                                if (pwp_detail.is_main) {
                                    main_is_satisfied = true
                                } else {
                                    satisfied_non_mains++;
                                }
                            }
                        }
                    }
                }
            }
            // ===================================== Create discount if satisfy =====================================
            if (datum.mapForPwp[pwpID] && main_is_satisfied && satisfied_non_mains >= datum.mapForPwp[pwpID].min_child_type) {
                let total_discount = 0
                let child_that_got_discount = 0
                let main_that_got_discount = 0
                for (const x of datum.mapForCart[pwpID]) {
                    let pwp_detail = x.mp_product.mp_product_pwp_detail
                    if (pwp_detail) {
                        if (pwp_detail.is_main && main_that_got_discount >= 1) {
                            continue;
                        }
                        else if (!pwp_detail.is_main && child_that_got_discount >= datum.mapForPwp[pwpID].max_child_type) {
                            continue;
                        }
                        if (selected_ids.indexOf(x.id) >= 0) {
                            if (x.quantity >= pwp_detail.min_qty) {
                                let discount_amount_per_item = calculateDiscountByTypeForPwp(pwp_detail.discount_type, x.mp_product_sku.price, pwp_detail.discount, pwp_detail.max_discount)
                                // calculate discount times max quantity and total cannot be greater than price
                                let discount = Math.min((discount_amount_per_item) * Math.min(x.quantity, pwp_detail.max_qty), x.mp_product_sku.price)
                                console.log(pwp_detail, discount_amount_per_item, discount)
                                total_discount += discount
                                if (pwp_detail.is_main) {
                                    main_that_got_discount++;
                                } else {
                                    child_that_got_discount++;
                                }
                            }
                        }
                    }
                }
                new_carts.push({
                    id: pwpID,
                    type: "pwp",
                    active: true,
                    min_child_type: datum.mapForPwp[pwpID].min_child_type,
                    max_child_type: datum.mapForPwp[pwpID].max_child_type,
                    total_discount: total_discount,
                    items: datum.mapForCart[pwpID],
                })
            } else if (datum.mapForPwp[pwpID]) {
                new_carts.push({
                    id: pwpID,
                    type: "pwp",
                    active: false,
                    min_child_type: datum.mapForPwp[pwpID].min_child_type,
                    max_child_type: datum.mapForPwp[pwpID].max_child_type,
                    total_discount: 0,
                    items: datum.mapForCart[pwpID],
                })
            } else {
                new_carts.push({
                    id: pwpID,
                    type: "general",
                    items: datum.mapForCart[pwpID],
                    total_discount: 0
                })
            }
        }

        // ========================================== Apply vouchers ==========================================
        if (voucherStructs.length > 0) {
            for (let new_cart of new_carts) {
                let shipping_fee = 0
                if (datum.courier_type_selected) {
                    shipping_fee = datum.courier_type_selected.cost.value
                }
                new_cart.total_discount += calculateVoucher(voucherStructs, datum.seller.id, new_cart, shipping_fee, selected_ids)
            }
        }

        data_shown.push({
            ...datum,
            carts: new_carts,
        })
    }
    console.log(data_shown)
    return data_shown
}

export const CartCheckoutOuterDiv = ({ children, data }) => {
    const [pwp_modal_open, set_pwp_modal_open] = useState(false)
    const [pwp_modal_data, set_pwp_modal_data] = useState(null)
    const [t] = useTranslation()

    const isPwpActive = () => {
        return data.type === "pwp"
    }

    const openPwpModal = () => {
        let main_pwp = null;
        for (const item of data.items) {
            let mp_product_pwp = item.mp_product.mp_product_pwp
            if (mp_product_pwp && mp_product_pwp.informations && mp_product_pwp.informations.length > 0) {
                main_pwp = mp_product_pwp;
                break;
            }
        }

        if (main_pwp) {
            set_pwp_modal_open(true)
            set_pwp_modal_data(main_pwp)
        } else {
            SwalToast.fire({ icon: "error", title: "Error occured, no data available" })
        }

    }

    return (
        <div className={`${isPwpActive() ? "border-accent-color" : ""} mt-2 overflow-hidden`} style={{
            borderRadius: isPwpActive() ? 10 : '',
        }}>
            {isPwpActive() && <div className="p-2 bgc-accent-color  d-flex justify-content-between">
                <div>{t('cart.pwp_discount')}</div>
                <div className="link" title={t('product_detail.pwp_learn_more')} onClick={openPwpModal}>
                    <i className="fas fa-question-circle fa-lg text-white" />
                </div>
            </div>}
            <div className="p-2">
                {children}
            </div>
            {isPwpActive() && data.total_discount > 0 && <div className="d-flex">
                <div className="m-2 py-2 px-3 bgc-accent-color  rounded-pill">
                    <i className="fas fa-exclamation-circle mr-2 fa-lg fa-lg"></i>
                    {data.total_discount > 0 && <Trans i18nKey="cart.pwp_you_saved" values={{ amount: "Rp" + CurrencyFormat2(data.total_discount) }} components={[<span className="font-weight-bold" />]} />}
                </div>
            </div>}
            <Modal size="lg" centered show={pwp_modal_open} onHide={() => set_pwp_modal_open(false)}>
                <Modal.Header className="d-flex" closeButton>
                    <Modal.Title className="font-weight-bold color-5F6C73 d-flex">{t('product_detail.pwp_discount')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {pwp_modal_data && <PwpConditions data={pwp_modal_data} />}
                </Modal.Body>
            </Modal>
        </div>
    )
}