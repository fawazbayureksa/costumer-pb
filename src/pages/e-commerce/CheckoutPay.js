import { PureComponent } from "react";
import { withTranslation } from "react-i18next";
import Template from "../../components/Template";
import axios from "axios";
import Config from "../../components/axios/Config";
import Cookie from "js-cookie";
import IsEmpty from "../../components/helpers/IsEmpty"
import AuthRoutePath from "../auth/AuthRoutePath";
import ErrorDiv from '../../components/helpers/ErrorDiv';
import MyContext from "../../components/MyContext";
import CurrencyFormat from "../../components/helpers/CurrencyFormat";
import CustomerRoutePath from "./customer/CustomerRoutePath";
import SwalToast from "../../components/helpers/SwalToast";
import { Accordion, Card, Modal } from 'react-bootstrap'
import EcommerceRoutePath from "./EcommerceRoutePath";
import MidtransSnap from '../../components/MidtransSnap';

const Style = props => {
    if (props.themes) {
        return (
            <style>{`
                #checkout {
                    max-width: ${props.themes.site_width.width};
                    min-height: 70vh;
                    margin: 0 auto;
                }
                .manual-destination{
                    border: 1px solid #C5C5C5;
                    cursor: pointer;
                }
                .manual-destination.active{
                    border: 3px solid;
                    cursor: auto;
                }
                
            `}</style>
        );
    } else return null;
};

class CheckoutPay extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            invoice_number: this.props.match.params.invoice_number,

            selected_payment_method: null,
            data: null,
            bank_accounts: [],
            payment_method: [],
            platform_fee: 0,
            platform_fee_percentage: null,
            grand_total_before_platform_fee: 0,
            grand_total: 0,
            config: null,

            manual_modal_show: false,
            selected_manual_destination: null,

            errors: {},
            submitting: false,
            total_quantity: 0
        };

        if (IsEmpty(Cookie.get('token'))) {
            this.props.history.push({
                pathname: AuthRoutePath.LOGIN,
                search: `from=${this.props.location.pathname}`
            });
        }
    }

    componentDidMount() {
        this.getMasterData();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.selected_payment_method !== this.state.selected_payment_method) {
            this.calculatePlatformFee()
        }
    }

    getMasterData = () => {
        let params = {
            invoice_number: this.state.invoice_number
        }
        axios.get(`${process.env.REACT_APP_BASE_API_URL}checkout-pay/getMasterData`, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        }, params)).then(response => {
            if (!response.data.data.data || response.data.data.data.length === 0) {
                this.props.history.push(CustomerRoutePath.ACCOUNT_SETTINGS_MY_ORDERS)
            } else {
                // ========================== Config ==========================
                let config = JSON.parse(response.data.data.config) || {};

                // ========================== Payment method ==========================
                let payment_method = {}
                for (const item of JSON.parse(response.data.data.payment_method).value) {
                    payment_method[item.key] = item
                }

                // ========================== sumQty, grand_total ==========================
                let sumQty = 0
                let grand_total = 0
                for (const datum of response.data.data.data.mp_payment_transactions) {
                    grand_total += datum.mp_transaction.grand_total
                    for (const detail of datum.mp_transaction.mp_transaction_details) {
                        sumQty += detail.quantity
                    }
                }

                this.setState({
                    config: config,
                    payment_method: payment_method,
                    data: response.data.data.data,
                    grand_total_before_platform_fee: grand_total,
                    grand_total: grand_total,
                    bank_accounts: response.data.data.bank_accounts,
                    total_quantity: sumQty
                });
            }
        }).catch(error => {
            console.log(error);
            if (error.response) {
                console.log(error.response)
                if (error.response.status === 403) this.props.history.push(CustomerRoutePath.ACCOUNT_SETTINGS_MY_ORDERS)
            }
        }).finally(() => {
            //
        });
    }
    paymentMethodChange = (key) => {
        this.setState({
            selected_payment_method: key
        })
    }

    paymentMethodOptions = [
        {
            key: "credit_card",
            filename: "CREDITCARD.png",
        }, {
            group: "va",
            items: [{
                key: "bca_va",
                filename: "BCA.png",
            }, {
                key: "echannel",
                filename: "MANDIRI.png",
            }, {
                key: "bni_va",
                filename: "BNI.png",
            }, {
                key: "permata_va",
                filename: "PERMATA.png",
            }, {
                key: "bri_va",
                filename: "BRI.png",
            }, {
                key: "other_va",
                filename: "ATM BERSAMA.png",
            }]
        }, {
            key: "gopay",
            filename: "GOPAY QRIS.png",
        }, {
            group: "instant_debit",
            items: [{
                key: "bca_klikpay",
                filename: "BCA KLIKPAY.png",
            }, {
                key: "cimb_clicks",
                filename: "OCTO.png",
            }, {
                key: "danamon_online",
                filename: "DANAMON.png",
            }]
        }, {
            group: "cstore",
            items: [{
                key: "indomaret",
                filename: "INDOMARET.png",
            }, {
                key: "alfamart",
                filename: "ALFAGROUP.png",
            }]
        }, {
            group: "cardless_credit",
            items: [{
                key: "akulaku",
                filename: "AKULAKU.png",
            }]
        }, {
            key: "manual",
            filename: "MANUAL TRANSFER.png",
        },
    ]

    validateCheckout = () => {
        let validate = true;
        let errors = {};

        if (!this.state.selected_payment_method) {
            validate = false;
            errors.selected_payment_method = this.props.t('checkout_pay.selected_payment_method_empty')
        }

        this.setState({ errors })
        return validate;
    }

    checkoutPay = (e) => {
        e.preventDefault();

        if (!this.validateCheckout()) return;

        if (this.state.selected_payment_method === "manual") {
            this.setState({
                manual_modal_show: true
            })
        } else {
            let params = {
                invoice_number: this.state.invoice_number,
                enabled_payment: this.state.selected_payment_method,
            }
            axios.post(`${process.env.REACT_APP_BASE_API_URL}checkout-pay/getMidtransToken`, params, Config({
                Authorization: `Bearer ${Cookie.get('token')}`
            })).then(response => {
                window.snap.pay(response.data.data.token, {
                    onSuccess: (result) => {
                        console.log('success', result)
                        this.props.history.replace({
                            pathname: CustomerRoutePath.ACCOUNT_SETTINGS_MY_ORDERS
                        });
                    },
                    onPending: (result) => {
                        console.log('pending', result)

                        if (result.pdf_url) {
                            this.saveMidtransPdf(result.pdf_url)
                        }

                        this.props.history.replace({
                            pathname: CustomerRoutePath.ACCOUNT_SETTINGS_MY_PAYMENT_DETAIL.replace(':invoice_number', this.state.invoice_number)
                        });
                    },
                    onError: function (result) {
                        console.log('error: ', result)
                    },
                    onClose: function () {
                        console.log('close')
                    }
                })
            }).catch(error => {
                console.log(error);
                if (error.response) {
                    console.log(error.response);
                    SwalToast.fire({ icon: "error", title: error.response.data.message })
                }
            }).finally(() => {
                this.setState({ submitting: false })
            });
        }
    }

    saveMidtransPdf = (pdf_url) => {
        axios.post(`${process.env.REACT_APP_BASE_API_URL}checkout-pay/saveMidtransPdf`, {
            invoice_number: this.state.invoice_number,
            link: pdf_url
        }, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        })).then(response => {
            console.log('success')
        }).catch(error => {
            console.log(error);
            if (error.response) {
                console.log(error.response);
                SwalToast.fire({ icon: "error", title: error.response.data.message })
            }
        })
    }
    closeManualModal = () => {
        this.setState({
            manual_modal_show: false
        })
    }
    manualDestinationChange = (e) => {
        this.setState({
            selected_manual_destination: parseInt(e.currentTarget.id)
        })
    }
    checkoutManual = (e) => {
        e.preventDefault();
        if (!this.state.data) return;
        if (!this.state.selected_manual_destination) return;

        let params = {
            mp_payment_id: this.state.data.id,
            mp_company_bank_account_id: this.state.selected_manual_destination
        }

        this.setState({ submitting: true })
        axios.post(`${process.env.REACT_APP_BASE_API_URL}checkout-pay/checkoutManual`, params, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        })).then(response => {
            SwalToast.fire({ icon: "success", title: response.data.message })
            this.props.history.push({ pathname: EcommerceRoutePath.AWAITING_PAYMENT.replace(":id", response.data.data) })
        }).catch(error => {
            console.log(error);
            if (error.response) {
                console.log(error.response);
                SwalToast.fire({ icon: "error", title: error.response.data.message })
            }
        }).finally(() => {
            this.setState({ submitting: false })
        });
    }
    paymentMethodRender = (item) => {
        const { t } = this.props
        return (
            <div className="d-flex align-items-center">
                <div>
                    <input type="radio" className="" name="paymentMethod" id={`checkout-pay-radio-${item.key}`} onChange={() => this.paymentMethodChange(item.key)} />
                </div>
                <div className="ml-2">
                    <label className="d-flex align-items-center" htmlFor={`checkout-pay-radio-${item.key}`}>
                        <div>
                            <img src={`/images/payment-methods/${item.filename}`} alt={item.filename} style={{ maxWidth: 75 }} />
                        </div>
                        <div className="ml-2">
                            <div className="font-weight-bold">{t(`checkout_pay.payment_method.${item.key}.title`)}</div>
                            <div>{t(`checkout_pay.payment_method.${item.key}.description`)}</div>
                        </div>
                    </label>
                </div>
            </div>
        )
    }

    checkPaymentMethodExist = (itemKey) => {
        let payment_method = this.state.payment_method[itemKey]
        if (payment_method && payment_method.selected) return true
        else return false
    }

    calculatePlatformFee = () => {
        if (!this.state.selected_payment_method) return;

        let payment_method = this.state.payment_method[this.state.selected_payment_method]
        if (!payment_method) return;

        let platform_fee = 0;
        let platform_fee_percentage = null;
        if (payment_method.platform_fee_type === "value") {
            platform_fee = payment_method.platform_fee
        } else if (payment_method.platform_fee_type === "percentage") {
            platform_fee = Math.ceil(this.state.grand_total_before_platform_fee * payment_method.platform_fee / 100)
            platform_fee_percentage = payment_method.platform_fee
        }

        this.setState({
            platform_fee: platform_fee,
            grand_total: this.state.grand_total_before_platform_fee + platform_fee,
            platform_fee_percentage: platform_fee_percentage,
        })
    }
    render() {
        const { t } = this.props
        return (
            <Template>
                <style>{`
                    @media (max-width: 767.98px) {
                        #checkout {
                            padding: 0 15px;
                        }
                    }
                `}</style>
                <MidtransSnap />
                <MyContext.Consumer>{context => (<>
                    <Style themes={context.theme_settings} />
                    {(this.state.config && (this.state.config.type === "type_1" || this.state.config.type === "type_2")) && <div id="checkout" className="my-4">
                        <p className="m-0 font-weight-bold color-292929">{t('checkout_pay.select_payment_method')}</p>
                        <div className="row">
                            <div className="col-12 col-sm-12 col-md-8 col-lg-8 col-xl-8">
                                <Accordion>
                                    {this.paymentMethodOptions.map((item) => {
                                        if (item.group) {
                                            let visible = false
                                            for (const item2 of item.items) {
                                                if (this.checkPaymentMethodExist(item2.key)) {
                                                    visible = true;
                                                    break;
                                                }
                                            }
                                            if (visible) return (
                                                <Card className="shadow-graph rounded mt-3" key={item.group}>
                                                    <Accordion.Toggle className="p-3 font-weight-bold bg-white border-none cursor-pointer" as={Card.Header} eventKey={item.group}>
                                                        <div className="d-flex align-items-center justify-content-between">
                                                            <div>{t(`checkout_pay.group.${item.group}`)}</div>
                                                            <div>▴</div>
                                                        </div>
                                                    </Accordion.Toggle>
                                                    <Accordion.Collapse eventKey={item.group}>
                                                        <Card.Body>
                                                            {item.items.map((item2) => {
                                                                if (this.checkPaymentMethodExist(item2.key)) return (
                                                                    <div className="mb-3" key={item2.key}>
                                                                        {this.paymentMethodRender(item2)}
                                                                    </div>
                                                                )
                                                                else return null
                                                            })}
                                                        </Card.Body>
                                                    </Accordion.Collapse>
                                                </Card>

                                                // <div className="shadow-graph rounded mt-3" key={item.group}>
                                                //     <div className="p-3 font-weight-bold">{t(`checkout_pay.group.${item.group}`)}</div>
                                                //     <div className="border-top p-3">
                                                //         {item.items.map((item2) => {
                                                //             if (this.checkPaymentMethodExist(item2.key)) return (
                                                //                 <div className="mb-3" key={item2.key}>
                                                //                     {this.paymentMethodRender(item2)}
                                                //                 </div>
                                                //             )
                                                //             else return null
                                                //         })}
                                                //     </div>
                                                // </div>
                                            )
                                            else return null
                                        }
                                        else {
                                            if (this.checkPaymentMethodExist(item.key)) return (
                                                <div className="shadow-graph rounded mt-3 p-3" key={item.key}>
                                                    {this.paymentMethodRender(item)}
                                                </div>
                                            )
                                            else return null
                                        }
                                    })}
                                </Accordion>
                                <ErrorDiv error={this.state.errors.selected_payment_method} />
                            </div>
                            <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4 mt-3 mt-md-0">
                                <div className="bg-white shadow-graph rounded p-3 position-sticky" style={{ top: context.sticky_top_px }}>
                                    {/* <p className="m-0 font-weight-bold color-333333 ">{t('cart.voucher_discount')}</p>
                                        <div className="py-2 text-center"
                                            onClick={() => this.changeModal('modal_voucher', true)}>
                                            <label className="accent-color font-weight-bold ">{t('cart.all_voucher')}?</label>
                                        </div> */}
                                    <p className="m-0 font-weight-bold color-333333 ">{t('cart.checkout_summary')}</p>
                                    {this.state.data && this.state.data.mp_payment_transactions.map((item) => (<div key={item.id}>
                                        <div className="d-flex justify-content-between">
                                            <p className="m-0 color-333333 ">{t('cart.price')}</p>
                                            <p className="m-0 color-333333 ">Rp {CurrencyFormat(item.mp_transaction.price)}</p>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <p className="m-0 color-333333 ">{t('checkout.shipping_fee')}</p>
                                            <p className="m-0 color-333333 ">Rp {CurrencyFormat(item.mp_transaction.shipping_fee)}</p>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <p className="m-0 color-333333 ">{t('cart.total_discount')}</p>
                                            <p className="m-0 color-333333 ">{item.mp_transaction.discount > 0 && "-"} Rp {CurrencyFormat(item.mp_transaction.discount)}</p>
                                        </div>
                                    </div>))}
                                    <div className="d-flex justify-content-between border-top">
                                        <p className="m-0 color-333333 font-weight-bold">{t('cart.total_price')}</p>
                                        <p className="m-0 font-weight-semi-bold color-333333 ">Rp {CurrencyFormat((this.state.grand_total_before_platform_fee).toString())}</p>
                                    </div>
                                    <div>
                                        <div className="d-flex justify-content-between">
                                            <p className="m-0 color-333333 ">{t('checkout.platform_fee')}</p>
                                            <p className="m-0 color-333333 ">Rp {CurrencyFormat(this.state.platform_fee)}</p>
                                        </div>
                                        {this.state.platform_fee_percentage ? <p className="m-0 color-333333 ">({this.state.platform_fee_percentage}%)</p> : ""}
                                    </div>
                                    <div>
                                        <div className="d-flex justify-content-between border-top">
                                            <p className="m-0 color-333333 font-weight-bold">{t('cart.total_purchase')}</p>
                                            <p className="m-0 font-weight-semi-bold color-333333 ">Rp {CurrencyFormat((this.state.grand_total).toString())}</p>
                                        </div>
                                        <small className="">({this.state.total_quantity} {t('seller.products')})</small>
                                    </div>
                                    <button onClick={this.checkoutPay} disabled={this.state.submitting} className="btn btn-block bgc-accent-color  mt-4">{t('checkout.proceed_to_buy')}</button>
                                </div>
                            </div>
                        </div>
                    </div>}

                    <Modal centered show={this.state.manual_modal_show} onHide={this.closeManualModal}>
                        <Modal.Header className="d-flex justify-content-center" closeButton>
                            <Modal.Title className="font-weight-bold small color-5F6C73">Select Manual Bank Transfer</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {this.state.bank_accounts.map((item) => (
                                <div key={item.id} className={`p-2 d-flex align-items-center manual-destination mb-3 rounded  ${this.state.selected_manual_destination === item.id ? "active border-accent-color border-3" : ""}`}
                                    onClick={this.manualDestinationChange} id={item.id}>
                                    <div>
                                        <img src={`/images/banks/${item.mp_bank.logo}`} alt={item.mp_bank.logo} style={{ width: 160 }} onError={(e) => { e.target.src = "/images/placeholder.png" }} />
                                    </div>
                                    <div className="ml-2">
                                        <div className="font-weight-bold">{item.mp_bank.name}</div>
                                        <div>{item.account_name}</div>
                                        <div>{item.account_number}</div>
                                    </div>
                                </div>
                            ))}
                            {this.state.selected_manual_destination &&
                                <button className="btn btn-block bgc-accent-color  mt-4" onClick={this.checkoutManual} disabled={this.state.submitting}>{t('checkout_pay.proceed')}</button>
                            }
                        </Modal.Body>
                    </Modal>
                </>)}</MyContext.Consumer>
            </Template>
        )
    }
}

export default withTranslation()(CheckoutPay);