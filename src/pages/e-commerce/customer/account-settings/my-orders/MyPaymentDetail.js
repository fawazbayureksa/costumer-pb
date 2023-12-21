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
import { ButtonConditionStatus, PaymentButtonConditionStatus, PaymentCreatedBy, PaymentType } from './Helper';
import CustomImage, { PublicStorageFolderPath } from '../../../../../components/helpers/CustomImage';
import { DateTimeFormat } from '../../../../../components/helpers/DateTimeFormat';

class MyPaymentDetail extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
            total_payment: 0,
        };

        if (IsEmpty(Cookie.get('token'))) {
            this.props.history.push({
                pathname: AuthRoutePath.LOGIN,
                search: `from=${this.props.location.pathname}`
            });
        }
    }

    componentDidMount() {
        this.getPaymentDetail();
    }

    getPaymentDetail = () => {
        axios.get(`${process.env.REACT_APP_BASE_API_URL}my-orders/getPaymentDetail/${this.props.match.params.invoice_number}`, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        })).then(response => {
            let total_payment = response.data.data.total;
            for (const mp_payment_additional of response.data.data.mp_payment_additionals) {
                total_payment += mp_payment_additional.total
            }

            this.setState({
                data: response.data.data,
                total_payment: total_payment
            });
        }).catch(error => {
            console.log(error);
            if (error.response) {
                this.props.history.push(CustomerRoutePath.ACCOUNT_SETTINGS_MY_ORDERS)
            }
        }).finally(() => {
            //
        });
    }

    render() {
        const { t } = this.props;
        return (
            <div className="bg-white shadow-graph rounded p-3">
                <div id="my-orders-detail">
                    <Link to={`${CustomerRoutePath.ACCOUNT_SETTINGS_MY_ORDERS}?status=pending`} className="text-decoration-none accent-color ">&laquo; {t('my_orders_detail.back')}</Link>
                    {!IsEmpty(this.state.data) &&
                        <>
                            <div className="bg-white shadow-graph rounded p-4 mt-3">
                                <div className="row">
                                    <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                                        <p className="m-0 color-333333 ">{t('my_orders_detail.status')}</p>
                                        <p className="m-0 color-333333  font-weight-bold">{t(`payment_status.${this.state.data.last_status.status}`)}</p>
                                        {this.state.data.last_status.notes && <p className="m-0 color-EB2424 ">{this.state.data.last_status.notes}</p>}
                                    </div>
                                    <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 text-right">
                                        <PaymentButtonConditionStatus data={this.state.data} t={t} refreshData={this.getPaymentDetail} />
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <p className="m-0 color-333333 ">{t('my_orders_detail.date_of_purchases')}</p>
                                    <p className="m-0 color-333333  font-weight-bold">{DateTimeFormat(this.state.data.created_at, 5)}</p>
                                </div>
                                <div className="mt-3">
                                    <p className="m-0 color-333333 ">{t('my_orders_detail.invoice')}</p>
                                    {this.state.data.mp_payment_transactions.map((mp_payment_transaction) => (
                                        <div className="row">
                                            <div className="col-9 col-sm-9 col-md-3 col-lg-3 col-xl-3">
                                                <p className="m-0 accent-color  font-weight-bold">{mp_payment_transaction.mp_transaction.order_code}</p>
                                            </div>
                                            <div className="col-3 col-sm-3 col-md-9 col-lg-9 col-xl-9">
                                                <Link target="_blank" to={EcommerceRoutePath.INVOICE.replace(':id', mp_payment_transaction.mp_transaction.order_code)}>
                                                    <p className="m-0 accent-color ">{t("my_orders_detail.view")}</p>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="m-0 accent-color small font-weight-bold">{t('my_orders_detail.product_list')}</p>
                                {this.state.data.mp_payment_transactions.map((mp_payment_transaction) => (
                                    <div className="bg-white shadow-graph rounded mt-3" key={mp_payment_transaction.id}>

                                        <div className="p-3 ">
                                            <div className="d-flex justify-content-between">
                                                <p className="m-0 color-333333 ">{mp_payment_transaction.mp_transaction.mp_seller.name}</p>
                                                <p className="m-0 color-333333 ">{mp_payment_transaction.mp_transaction.order_code}</p>
                                            </div>
                                        </div>

                                        <div className="border-top p-3 ">
                                            {mp_payment_transaction.mp_transaction.mp_transaction_details.map(value => (
                                                <Link to={{ pathname: EcommerceRoutePath.PRODUCT_SNAPSHOT.replace(":id", value.mp_transaction_product.id) }} className="text-decoration-none" key={value.id}>
                                                    <div className="row mt-3">
                                                        <div className="col-3 col-sm-3 col-md-3 col-lg-2 col-xl-2">
                                                            <CustomImage folder={PublicStorageFolderPath.products} filename={value.mp_transaction_product.mp_transaction_product_images[0].filename} alt={value.mp_transaction_product.mp_transaction_product_images[0].filename} className="object-fit-cover rounded" style={{ width: '100%' }} />
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
                                                </Link>
                                            ))}
                                        </div>

                                        {!IsEmpty(mp_payment_transaction.mp_transaction.mp_transaction_voucher_details) && <div className='border-top p-3'>
                                            {mp_payment_transaction.mp_transaction.mp_transaction_voucher_details.map(mp_transaction_voucher_detail => (
                                                <div key={mp_transaction_voucher_detail.id} className='d-flex align-items-center px-3 py-2 mb-2 bgc-accent-color rounded-pill'>
                                                    <div><img alt="bx_bxs-discount" src="/images/bx_bxs-discount.png" style={{ maxWidth: 30 }} /></div>
                                                    <div className="ml-2">{mp_transaction_voucher_detail.mp_transaction_voucher.name}</div>
                                                </div>
                                            ))}
                                        </div>}
                                        <div className="border-top p-3">
                                            <div className="d-flex justify-content-between">
                                                <p className="m-0 color-333333 ">{t('my_orders_detail.total_product_price')}</p>
                                                <p className="m-0 color-333333 ">Rp. {CurrencyFormat(mp_payment_transaction.mp_transaction.price.toString())}</p>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <p className="m-0 color-333333 ">{t('my_orders_detail.total_shipping_fee')}</p>
                                                <p className="m-0 color-333333 ">Rp. {CurrencyFormat(mp_payment_transaction.mp_transaction.shipping_fee.toString())}</p>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <p className="m-0 color-333333 ">{t('my_orders_detail.total_discount')}</p>
                                                <p className="m-0 color-333333 ">- Rp. {CurrencyFormat(mp_payment_transaction.mp_transaction.discount.toString())}</p>
                                            </div>
                                        </div>
                                        <div className="border-top p-3">
                                            <div className="d-flex justify-content-between ">
                                                <p className="m-0 color-333333 ">{t('my_orders_detail.total')}</p>
                                                <p className="m-0 color-333333  font-weight-bold">Rp. {CurrencyFormat(mp_payment_transaction.mp_transaction.grand_total.toString())}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4">
                                <p className="m-0 accent-color small font-weight-bold">{t('my_orders_detail.payment_information')}</p>
                                <div className="bg-white shadow-graph rounded p-4 mt-3">
                                    <div className="d-flex justify-content-between">
                                        <p className="m-0 color-333333 ">{t('my_orders_detail.payment_method')}</p>
                                        <p className="m-0 color-333333 "><PaymentType data={this.state.data.type} t={t} /></p>
                                    </div>
                                    <div className="border-top mt-2 pt-2">
                                        <div className="d-flex justify-content-between">
                                            <p className="m-0 color-333333">{t('my_orders_detail.total')}</p>
                                            <p className="m-0 color-333333">Rp. {CurrencyFormat(this.state.data.total.toString())}</p>
                                        </div>
                                        {this.state.data.mp_payment_additionals?.map((mp_payment_additional) => (<div className="d-flex justify-content-between">
                                            <p className="m-0 color-333333">{t(`my_orders_detail.${mp_payment_additional.key}`)}</p>
                                            <p className="m-0 color-333333">Rp. {CurrencyFormat(mp_payment_additional.total.toString())}</p>
                                        </div>))}
                                    </div>
                                    <div className="d-flex justify-content-between border-top mt-2 pt-2">
                                        <p className="m-0 color-333333">{t('my_orders_detail.total_payment')}</p>
                                        <p className="m-0 color-333333 font-weight-bold">Rp. {CurrencyFormat(this.state.total_payment.toString())}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="m-0 accent-color small font-weight-bold">{t('my_orders_detail.payment_status')}</p>
                                <div className="bg-white shadow-graph rounded p-4 mt-3">
                                    {this.state.data.mp_payment_statuses.map((value, index) => (
                                        <div className="row no-gutters" key={value.id}>
                                            <div className="col-3 d-flex align-items-center">
                                                <p className="m-0 color-333333 "><PaymentCreatedBy status={value.status} /></p>
                                            </div>
                                            <div className={`col-9 d-flex align-items-center p-3 ${index === 0 ? '' : 'border-top'}`}>
                                                <div className="">
                                                    <p className="m-0 color-333333 ">{t(`payment_status.${value.status}`)}</p>
                                                    <p className="m-0 color-333333 ">{DateTimeFormat(value.created_at, 5)}</p>
                                                    {value.notes && <p className="m-0 color-333333 ">Notes : {value.notes}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>}
                </div>
            </div>
        );
    }
}

export default withTranslation()(MyPaymentDetail);