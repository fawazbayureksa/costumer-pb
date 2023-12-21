import React, { PureComponent } from 'react';
import { Link } from "react-router-dom";
import { withTranslation } from "react-i18next";
import CustomerRoutePath from "../../CustomerRoutePath";
import axios from "axios";
import Config from "../../../../../components/axios/Config";
import Cookie from "js-cookie";
import IsEmpty from "../../../../../components/helpers/IsEmpty";
import AuthRoutePath from "../../../../auth/AuthRoutePath";
import ManualSwitchLanguage from "../../../../../components/helpers/ManualSwitchLanguage";
import CurrencyFormat from "../../../../../components/helpers/CurrencyFormat";
import EcommerceRoutePath from "../../../EcommerceRoutePath";
import { ButtonConditionStatus, PaymentType, TransactionCreatedBy } from './Helper';
import update from 'immutability-helper';
import Review from '../../../../../components/helpers/Review';
import CustomImage, { PublicStorageFolderPath } from '../../../../../components/helpers/CustomImage';
import Modal from 'react-bootstrap/Modal';
import GosendStatus from '../../../../../components/helpers/GosendStatus';
import { DateTimeFormat } from '../../../../../components/helpers/DateTimeFormat';

class MyOrdersDetail extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
        };

        if (IsEmpty(Cookie.get('token'))) {
            this.props.history.push({
                pathname: AuthRoutePath.LOGIN,
                search: `from=${this.props.location.pathname}`
            });
        }
    }

    componentDidMount() {
        this.getDetailTransaction();
    }

    getDetailTransaction = () => {
        axios.get(`${process.env.REACT_APP_BASE_API_URL}my-orders/get-detail?order_code=${this.props.match.params.order_code}`, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        })).then(response => {
            let data = response.data.data
            data.mp_transaction_details.forEach(detail => {
                if (detail.mp_transaction_product.type === "bundling") {
                    detail.bundlings.forEach(bundling => {
                        bundling.sku = JSON.parse(bundling.sku)
                    })
                }
            });
            data.courier.mp_transaction_courier_statuses.forEach(detail => {
                if (detail.data) detail.data = JSON.parse(detail.data)
                else detail.data = []
            })
            console.log('trans detail', data);
            this.setState({
                data: data,
            });
        }).catch(error => {
            console.log(error);
        }).finally(() => {
            //
        });
    }

    copyTrackingNumber = () => {
        if (!this.state.data.courier.last_courier_status) return;

        let textArea = document.createElement("textarea");
        textArea.value = this.state.data.courier.last_courier_status.tracking_number
        let currentLocation = document.getElementById("tracking-section");

        currentLocation.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            let successful = document.execCommand('copy');
            let msg = successful ? 'successful' : 'unsuccessful';
            console.log('Copying text command was ' + msg);
            this.setState({
                copied: true,
            }, () => {
                if (this.timeout) clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    this.setState({
                        copied: false,
                    });
                }, 3000);
            });
        } catch (err) {
            console.log('Oops, unable to copy');
        }
        currentLocation.removeChild(textArea);
    }

    closeReviewModal = () => {
        this.setState({
            review_modal_show: false
        })
    }

    review = transaction => {
        let rating = []
        transaction.mp_transaction_details.map((value, index) => {
            rating = update(rating, {
                $push: [{
                    product_id: value.mp_product_id,
                    rating: 0,
                    review: "",
                    review_file: []
                }]
            })
        })
        this.setState({
            review_modal_show: true,
            selected_transaction: transaction,
            seller_rating: 0,
            product_rating: rating
        })
    }

    render() {
        const { t } = this.props;
        return (
            <div className="bg-white shadow-graph rounded p-3">
                <div id="my-orders-detail">
                    <Link to={CustomerRoutePath.ACCOUNT_SETTINGS_MY_ORDERS} className="text-decoration-none accent-color ">&laquo; {t('my_orders_detail.back')}</Link>
                    {!IsEmpty(this.state.data) &&
                        <>
                            <div className="bg-white shadow-graph rounded p-4 mt-3">
                                <div className="row">
                                    <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                                        <p className="m-0 color-333333 ">{t('my_orders_detail.status')}</p>
                                        <p className="m-0 color-333333  font-weight-bold">{t(`transaction_status.${this.state.data.last_status.mp_transaction_status_master_key}`)}</p>
                                        {this.state.data.last_status.notes && <p className="m-0 color-EB2424 ">{this.state.data.last_status.notes}</p>}
                                    </div>
                                    <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 text-right">
                                        <ButtonConditionStatus data={this.state.data} refreshData={this.getDetailTransaction} t={t} review={() => this.review(this.state.data)} />
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <p className="m-0 color-333333 ">{t('my_orders_detail.date_of_purchases')}</p>
                                    <p className="m-0 color-333333  font-weight-bold">{DateTimeFormat(this.state.data.created_at, 5)}</p>
                                </div>
                                <div className="mt-3">
                                    <p className="m-0 color-333333 ">{t('my_orders_detail.invoice')}</p>
                                    <div className="row">
                                        <div className="col-9 col-sm-9 col-md-3 col-lg-3 col-xl-3">
                                            <p className="m-0 accent-color  font-weight-bold">{this.state.data.order_code}</p>
                                        </div>
                                        <div className="col-3 col-sm-3 col-md-9 col-lg-9 col-xl-9">
                                            <Link target="_blank" to={EcommerceRoutePath.INVOICE.replace(':id', this.state.data.order_code)}>
                                                <p className="m-0 accent-color ">{t("my_orders_detail.view")}</p>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="m-0 accent-color small font-weight-bold">{t('my_orders_detail.product_list')}</p>
                                <div className="bg-white shadow-graph rounded p-4">
                                    {this.state.data.mp_transaction_details.map(value => (
                                        <Link to={{ pathname: EcommerceRoutePath.PRODUCT_SNAPSHOT.replace(":id", value.mp_transaction_product.id) }} className="text-decoration-none" key={value.id}>
                                            <div className="row mt-3 p-2 p-sm-2 p-md-2 p-lg-4 p-xl-4">
                                                <div className="col-3 col-sm-3 col-md-3 col-lg-2 col-xl-2">
                                                    <CustomImage folder={PublicStorageFolderPath.products} filename={value.mp_transaction_product.mp_transaction_product_images[0].filename} alt={value.mp_transaction_product.mp_transaction_product_images[0].filename} className="object-fit-cover rounded m-0 p-0" style={{ width: '100%' }} />
                                                </div>
                                                <div className="col-4 col-sm-4 col-md-4 col-lg-5 col-xl-5">
                                                    <p className="m-0 color-333333 ">
                                                        <ManualSwitchLanguage data={value.mp_transaction_product.mp_transaction_product_informations} langAttr={"language_code"} valueAttr={"name"} />
                                                        {value.mp_transaction_product.mp_transaction_product_sku_variants.map((variant) => (
                                                            <div key={variant.id}>
                                                                <span className="small">{variant.name}</span>
                                                                <span>:</span>
                                                                <span>{variant.mp_transaction_product_sku_variant_option.name}</span>
                                                            </div>)
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="col-1 col-sm-1 col-md-1 col-lg-2 col-xl-2 text-right">
                                                    <p className="m-0 color-333333 ">x{value.quantity}</p>
                                                </div>
                                                <div className="col-3 col-sm-3 col-md-3 col-lg-3 col-xl-3 text-right">
                                                    <p className="m-0 color-333333  font-weight-bold">Rp {CurrencyFormat(value.grand_total.toString())}</p>
                                                </div>
                                            </div>
                                            {value.mp_transaction_product.type === "bundling" && value.bundlings.map((bundling) => (
                                                <div className="mt-1" key={bundling.id}>
                                                    <div className="" style={{ display: 'grid', gridTemplateColumns: '1fr 8fr 1fr', gap: 5 }}>
                                                        <div>
                                                            {bundling.sku.images && bundling.sku.images.length > 0 ?
                                                                <CustomImage folder={PublicStorageFolderPath.products} filename={bundling.sku.images[0]} alt={bundling.sku.images[0]} className="object-fit-cover rounded" style={{ width: 50, height: 50 }} /> :
                                                                <CustomImage folder={PublicStorageFolderPath.products} filename={bundling.sku.product.images[0]} alt={bundling.sku.product.images[0]} className="object-fit-cover rounded" style={{ width: 50, height: 50 }} />}
                                                        </div>
                                                        <div>
                                                            <ManualSwitchLanguage data={bundling.sku.product.informations} langAttr={"language_code"} valueAttr={"name"} />
                                                            <div className="small mt-1">{Object.keys(bundling.sku.variant).map((key) => (bundling.sku.variant[key])).join(", ")}</div>
                                                        </div>
                                                        <div className="text-right">x{bundling.qty}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="m-0 accent-color small font-weight-bold">{t('my_orders_detail.shipping_detail')}</p>
                                <div className="bg-white shadow-graph rounded p-4 mt-3">
                                    <div className="row">
                                        <div className="col-4 border-right">
                                            <p className="m-0 color-333333 ">{t('my_orders_detail.seller')}</p>
                                            <p className="m-0 color-333333  font-weight-bold">{this.state.data.mp_seller.name}</p>
                                        </div>
                                        <div className="col-4 border-right border-left pl-2 pl-sm-2 pl-md-2 pl-lg-4 pl-xl-4">
                                            <div className="">
                                                <p className="m-0 color-333333 ">{t('my_orders_detail.shipping_method')}</p>
                                                <p className="m-0 color-333333  font-weight-bold">{this.state.data.courier && this.state.data.courier.mp_courier_key === "internal" ? `${this.state.data.courier.mp_internal_courier.name}` : `${this.state.data.courier.mp_courier_type.mp_courier.name} ${this.state.data.courier.mp_courier_type.name}`}</p>
                                            </div>
                                        </div>
                                        <div className="col-4 border-left pl-2 pl-sm-2 pl-md-2 pl-lg-4 pl-xl-4">
                                            <div className="">
                                                <p className="m-0 color-333333 ">{t('my_orders_detail.tracking_code')}</p>
                                                {this.state.data.courier.last_courier_status ? <div className="d-flex align-items-center" id="tracking-section">
                                                    <p className="m-0 color-333333  font-weight-bold">{this.state.data.courier.last_courier_status.tracking_number}</p>
                                                    <p className="mb-0 mx-3 accent-color  pointer" onClick={this.copyTrackingNumber}>Copy</p>
                                                    <p className={`m-0  fade ${this.state.copied ? 'show' : ''} px-2 py-0 alert alert-info`} >Copied</p>
                                                </div> : "-"}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row mt-4">
                                        <div className="col-4">
                                            <p className="m-0 color-333333 ">{t('my_orders_detail.receiver_address')}</p>
                                        </div>
                                        <div className="col-8">
                                            <div className="">
                                                <p className="m-0 color-333333 ">{this.state.data.mp_transaction_address.receiver_name}, {this.state.data.mp_transaction_address.receiver_phone}</p>
                                                <p className="m-0 color-333333 ">{this.state.data.mp_transaction_address.address}</p>
                                                <p className="m-0 color-333333  capitalize">{this.state.data.mp_transaction_address.subdistrict}, {this.state.data.mp_transaction_address.city}, {this.state.data.mp_transaction_address.postal_code}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="m-0 accent-color small font-weight-bold">{t('my_orders_detail.payment_information')}</p>
                                <div className="bg-white shadow-graph rounded p-4 mt-3">
                                    <div className="d-flex justify-content-between">
                                        <p className="m-0 color-333333 ">{t('my_orders_detail.payment_method')}</p>
                                        <p className="m-0 color-333333 ">{this.state.data.mp_payment_transaction.mp_payment && this.state.data.mp_payment_transaction.mp_payment.last_status ? <PaymentType data={this.state.data.mp_payment_transaction.mp_payment.last_status.type} t={t} /> : null}</p>
                                    </div>
                                    {!IsEmpty(this.state.data.mp_transaction_voucher_details) && <div className='border-top pt-2 mt-2'>
                                        {this.state.data.mp_transaction_voucher_details.map(mp_transaction_voucher_detail => (
                                            <div key={mp_transaction_voucher_detail.id} className='d-flex align-items-center px-3 py-2 mb-2 bgc-accent-color rounded-pill'>
                                                <div><img alt="bx_bxs-discount" src="/images/bx_bxs-discount.png" style={{ maxWidth: 30 }} /></div>
                                                <div className="ml-2">{mp_transaction_voucher_detail.mp_transaction_voucher.name}</div>
                                            </div>
                                        ))}
                                    </div>}
                                    <div className="d-flex justify-content-between border-top pt-2 mt-2">
                                        <p className="m-0 color-333333 ">{t('my_orders_detail.total_product_price')}</p>
                                        <p className="m-0 color-333333 ">Rp. {CurrencyFormat(this.state.data.price.toString())}</p>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <p className="m-0 color-333333 ">{t('my_orders_detail.total_shipping_fee')}</p>
                                        <p className="m-0 color-333333 ">Rp. {CurrencyFormat(this.state.data.shipping_fee.toString())}</p>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <p className="m-0 color-333333 ">{t('my_orders_detail.total_discount')}</p>
                                        <p className="m-0 color-333333 ">- Rp. {CurrencyFormat(this.state.data.discount.toString())}</p>
                                    </div>
                                    <div className="d-flex justify-content-between border-top pt-2 mt-2">
                                        <p className="m-0 color-333333 ">{t('my_orders_detail.total_payment')}</p>
                                        <p className="m-0 color-333333  font-weight-bold">Rp. {CurrencyFormat(this.state.data.grand_total.toString())}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="m-0 accent-color small font-weight-bold">{t('my_orders_detail.order_status')}</p>
                                <div className="bg-white shadow-graph rounded p-4 mt-3">
                                    {this.state.data.mp_transaction_statuses.map((value, index) => (
                                        <div className="row no-gutters" key={value.id}>
                                            {console.log("detail..")}
                                            {console.log(value)}
                                            <div className="col-3 d-flex align-items-center">
                                                <p className="m-0 color-333333 "><TransactionCreatedBy createdBy={value.created_by} /></p>
                                            </div>
                                            <div className={`col-9 d-flex align-items-center p-3 ${index === 0 ? '' : 'border-top'}`}>
                                                <div className="">
                                                    <p className="m-0 color-333333 ">{t(`transaction_status.${value.mp_transaction_status_master_key}`)}</p>
                                                    <p className="m-0 color-333333 ">{DateTimeFormat(value.created_at, 5)}</p>
                                                    {value.mp_transaction_status_master_key == "on_delivery" && (this.state.data.courier.mp_courier_key == "gosend" || this.state.data.courier.mp_courier_key == "internal") && <small className="accent-color" onClick={() => this.setState({ modal_delivery_details: true })}>{t('my_orders_detail.see_delivery_details')}</small>}
                                                    {value.notes && <p className="m-0 color-333333 ">Notes : {value.notes}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>}
                    <Review state={this.state} closeReviewModal={this.closeReviewModal} refresh={this.getDetailTransaction} t={t} />
                    <Modal size="lg" centered show={this.state.modal_delivery_details} onHide={() => this.setState({ modal_delivery_details: false })}>
                        <Modal.Header className="d-flex">
                            <Modal.Title className="font-weight-bold small color-5F6C73 d-flex">{t('my_orders_detail.see_delivery_details')}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {this.state.data && this.state.data.courier.mp_transaction_courier_statuses.map((data, index) =>
                                data.status !== "pending" && <div className="d-flex mb-4">
                                    <div className="col-4">
                                        <div>{DateTimeFormat(data.tracking_time, 5)}</div>
                                    </div>
                                    <div className="col-8">
                                        <div className="capitalize">{this.state.data.courier.mp_courier_key === "gosend" ? GosendStatus(data.status) : data.status.replace(/_/g, ' ')}</div>
                                        {data.data.driver_name &&
                                            <>
                                                <div>Nama: {data.data.driver_name}</div>
                                                <div>Phone: {data.data.driver_phone}</div>
                                                <div>Tracking URL: {data.data.live_tracking_url}</div>
                                            </>
                                        }
                                        {data.data.receiver_name && <div>Receiver Name: {data.data.receiver_name}</div>}
                                        {data.data.cancellation_reason && <div>Cancellation Reason: {data.data.cancellation_reason}</div>}
                                        {data.data.pod && <div>
                                            <div>Proof of Delivery: </div>
                                            <CustomImage folder={PublicStorageFolderPath.seller} filename={data.data.pod} alt={data.data.pod} style={{ maxWidth: 200, maxHeight: 200 }} />
                                        </div>}
                                    </div>
                                </div>
                            )}
                        </Modal.Body>
                    </Modal>
                </div>
            </div>
        );
    }
}

export default withTranslation()(MyOrdersDetail);