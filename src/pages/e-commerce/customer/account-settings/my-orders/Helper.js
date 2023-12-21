import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import IsEmpty from "../../../../../components/helpers/IsEmpty";
import EcommerceRoutePath from "../../../EcommerceRoutePath";
import { Modal } from 'react-bootstrap'
import UploadPaymentProof from "./UploadPaymentProof";
import ConfirmArrived from "./ConfirmArrived";
import ManualSwitchLanguage from "../../../../../components/helpers/ManualSwitchLanguage";
import CustomerRoutePath from "../../CustomerRoutePath";
import CurrencyFormat, { CurrencyFormat2 } from "../../../../../components/helpers/CurrencyFormat";
import RequestRefund from "./RequestRefund";
import TextTruncate from "../../../../../components/helpers/TextTruncate";
import Countdown from "react-countdown";
import CustomImage, { PublicStorageFolderPath } from "../../../../../components/helpers/CustomImage";
import CancelOrder from "./CancelOrder";
import { DateTimeFormat } from "../../../../../components/helpers/DateTimeFormat";

//props: data, t
export const StatusText = (props) => {
    let className = '';
    if (props.data === 'payment_approved') {
        className = 'accent-color';
    } else if (props.data === 'forwarded_to_seller') {
        className = 'accent-color';
    } else if (props.data === 'on_process_by_seller') {
        className = 'color-0F74BD';
    } else if (props.data === 'on_delivery') {
        className = 'accent-color';
    } else if (props.data === 'arrived') {
        className = 'accent-color';
    } else if (props.data === 'complete') {
        className = 'accent-color';
    } else if (props.data === 'cancelled') {
        className = 'color-EB2424';
    } else if (props.data === 'refund_in_progress') {
        className = 'color-0F74BD';
    } else if (props.data === 'refund_rejected') {
        className = 'color-EB2424';
    } else if (props.data === 'refund_approved') {
        className = 'accent-color';
    } else if (props.data === 'expired') {
        className = 'color-EB2424';
    } else {
        className = "accent-color"
    }
    return (
        <p className={`m-0  font-weight-bold ${className} ${props.className}`}>{props.t(`transaction_status.${props.data}`)}</p>
    );
};

//props: data, t
export const PaymentStatusText = (props) => {
    let className = '';
    if (props.data === 'pending') {
        className = 'accent-color';
    } else if (props.data === 'rejected') {
        className = 'color-EB2424';
    } else if (props.data === 'waiting_for_payment') {
        className = 'color-0F74BD';
    } else if (props.data === 'waiting_for_upload') {
        className = 'color-0F74BD';
    } else if (props.data === 'waiting_approval') {
        className = 'color-0F74BD';
    } else if (props.data === 'expired') {
        className = 'color-EB2424';
    }
    return (
        <p className={`m-0  font-weight-bold ${className} ${props.className}`}>{props.t(`payment_status.${props.data}`)}</p>
    );
};

//props: data, t
export const PaymentType = (props) => {
    if (props.data === "midtrans") return props.t(`my_orders_detail.online_payment`)
    else if (props.data === "manual") return props.t(`my_orders_detail.manual_payment`)
    else return '-'
}

//props: data, t, refreshData
export const ButtonConditionStatus = (props) => {
    const current_status = useMemo(() => props.data.last_status.mp_transaction_status_master_key, [props.data])
    const [confirm_modal_open, set_confirm_modal_open] = useState(false)
    const [request_refund_modal_open, set_request_refund_modal_open] = useState(false)

    const openConfirmModal = () => { set_confirm_modal_open(true) }
    const closeConfirmModal = () => { set_confirm_modal_open(false) }

    const openRequestRefundModal = () => { set_request_refund_modal_open(true) }
    const closeRequestRefundModal = () => { set_request_refund_modal_open(false) }

    const ResolutionCenterButton = () => {
        const resolutionCenterButtonClass = "btn btn-sm btn-block color-6A6A6A border-6A6A6A mt-1 mr-1"
        if (props.data.last_dispute) return (<>
            <Link to={{
                pathname: EcommerceRoutePath.RESOLUTION_CENTER,
                ticket_id: props.data.last_dispute.ticket_id
            }} className={resolutionCenterButtonClass}>{props.t('my_orders.resolution_center')}</Link>
        </>)
        else return (<>
            <Link to={{
                pathname: EcommerceRoutePath.FAQ,
                state: props.data,
            }} className={resolutionCenterButtonClass}>{props.t('my_orders.resolution_center')}</Link>
        </>)
    }

    const RequestRefundButton = () => {
        if ((props.data.last_dispute || current_status === 'cancelled') && props.data.mp_payment_transaction.mp_payment.last_status.status !== "cancelled") return (<>
            {console.log(props.data)}
            <button onClick={openRequestRefundModal} className="btn btn-sm btn-block accent-color border-accent-color mr-1 mt-1">{props.t('my_orders.request_refund')}</button>

            <Modal centered show={request_refund_modal_open} onHide={closeRequestRefundModal}>
                <Modal.Header closeButton>
                    <Modal.Title className="font-weight-bold">{props.t('my_orders.request_refund')} {props.data.order_code}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <RequestRefund orderCode={props.data.order_code} closeModal={closeRequestRefundModal} refreshData={props.refreshData} t={props.t} />
                </Modal.Body>
            </Modal>
        </>)
        else return null
    }

    const BuyAgainButton = () => (
        <button className="btn btn-sm btn-block accent-color border-accent-color mr-1 mt-1" onClick={props.buyAgain}>{props.t('my_orders.buy_again')}</button>
    )

    if (current_status === 'forwarded_to_seller') {
        return (<>
            <ResolutionCenterButton />
            <RequestRefundButton />
            <CancelOrderButton orderCode={props.data.order_code} t={props.t} refreshData={props.refreshData} />
        </>);
    } else if (current_status === 'on_process_by_seller') {
        return (<>
            <ResolutionCenterButton />
            <RequestRefundButton />
        </>);
    } else if (current_status === 'on_delivery') {
        return (<>
            <ResolutionCenterButton />
            <RequestRefundButton />
        </>);
    } else if (current_status === 'arrived') {
        return (<>
            <button onClick={openConfirmModal} className="btn btn-sm btn-block accent-color border-accent-color mr-1 mr-sm-1 mr-md-0 mr-lg-0 mr-xl-0 mt-1">{props.t('my_orders.confirm_arrived')}</button>
            <ResolutionCenterButton />
            <RequestRefundButton />

            <Modal centered show={confirm_modal_open} onHide={closeConfirmModal}>
                <Modal.Header closeButton>
                    <Modal.Title className="font-weight-bold">{props.t('my_orders.confirm_arrived')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-4">{props.t("my_orders.sure_you_have_receive_product_from")} {props.data.mp_seller.name}?</div>
                    <ConfirmArrived orderCode={props.data.order_code} closeModal={closeConfirmModal} refreshData={props.refreshData} t={props.t} />
                </Modal.Body>
            </Modal>
        </>);
    } else if (current_status === 'complete') {
        return (<>
            <BuyAgainButton buyAgain={props.buyAgain} />
            {(!props.data.mp_product_rating || props.data.mp_product_rating.length === 0) &&
                <button className="btn btn-sm btn-block color-6A6A6A border-6A6A6A mt-1" onClick={props.review}>{props.t('my_orders.review')}</button>
            }
        </>);
    } else if (current_status === 'cancelled') {
        return (<>
            <BuyAgainButton buyAgain={props.buyAgain} />
            <RequestRefundButton />
        </>);
    } else if (current_status === 'refund_in_progress') {
        return (
            <ResolutionCenterButton />
        );
    } else if (current_status === 'refund_rejected') {
        return (<>
            <BuyAgainButton buyAgain={props.buyAgain} />
            <ResolutionCenterButton />
        </>);
    } else if (current_status === 'refund_approved') {
        return (<>
            <BuyAgainButton buyAgain={props.buyAgain} />
            <ResolutionCenterButton />
        </>);
    } else if (current_status === 'expired') {
        return (<>
            <BuyAgainButton buyAgain={props.buyAgain} />
            <ResolutionCenterButton />
            <RequestRefundButton />
        </>);
    } else {
        return null;
    }
};

//props: data, t, refreshData
export const PaymentButtonConditionStatus = (props) => {
    const current_status = useMemo(() => props.data.last_status.status, [props.data])
    const [upload_modal_open, set_upload_modal_open] = useState(false)

    const openUploadModal = () => {
        set_upload_modal_open(true)
    }
    const closeUploadModal = () => {
        set_upload_modal_open(false)
    }

    if (current_status === 'pending') {
        return (
            <>
                {console.log(props.data)}
                <Link to={EcommerceRoutePath.CHECKOUT_PAY.replace(":invoice_number", props.data.invoice_number)} className="btn btn-sm btn-block accent-color border-accent-color mr-1 mr-sm-1 mr-md-0 mr-lg-0 mr-xl-0">{props.t('my_orders.pay')}</Link>
                <CancelOrderButton orderCode={props.data.mp_payment_transactions[0].mp_transaction.order_code} t={props.t} refreshData={props.refreshData} />
            </>
        );
    } else if (current_status === 'waiting_for_upload') {
        return (<>
            <Link to={EcommerceRoutePath.AWAITING_PAYMENT.replace(":id", props.data.mp_payment_destination.id)} className="btn btn-sm btn-block accent-color border-accent-color mr-1 mr-sm-1 mr-md-0 mr-lg-0 mr-xl-0">{props.t('my_orders.how_to_pay')}</Link>
            <button onClick={openUploadModal} className="btn btn-sm btn-block accent-color border-accent-color mr-1 mr-sm-1 mr-md-0 mr-lg-0 mr-xl-0">{props.t('my_orders.upload_proof')}</button>
            <CancelOrderButton orderCode={props.data.mp_payment_transactions[0].mp_transaction.order_code} t={props.t} refreshData={props.refreshData} />

            <Modal centered show={upload_modal_open} onHide={closeUploadModal}>
                <Modal.Header closeButton>
                    <Modal.Title className="font-weight-bold">{props.t('my_orders.upload_proof')} {props.data.invoice_number}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <UploadPaymentProof mpPaymentID={props.data.id} closeModal={closeUploadModal} refreshData={props.refreshData} t={props.t} />
                </Modal.Body>
            </Modal>
        </>);
    } else if (current_status === "waiting_for_payment") {
        return <>
            {props.data.midtrans_pdf && <a className="btn btn-sm btn-block accent-color border-accent-color mr-1 mr-sm-1 mr-md-0 mr-lg-0 mr-xl-0" href={props.data.midtrans_pdf.link} target="_blank">{props.t('my_orders.how_to_pay')}</a>}
            <CancelOrderButton orderCode={props.data.mp_payment_transactions[0].mp_transaction.order_code} t={props.t} refreshData={props.refreshData} />
        </>
    } else {
        return null;
    }
};


export const PaymentCreatedBy = ({ status }) => {
    if (status === "pending") return <div>Customer</div>
    else if (status === "waiting_for_payment") return <div className="color-24ABE1">Customer</div>
    else if (status === "waiting_for_upload") return <div className="color-24ABE1">Customer</div>
    else if (status === "waiting_approval") return <div className="color-24ABE1">Customer</div>
    else if (status === "rejected") return <div className="color-EC9700">Marketplace</div>
    else if (status === "approved") return <div className="color-EC9700">Marketplace</div>
    else if (status === "expired") return <div className="color-EC9700">Marketplace</div>
    else return null
}

export const TransactionCreatedBy = ({ createdBy }) => {
    let splitted = createdBy.split("#")
    if (splitted[0] === "system") return <div className="color-374650">System</div>
    if (splitted[0] === "midtrans") return <div className="color-374650">System</div>
    else if (splitted[0] === "customer") return <div className="color-24ABE1">Customer</div>
    else if (splitted[0] === "admin") return <div className="color-EC9700">Marketplace</div>
    else if (splitted[0] === "seller") return <div className="color-8CC73F">Seller</div>
    else return splitted[0]
}

export const CalculateEstimateArrived = (delivery_date, estimate_hours) => {
    var dt = new Date(delivery_date)
    dt.setHours(dt.getHours() + estimate_hours)

    return DateTimeFormat(dt, 2)
}

/**
 * 
 * @param {string} configType type of config
 * @param {object} t dictionary object for switching languages
 * @param {object} transaction transaction object
 * @param {function} refreshData 
 * @param {function} review 
 * @param {boolean} showButton show or hide ButtonConditionStatus
 * @returns 
 */
export const OrderRow = ({ configType, t, transaction, refreshData, review, buyAgain, showButton }) => {
    if (configType === "type_1") return (
        <div className="bg-white shadow-graph rounded mt-3">
            <div className="px-3 py-2 bgc-F3F4F5">
                <div className="row">
                    <div className="col-6 col-sm-6 col-md-3 col-lg-3 col-xl-3">
                        <p className="m-0 color-858585 ">{DateTimeFormat(transaction.created_at, 5)}</p>
                    </div>
                    <div className="col-6 col-sm-6 col-md-3 col-lg-3 col-xl-3 d-flex justify-content-end justify-content-sm-end justify-content-md-center justify-content-lg-center justify-content-xl-center">
                        <p className="m-0 color-333333 ">{transaction.order_code}</p>
                    </div>
                    <div className="col-6 col-sm-6 col-md-3 col-lg-3 col-xl-3 d-flex justify-content-start justify-content-sm-start justify-content-md-center justify-content-lg-center justify-content-xl-center">
                        <p className="m-0 color-333333 ">{transaction.mp_seller ? transaction.mp_seller.name : ""}</p>
                    </div>
                    <div className="col-6 col-sm-6 col-md-3 col-lg-3 col-xl-3 d-flex justify-content-end">
                        <StatusText data={transaction.last_status.mp_transaction_status_master_key} t={t} />
                    </div>
                </div>
            </div>
            <div className="px-3 pb-2">
                <div className="row mt-2">
                    <div className="col-3 col-sm-3 col-md-1 col-lg-1 col-xl-1">
                        <CustomImage folder={PublicStorageFolderPath.products} filename={transaction.mp_transaction_details[0].mp_transaction_product.mp_transaction_product_images[0].filename} alt={transaction.mp_transaction_details[0].mp_transaction_product.mp_transaction_product_images[0].filename} className="object-fit-cover rounded" style={{ width: 70, height: 70 }} />
                    </div>
                    <div className="col-9 col-sm-9 col-md-3 col-lg-3 col-xl-3">
                        <p className="m-0 color-333333 ">
                            <ManualSwitchLanguage data={transaction.mp_transaction_details[0].mp_transaction_product.mp_transaction_product_informations} langAttr={"language_code"} valueAttr={"name"} />
                        </p>
                        {transaction.mp_transaction_details.length >= 2 &&
                            <p className="mt-1 ">
                                <Link to={CustomerRoutePath.ACCOUNT_SETTINGS_MY_ORDERS_DETAIL.replace(':order_code', transaction.order_code)} className="color-FFB200">+{transaction.mp_transaction_details.length - 1} {t('my_orders.more_products')}</Link>
                            </p>}
                    </div>
                    <div className="col-12 col-sm-12 col-md-1 col-lg-1 col-xl-1 border-right mt-2 mt-sm-2 mt-md-0 mt-lg-0 mt-xl-0">
                        <p className="m-0 color-333333 ">x{transaction.mp_transaction_details[0].quantity}</p>
                    </div>
                    <div className="col-6 col-sm-6 col-md-2 col-lg-2 col-xl-2 border-left border-right d-flex align-items-center justify-content-center mt-2 mt-sm-2 mt-md-0 mt-lg-0 mt-xl-0">
                        <div className="text-center">
                            <p className="m-0 color-333333  font-weight-bold">Rp {CurrencyFormat2(transaction.mp_transaction_details[0].grand_total.toString())}</p>
                            <p className="m-0 color-333333 ">{transaction.mp_payment_transaction ? <PaymentType data={transaction.mp_payment_transaction.mp_payment.type} t={t} /> : null}</p>
                        </div>
                    </div>
                    <div className="col-6 col-sm-6 col-md-3 col-lg-3 col-xl-3 border-left border-right d-flex align-items-center justify-content-center mt-2 mt-sm-2 mt-md-0 mt-lg-0 mt-xl-0">
                        <div className="text-center">
                            {transaction.last_status.mp_transaction_status_master_key === 'complete' && transaction.mp_product_rating.length > 0 ?
                                <p className="m-0 color-333333  font-weight-bold">{t('my_orders.review_submitted')}</p> :
                                transaction.last_status.mp_transaction_status_master_key === 'complete' ?
                                    <p className="m-0 color-333333  font-weight-bold">{t('my_orders.not_yet_reviewed')}</p> :
                                    <StatusText data={transaction.last_status.mp_transaction_status_master_key} t={t} />}
                            <p className="m-0 ">
                                <Link to={CustomerRoutePath.ACCOUNT_SETTINGS_MY_ORDERS_DETAIL.replace(':order_code', transaction.order_code)} className="color-333333">{t('my_orders.see_detail')}</Link>
                            </p>
                        </div>
                    </div>
                    <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 border-left div-btn-statuses align-items-center justify-content-between justify-content-sm-between justify-content-md-center justify-content-lg-center justify-content-xl-center mt-2 mt-sm-2 mt-md-0 mt-lg-0 mt-xl-0">
                        {showButton && <ButtonConditionStatus data={transaction} refreshData={refreshData} t={t} review={() => review(transaction)} buyAgain={() => buyAgain(transaction)} />}
                    </div>
                </div>
            </div>
        </div>
    )
    else if (configType === "type_2") return (
        <div className="bg-white shadow-graph rounded mt-3 order-row">
            <div className="px-3 pt-2">
                <div className="row">
                    <div className="col-4 col-sm-4 col-md-3 col-lg-3 col-xl-3 d-flex align-items-center">
                        <img src={`/images/seller-icon.png`} className="mr-2" style={{ height: 20 }} />
                        <p className="m-0 color-333333 font-weight-bold">{transaction.mp_seller ? transaction.mp_seller.name : ""}</p>
                    </div>
                    <div className="col-4 col-sm-4 col-md-3 col-lg-3 col-xl-3 d-flex align-items-center">
                        <Link className="d-flex align-items-center" to={{
                            pathname: EcommerceRoutePath.CHAT,
                            state: { user_id: transaction.mp_seller_id, user_type: "seller" }
                        }}>
                            <img src={`/images/message.png`} className="mr-2" style={{ height: 16 }} />
                            <p className="m-0 font-size-80-percent accent-color chat-seller">{t("my_orders.chat_seller")}</p>
                        </Link>
                    </div>
                    <div className="col-4 col-sm-4 col-md-6 col-lg-6 col-xl-6">
                        <div className="d-flex justify-content-end">
                            {transaction.last_status.mp_transaction_status_master_key == "arrived" ?
                                <label className="font-size-90-percent">{t("my_orders.finish_before")}: {transaction.last_status.deadline ? <Countdown date={new Date(transaction.last_status.deadline)} /> : "-"}</label> :
                                <><label className="mr-2 font-size-90-percent">Status:</label>
                                    <StatusText className="font-size-90-percent" data={transaction.last_status.mp_transaction_status_master_key} t={t} /></>}
                        </div>
                        <div className="d-flex justify-content-end">{transaction.last_status.mp_transaction_status_master_key == "on_delivery" &&
                            <small className="accent-color">{t("my_orders.estimate_arrived")} {CalculateEstimateArrived(transaction.last_status.created_at, transaction.courier.shipping_estimate_in_hours)}</small>}</div>
                    </div>
                </div>
            </div>
            <div className="px-3 py-0 m-0">
                <hr />
            </div>
            <div className="px-3">
                <div className="row">
                    <div className="col-4 col-sm-4 col-md-2 col-lg-2 col-xl-2">
                        <Link to={CustomerRoutePath.ACCOUNT_SETTINGS_MY_ORDERS_DETAIL.replace(':order_code', transaction.order_code)}>
                            <CustomImage folder={PublicStorageFolderPath.products} filename={transaction.mp_transaction_details[0].mp_transaction_product.mp_transaction_product_images[0].filename} alt={transaction.mp_transaction_details[0].mp_transaction_product.mp_transaction_product_images[0].filename} className="object-fit-cover rounded" style={{ height: 100 }} />
                        </Link>
                    </div>
                    <div className="col-5 col-sm-5 col-md-7 col-lg-7 col-xl-7">
                        <Link to={CustomerRoutePath.ACCOUNT_SETTINGS_MY_ORDERS_DETAIL.replace(':order_code', transaction.order_code)}>
                            <div className="font-weight-semi-bold">
                                <TextTruncate lineClamp={1}><ManualSwitchLanguage data={transaction.mp_transaction_details[0].mp_transaction_product.mp_transaction_product_informations} langAttr={"language_code"} valueAttr={"name"} /></TextTruncate>
                            </div>
                        </Link>
                        {transaction.mp_transaction_details[0].mp_transaction_product.mp_transaction_product_sku_variants.map((variant) => (
                            <div key={variant.id}>
                                <small className="">{variant.name}: {variant.mp_transaction_product_sku_variant_option.name}</small>
                            </div>)
                        )}
                        <div className="d-flex mt-2">
                            <small>Rp {CurrencyFormat(transaction.mp_transaction_details[0].mp_transaction_product.mp_transaction_product_sku.price.toString())}</small>
                        </div>
                    </div>
                    <div className="col-3 col-sm-3 col-md-3 col-lg-3 col-xl-3 text-right">
                        <small>{transaction.mp_transaction_details[0].quantity} {t('seller.products')}</small>
                        <div className="mt-2">
                            <small className="font-weight-semi-bold">Rp {CurrencyFormat(transaction.mp_transaction_details[0].grand_total.toString())}</small>
                        </div>
                    </div>
                </div>
                {transaction.mp_transaction_details.length >= 2 &&
                    <div className="row">
                        <small className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
                            <Link to={CustomerRoutePath.ACCOUNT_SETTINGS_MY_ORDERS_DETAIL.replace(':order_code', transaction.order_code)} className="accent-color">+{transaction.mp_transaction_details.length - 1} {t('my_orders.more_products')}</Link>
                        </small>
                    </div>}
            </div>
            <div className="px-3 py-0 m-0">
                <hr />
            </div>
            <div className="px-3 py-2">
                <div className="row">
                    <div className="col-6 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                        <label>{t('my_orders_detail.total_payment')}</label>
                    </div>
                    <div className="col-6 col-sm-6 col-md-6 col-lg-6 col-xl-6 text-right">
                        <small className="font-weight-semi-bold">Rp {CurrencyFormat(transaction.grand_total.toString())}</small>
                    </div>
                </div>
            </div>
            <div className="px-3 pb-4">
                <div className="row">
                    <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
                        {showButton && <ButtonConditionStatus data={transaction} refreshData={refreshData} t={t} review={() => review(transaction)} buyAgain={() => buyAgain(transaction)} />}
                    </div>
                </div>
            </div>
        </div>
    )
    else return null
}

export const CancelOrderButton = (props) => {
    const [cancel_modal_open, set_cancel_modal_open] = useState(false)

    const openCancelModal = () => { set_cancel_modal_open(true) }
    const closeCancelModal = () => { set_cancel_modal_open(false) }
    return (
        <>
            <button onClick={openCancelModal} className="btn btn-sm btn-block color-EB2424 border-EB2424 mr-1 mr-sm-1 mr-md-0 mr-lg-0 mr-xl-0">{props.t('my_orders.cancel_order')}</button>

            <Modal centered show={cancel_modal_open} onHide={closeCancelModal}>
                <Modal.Header closeButton>
                    <Modal.Title className="font-weight-bold">{props.t('my_orders.cancel_order')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-4">{props.t("my_orders.sure_you_want_to_cancel_this_order")}?</div>
                    <CancelOrder orderCode={props.orderCode} closeModal={closeCancelModal} refreshData={props.refreshData} t={props.t} />
                </Modal.Body>
            </Modal>
        </>
    )
}