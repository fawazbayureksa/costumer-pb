import React, { PureComponent, useEffect, useState } from 'react';
import axios from "axios";
import Config from "../../../../../components/axios/Config";
import Cookie from "js-cookie";
import IsEmpty from "../../../../../components/helpers/IsEmpty";
import AuthRoutePath from "../../../../auth/AuthRoutePath";
import Paginate from "../../../../../components/helpers/Paginate";
import ManualSwitchLanguage from "../../../../../components/helpers/ManualSwitchLanguage";
import CurrencyFormat from "../../../../../components/helpers/CurrencyFormat";
import CustomerRoutePath from "../../CustomerRoutePath";
import { Link } from "react-router-dom";
import { withTranslation } from "react-i18next";
import MyContext from "../../../../../components/MyContext";
import { StatusText, PaymentStatusText, PaymentType, PaymentButtonConditionStatus, OrderRow } from './Helper';
import Review from '../../../../../components/helpers/Review';
import update from 'immutability-helper';
import TextTruncate from '../../../../../components/helpers/TextTruncate';
import EcommerceRoutePath from '../../../EcommerceRoutePath';
import Countdown from "react-countdown";
import SwalToast from '../../../../../components/helpers/SwalToast';
import CustomImage, { PublicStorageFolderPath } from '../../../../../components/helpers/CustomImage';
import { DateTimeFormat } from '../../../../../components/helpers/DateTimeFormat';
import MetaTrigger from '../../../../../components/MetaTrigger';

// props: statuses, themes, tabValue, onClick, t
const StatusTabs = (props) => {
    const [tabIndexStart, setTabIndexStart] = useState(0);
    const [tabData, setTabData] = useState([...props.statuses.slice(0, window.innerWidth <= 767.98 ? 1 : 4)]);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const responsiveView = () => {
        console.log('re')
        let widthOfWindow = window.innerWidth;
        setWindowWidth(widthOfWindow);
        setTabData(props.statuses.slice(0, widthOfWindow <= 767.98 ? 1 : 4));
        setTabIndexStart(0);
    }

    useEffect(() => {
        setTabData(props.statuses.slice(0, windowWidth <= 767.98 ? 1 : 4));
        window.addEventListener('resize', responsiveView);
        return () => {
            window.removeEventListener('resize', responsiveView);
        };
    }, [props.statuses]);

    const prev = () => {
        setTabIndexStart(tabIndexStart - 1);
        setTabData(props.statuses.slice(tabIndexStart - 1, tabIndexStart + (windowWidth <= 767.98 ? 0 : 3)));
    };
    const next = () => {
        setTabIndexStart(tabIndexStart + 1);
        setTabData(props.statuses.slice(tabIndexStart + 1, tabIndexStart + (windowWidth <= 767.98 ? 2 : 5)));
    };
    const onClick = (data) => {
        props.onClick(data);
    };

    return (
        <div id="my-orders-status-tabs">
            <style>{`
                #my-orders-status-tabs {
                    display: grid;
                    grid-template-columns: ${windowWidth <= 767.98 ? '1fr 4fr 1fr' : '1fr 4fr 4fr 4fr 4fr 1fr'};
                }
                #my-orders-status-tabs .btn-tab {
                    color: #22262A;
                    border-bottom: 2px solid #E5E8EA;
                    border-radius: 0 !important;
                }
                #my-orders-status-tabs .tab-active {
                    color: ${props.themes ? props.themes.accent_color.value : ''};
                    font-weight: bold;
                    border-bottom: 2px solid ${props.themes ? props.themes.accent_color.value : ''};
                    border-radius: 0 !important;
                }
                #my-orders-status-tabs .btn-nav {
                    color: #22262A;
                    padding: 0;
                }
                #my-orders-status-tabs .btn-nav:disabled {
                    color: #707070;
                }
            `}</style>
            <button className="btn-nav border-0 bg-transparent" onClick={prev} disabled={tabIndexStart === 0}>
                <i className="fas fa-angle-left" />
            </button>
            {tabData.map(value => (
                <button className={`btn btn-tab ${props.tabValue === value.value ? 'tab-active' : ''}`} onClick={event => onClick(value)} key={value.value}>{props.t(`my_orders_tab.${value.value}`)}</button>
            ))}
            <button className="btn-nav border-0 bg-transparent" onClick={next} disabled={tabIndexStart + (windowWidth <= 767.98 ? 1 : 4) === props.statuses.length}>
                <i className="fas fa-angle-right" />
            </button>
        </div>
    );
};

class MyOrders extends PureComponent {
    constructor(props) {
        super(props);
        this.statuses = [
            {
                value: 'pending',
            },
            {
                value: 'all',
            },
            {
                value: 'on_process',
            },
            {
                value: 'on_delivery',
            },
            {
                value: 'complete',
            },
            {
                value: 'expired',
            }
        ];
        let params = this.getUrlParams();
        this.state = {
            config: null,
            data: null,
            filter_search: params.search,
            filter_status: params.status,
            filter_start_date: params.start_date,
            filter_end_date: params.end_date,
            filter_length: params.length,
            filter_current_page: params.current_page,
            review_modal_show: false,
            seller_rating: 0,
            product_rating: [],
            errors: {}
        };

        if (IsEmpty(Cookie.get('token'))) {
            this.props.history.push({
                pathname: AuthRoutePath.LOGIN,
                search: `from=${this.props.location.pathname}`
            });
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.location !== prevProps.location) {
            this.getTransactions();
        }
    }

    componentDidMount() {
        this.getTransactions();
        this.getMasterData();
    }

    getTransactions = () => {
        axios.get(`${process.env.REACT_APP_BASE_API_URL}my-orders/get${window.location.search}`, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        })).then(response => {
            if (!IsEmpty(response.data.data)) {
                this.setState({
                    data: response.data.data,
                });
            } else {
                this.setState({
                    data: [],
                });
            }
        }).catch(error => {
            console.log(error);
        }).finally(() => {
            //
        });
    }

    getMasterData = () => {
        axios.get(`${process.env.REACT_APP_BASE_API_URL}my-orders/getMasterData`, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        })).then(response => {
            response.data.data.config = JSON.parse(response.data.data.config) || {};
            this.setState({
                config: response.data.data.config,
            });
        }).catch(error => {
            console.log(error);
        }).finally(() => {
            //
        });
    }

    getUrlParams = () => {
        let params = new URLSearchParams(window.location.search);
        return {
            search: params.get('search') || '',
            status: params.get('status') || 'all',
            start_date: params.get('start_date') || '',
            end_date: params.get('end_date') || '',
            length: params.get('length') || 10,
            current_page: params.get('page') || 1,
        };
    }

    setUrlParams = () => {
        let query = '';
        if (!IsEmpty(this.state.filter_search)) query += `search=${this.state.filter_search}`;
        if (!IsEmpty(this.state.filter_status)) query += `&status=${this.state.filter_status}`;
        if (!IsEmpty(this.state.filter_start_date)) query += `&start_date=${this.state.filter_start_date}`;
        if (!IsEmpty(this.state.filter_end_date)) query += `&end_date=${this.state.filter_end_date}`;
        if (!IsEmpty(this.state.filter_length)) query += `&length=${this.state.filter_length}`;
        if (!IsEmpty(this.state.filter_current_page)) query += `&page=${this.state.filter_current_page}`;
        if (query.charAt(0) === '&') query = query.substr(1);
        this.props.history.push({
            pathname: this.props.history.location.pathname,
            search: query
        });
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

    buyAgain = transaction => {
        let params = {
            order_code: transaction.order_code
        }
        axios.post(`${process.env.REACT_APP_BASE_API_URL}my-orders/buyAgain`, params, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        })).then(response => {
            SwalToast.fire({
                icon: 'success',
                title: 'Successfully add to cart!'
            });
        }).catch(error => {
            SwalToast.fire({
                icon: 'error',
                title: 'Failed add to cart!'
            });
        }).finally(() => {
            //
        });
    }

    render() {
        const { t } = this.props;
        return (
            <MyContext.Consumer>{context => (
                <>
                    <MetaTrigger
                        pageTitle={context.companyName ? `${t('account_setting.my_orders')} - ${context.companyName} ` : ""}
                        pageDesc={t('account_setting')}
                    />
                    {!IsEmpty(this.state.config) &&
                        <>
                            {this.state.config.type === 'type_1' &&
                                <div className="bg-white shadow-graph rounded p-3">
                                    <div id="my-orders">
                                        <style>{`
                                .div-btn-statuses {
                                    display: block;
                                }
                                @media (max-width: 765.98px) {
                                    .div-btn-statuses {
                                        display: flex;
                                    }
                                }
                                .close {
                                    position: absolute;
                                    top: 0;
                                    right: 0;
                                }
                            `}</style>

                                        <StatusTabs themes={context.theme_settings} statuses={this.statuses} onClick={data => this.setState({
                                            filter_status: data.value,
                                            data: [],
                                            filter_current_page: 1
                                        }, () => this.setUrlParams())} tabValue={this.state.filter_status} t={t} />

                                        {this.state.filter_status === "pending" ? <>
                                            <div className="data">
                                                {!IsEmpty(this.state.data) && this.state.data.data && this.state.data.data.map(value => (
                                                    <div className="rounded mt-3">
                                                        <div className="px-3 py-2 bgc-F3F4F5">
                                                            <div className="row">
                                                                <div className="col-6 col-sm-6 col-md-3 col-lg-3 col-xl-3">
                                                                    <p className="m-0 color-858585 ">{DateTimeFormat(value.created_at, 5)}</p>
                                                                </div>
                                                                <div className="col-6 col-sm-6 col-md-3 col-lg-3 col-xl-3 d-flex justify-content-end justify-content-sm-end justify-content-md-center justify-content-lg-center justify-content-xl-center">
                                                                    <p className="m-0 color-333333 ">{value.invoice_number}</p>
                                                                </div>
                                                                <div className="col-6 col-sm-6 col-md-3 col-lg-3 col-xl-3 d-flex justify-content-start justify-content-sm-start justify-content-md-center justify-content-lg-center justify-content-xl-center">

                                                                </div>
                                                                <div className="col-6 col-sm-6 col-md-3 col-lg-3 col-xl-3 d-flex justify-content-end">
                                                                    <PaymentStatusText data={value.last_status.status} t={t} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="px-3 pb-2">
                                                            <div className="row mt-2">
                                                                <div className="col-3 col-sm-3 col-md-1 col-lg-1 col-xl-1">
                                                                    <CustomImage folder={PublicStorageFolderPath.products} filename={value.mp_transaction_details[0].mp_transaction_product.mp_transaction_product_images[0].filename} alt={value.mp_transaction_details[0].mp_transaction_product.mp_transaction_product_images[0].filename} className="object-fit-cover rounded" style={{ width: 70, height: 70 }} />
                                                                </div>
                                                                <div className="col-9 col-sm-9 col-md-3 col-lg-3 col-xl-3">
                                                                    <p className="m-0 color-333333 ">
                                                                        <ManualSwitchLanguage data={value.mp_transaction_details[0].mp_transaction_product.mp_transaction_product_informations} langAttr={"language_code"} valueAttr={"name"} />
                                                                    </p>
                                                                    {value.mp_transaction_details.length >= 2 &&
                                                                        <p className="mt-1 ">
                                                                            <Link to={CustomerRoutePath.ACCOUNT_SETTINGS_MY_PAYMENT_DETAIL.replace(':invoice_number', value.invoice_number)} className="color-FFB200">+{value.mp_transaction_details.length - 1} {t('my_orders.more_products')}</Link>
                                                                        </p>}
                                                                </div>
                                                                <div className="col-12 col-sm-12 col-md-1 col-lg-1 col-xl-1 border-right mt-2 mt-sm-2 mt-md-0 mt-lg-0 mt-xl-0">
                                                                    <p className="m-0 color-333333 ">x{value.mp_transaction_details[0].quantity}</p>
                                                                </div>
                                                                <div className="col-6 col-sm-6 col-md-2 col-lg-2 col-xl-2 border-left border-right d-flex align-items-center justify-content-center mt-2 mt-sm-2 mt-md-0 mt-lg-0 mt-xl-0">
                                                                    <div className="text-center">
                                                                        <p className="m-0 color-333333  font-weight-bold">Rp {CurrencyFormat(value.mp_transaction_details[0].grand_total.toString())}</p>
                                                                        <p className="m-0 color-333333 "><PaymentType data={value.type} t={t} /></p>
                                                                    </div>
                                                                </div>
                                                                <div className="col-6 col-sm-6 col-md-3 col-lg-3 col-xl-3 border-left border-right d-flex align-items-center justify-content-center mt-2 mt-sm-2 mt-md-0 mt-lg-0 mt-xl-0">
                                                                    <div className="text-center">
                                                                        <PaymentStatusText data={value.last_status.status} t={t} />
                                                                        <p className="m-0 ">
                                                                            <Link to={CustomerRoutePath.ACCOUNT_SETTINGS_MY_PAYMENT_DETAIL.replace(':invoice_number', value.invoice_number)} className="color-333333">{t('my_orders.see_detail')}</Link>
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 border-left div-btn-statuses align-items-center justify-content-between justify-content-sm-between justify-content-md-center justify-content-lg-center justify-content-xl-center mt-2 mt-sm-2 mt-md-0 mt-lg-0 mt-xl-0">
                                                                    <PaymentButtonConditionStatus data={value} t={t} refreshData={this.getTransactions} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </> : <>
                                            <div className="row mt-3">
                                                <div className="col-6 col-sm-6 col-md-3 col-lg-3 col-xl-3">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder={"Search by Invoice"}
                                                        value={this.state.filter_search}
                                                        onChange={event => this.setState({
                                                            filter_search: event.target.value
                                                        })}
                                                    />
                                                </div>
                                                <div className="col-6 col-sm-6 col-md-3 col-lg-3 col-xl-3">
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        placeholder={"Start Date"}
                                                        value={this.state.filter_start_date}
                                                        onChange={event => this.setState({
                                                            filter_start_date: event.target.value
                                                        })}
                                                    />
                                                </div>
                                                <div className="col-6 col-sm-6 col-md-3 col-lg-3 col-xl-3 mt-2 mt-sm-2 mt-md-0 mt-lg-0 mt-xl-0">
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        placeholder={"End Date"}
                                                        value={this.state.filter_end_date}
                                                        onChange={event => this.setState({
                                                            filter_end_date: event.target.value
                                                        })}
                                                    />
                                                </div>
                                                <div className="col-6 col-sm-6 col-md-3 col-lg-3 col-xl-3 mt-2 mt-sm-2 mt-md-0 mt-lg-0 mt-xl-0">
                                                    <button className="btn btn-block  bgc-accent-color" onClick={this.setUrlParams}>Search</button>
                                                </div>
                                            </div>

                                            <div className="data">
                                                {!IsEmpty(this.state.data) && this.state.data.data && this.state.data.data.map(value => (
                                                    <OrderRow key={value.id}
                                                        configType={this.state.config.type}
                                                        t={t}
                                                        transaction={value}
                                                        refreshData={this.getTransactions}
                                                        review={this.review}
                                                        buyAgain={this.buyAgain}
                                                        showButton={true}
                                                    />
                                                ))}
                                            </div>
                                        </>}

                                        {(!IsEmpty(this.state.data) && this.state.data.last_page > 0) &&
                                            <div className="d-flex justify-content-end mt-3">
                                                <Paginate
                                                    pageCount={this.state.data ? this.state.data.last_page : 1}
                                                    onPageChange={selected => this.setState({
                                                        filter_current_page: selected
                                                    }, () => this.setUrlParams())}
                                                    initialPage={this.state.filter_current_page}
                                                />
                                            </div>}
                                    </div>
                                </div>}
                            {this.state.config.type === 'type_2' &&
                                <div id="my-orders" className="p-3">
                                    <style>{`
                                .div-btn-statuses {
                                    display: block;
                                }
                                @media (max-width: 765.98px) {
                                    .div-btn-statuses {
                                        display: flex;
                                    }
                                    .chat-seller {
                                        display: none;
                                    }
                                }
                                .close {
                                    position: absolute;
                                    top: 0;
                                    right: 0;
                                }
                            `}</style>

                                    <StatusTabs themes={context.theme_settings} statuses={this.statuses} onClick={data => this.setState({
                                        filter_status: data.value,
                                        data: [],
                                        filter_current_page: 1
                                    }, () => this.setUrlParams())} tabValue={this.state.filter_status} t={t} />

                                    {this.state.filter_status === "pending" ? <>
                                        <div className="data">

                                            {!IsEmpty(this.state.data) && this.state.data.data && this.state.data.data.map(value => (
                                                <div className="rounded mt-3">
                                                    <div className="bg-white shadow-graph rounded mt-3">
                                                        <div className="px-3 pt-2">
                                                            <div className="row">
                                                                <div className="col-4 col-sm-4 col-md-3 col-lg-3 col-xl-3 d-flex align-items-center">
                                                                    <img src={`/images/seller-icon.png`} className="mr-2" style={{ height: 20 }} />
                                                                    <p className="m-0 color-333333 font-weight-bold">{value.mp_transaction_details[0].mp_transaction.mp_seller ? value.mp_transaction_details[0].mp_transaction.mp_seller.name : ""}</p>
                                                                </div>
                                                                <div className="col-4 col-sm-4 col-md-3 col-lg-3 col-xl-3 d-flex align-items-center">
                                                                    <Link className="d-flex align-items-center" to={{
                                                                        pathname: EcommerceRoutePath.CHAT,
                                                                        state: { user_id: value.mp_transaction_details[0].mp_seller_id, user_type: "seller" }
                                                                    }}>
                                                                        <img src={`/images/message.png`} className="mr-2" style={{ height: 16 }} />
                                                                        <p className="m-0 font-size-80-percent accent-color chat-seller">{t("my_orders.chat_seller")}</p>
                                                                    </Link>
                                                                </div>
                                                                <div className="col-4 col-sm-4 col-md-6 col-lg-6 col-xl-6 d-flex justify-content-end">
                                                                    {value.mp_transaction_details[0].mp_transaction.last_status.mp_transaction_status_master_key == "expired" ?
                                                                        <><label className="mr-2 font-size-90-percent">Status:</label>
                                                                            <StatusText className="font-size-90-percent" data={value.mp_transaction_details[0].mp_transaction.last_status.mp_transaction_status_master_key} t={t} /></> :
                                                                        value.last_status.status == "pending" ?
                                                                            <label className="font-size-90-percent">{t("my_orders.pay_before")}: {value.mp_transaction_details[0].mp_transaction.last_status.deadline ? <Countdown date={new Date(value.mp_transaction_details[0].mp_transaction.last_status.deadline)} /> : "-"}</label> :
                                                                            value.last_status.status == "waiting_for_upload" ?
                                                                                <label className="font-size-90-percent">{t("my_orders.upload_payment_proof_before")}: {value.mp_transaction_details[0].mp_transaction.last_status.deadline ? <Countdown date={new Date(value.mp_transaction_details[0].mp_transaction.last_status.deadline)} /> : "-"}</label> :
                                                                                <><label className="mr-2 font-size-90-percent">Status:</label>
                                                                                    <PaymentStatusText className="font-size-90-percent" data={value.last_status.status} t={t} /></>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="px-3 py-0 m-0">
                                                            <hr />
                                                        </div>
                                                        <div className="px-3">
                                                            <div className="row">
                                                                <div className="col-4 col-sm-4 col-md-2 col-lg-2 col-xl-2">
                                                                    <Link to={CustomerRoutePath.ACCOUNT_SETTINGS_MY_PAYMENT_DETAIL.replace(':invoice_number', value.invoice_number)}>
                                                                        <CustomImage folder={PublicStorageFolderPath.products} filename={value.mp_transaction_details[0].mp_transaction_product.mp_transaction_product_images[0].filename} alt={value.mp_transaction_details[0].mp_transaction_product.mp_transaction_product_images[0].filename} className="object-fit-cover rounded" style={{ height: 100 }} />
                                                                    </Link>
                                                                </div>
                                                                <div className="col-5 col-sm-5 col-md-7 col-lg-7 col-xl-7">
                                                                    <Link to={CustomerRoutePath.ACCOUNT_SETTINGS_MY_PAYMENT_DETAIL.replace(':invoice_number', value.invoice_number)}>
                                                                        <div className="font-weight-semi-bold">
                                                                            <TextTruncate lineClamp={1}><ManualSwitchLanguage data={value.mp_transaction_details[0].mp_transaction_product.mp_transaction_product_informations} langAttr={"language_code"} valueAttr={"name"} /></TextTruncate>
                                                                        </div>
                                                                    </Link>
                                                                    {value.mp_transaction_details[0].mp_transaction_product.mp_transaction_product_sku_variants.map((variant) => (
                                                                        <div key={variant.id}>
                                                                            <small className="">{variant.name}: {variant.mp_transaction_product_sku_variant_option.name}</small>
                                                                        </div>)
                                                                    )}
                                                                    <div className="d-flex mt-2">
                                                                        <small>Rp {CurrencyFormat(value.mp_transaction_details[0].mp_transaction_product.mp_transaction_product_sku.price.toString())}</small>
                                                                    </div>
                                                                </div>
                                                                <div className="col-3 col-sm-3 col-md-3 col-lg-3 col-xl-3 text-right">
                                                                    <small>{value.mp_transaction_details[0].quantity} {t('seller.products')}</small>
                                                                    <div className="mt-2">
                                                                        <small className="font-weight-semi-bold">Rp {CurrencyFormat(value.mp_transaction_details[0].grand_total.toString())}</small>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {value.mp_transaction_details.length >= 2 &&
                                                                <div className="row">
                                                                    <small className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                                                        <Link to={CustomerRoutePath.ACCOUNT_SETTINGS_MY_PAYMENT_DETAIL.replace(':invoice_number', value.invoice_number)} className="accent-color">+{value.mp_transaction_details.length - 1} {t('my_orders.more_products')}</Link>
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
                                                                    <small className="font-weight-semi-bold">Rp {CurrencyFormat(value.mp_transaction_details[0].mp_transaction.grand_total.toString())}</small>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="px-3 pb-4">
                                                            <div className="row">
                                                                <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                                                    <PaymentButtonConditionStatus data={value} t={t} refreshData={this.getTransactions} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </> : <>
                                        <div className="row mt-3">
                                            <div className="col-6 col-sm-6 col-md-3 col-lg-3 col-xl-3">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder={"Search by Invoice"}
                                                    value={this.state.filter_search}
                                                    onChange={event => this.setState({
                                                        filter_search: event.target.value
                                                    })}
                                                />
                                            </div>
                                            <div className="col-6 col-sm-6 col-md-3 col-lg-3 col-xl-3">
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    placeholder={"Start Date"}
                                                    value={this.state.filter_start_date}
                                                    onChange={event => this.setState({
                                                        filter_start_date: event.target.value
                                                    })}
                                                />
                                            </div>
                                            <div className="col-6 col-sm-6 col-md-3 col-lg-3 col-xl-3 mt-2 mt-sm-2 mt-md-0 mt-lg-0 mt-xl-0">
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    placeholder={"End Date"}
                                                    value={this.state.filter_end_date}
                                                    onChange={event => this.setState({
                                                        filter_end_date: event.target.value
                                                    })}
                                                />
                                            </div>
                                            <div className="col-6 col-sm-6 col-md-3 col-lg-3 col-xl-3 mt-2 mt-sm-2 mt-md-0 mt-lg-0 mt-xl-0">
                                                <button className="btn btn-block  bgc-accent-color" onClick={this.setUrlParams}>Search</button>
                                            </div>
                                        </div>

                                        <div className="data">
                                            {!IsEmpty(this.state.data) && this.state.data.data && this.state.data.data.map(value => (
                                                <OrderRow key={value.id}
                                                    configType={this.state.config.type}
                                                    t={t}
                                                    transaction={value}
                                                    refreshData={this.getTransactions}
                                                    review={this.review}
                                                    buyAgain={this.buyAgain}
                                                    showButton={true}
                                                />
                                            ))}
                                        </div>
                                    </>}

                                    {(!IsEmpty(this.state.data) && this.state.data.last_page > 0) &&
                                        <div className="d-flex justify-content-end mt-3">
                                            <Paginate
                                                pageCount={this.state.data ? this.state.data.last_page : 1}
                                                onPageChange={selected => this.setState({
                                                    filter_current_page: selected
                                                }, () => this.setUrlParams())}
                                                initialPage={this.state.filter_current_page}
                                            />
                                        </div>}
                                </div>}
                        </>}
                    <Review state={this.state} closeReviewModal={this.closeReviewModal} refresh={this.getTransactions} t={t} />
                </>
            )}</MyContext.Consumer>
        );
    }
}

export default withTranslation()(MyOrders);