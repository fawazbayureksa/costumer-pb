import React, { createRef, useState, useEffect, useRef } from "react";
import { Link, useParams, useHistory } from 'react-router-dom';
import axios from "axios"
import Cookies from "js-cookie"
import { Accordion, Card, Modal } from "react-bootstrap";
import { useTranslation } from 'react-i18next';
import Template from '../../../components/Template';
import MyContext from "../../../components/MyContext";
import CurrencyFormat from "../../../components/helpers/CurrencyFormat";
import MidtransSnap from "../../../components/MidtransSnap";
import Config from "../../../components/axios/Config";
import SwalToast from "../../../components/helpers/SwalToast";
import GeneralRoutePath from "../GeneralRoutePath";
import CustomerRoutePath from "../../e-commerce/customer/CustomerRoutePath";
import EcommerceRoutePath from "../../e-commerce/EcommerceRoutePath";
import ErrorDiv from "../../../components/helpers/ErrorDiv";
import IsEmpty from "../../../components/helpers/IsEmpty";

const Styles = props => {
    if (props.themes) {
        return (
            <style>{`
                #body {
                    max-width: ${props.themes.site_width.width};
                    margin: 0 auto;
                }
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

const CheckoutPayment = () => {

    const { invoice } = useParams()
    const [paymentMethod, setPaymentMethod] = useState([])
    const [config, setConfig] = useState()
    const [dataPayment, setDataPayment] = useState()
    const [dataWebinarPayment, setDataWebinarPayment] = useState()
    const [dataPaymentTransaction, setDataPaymentTransaction] = useState()
    const [bankAccounts, setBankAccounts] = useState();
    const [platformFee, setPlatformFee] = useState();
    const [grandTotal, setGrandTotal] = useState();
    const [manualModalShow, setManualModalShow] = useState(false);
    const [confirmationModal, setConfirmationModal] = useState(false);

    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState()
    const [selectedManualPayment, setSelectedManualPayment] = useState()
    const [submitting, setSubmitting] = useState(false)
    //Validation
    const [errors, setErrors] = useState({});

    const history = useHistory()
    const { t } = useTranslation()

    const paymentMethodOptions = [
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

    useEffect(() => {
        getMasterData();
    }, [selectedPaymentMethod])

    useEffect(() => {
        
    }, [selectedPaymentMethod])

    const getMasterData = () => {
        let params = {
            invoice_number: invoice
        }
        axios.get(`${process.env.REACT_APP_BASE_API_URL}checkout-pay/getMasterData`, Config({
            Authorization: `Bearer ${Cookies.get('token')}`
        }, params)).then(res => {
            // console.log(res.data.data.data)
            setBankAccounts(res.data.data.bank_accounts)
            setDataPayment(res.data.data.data);
            setDataWebinarPayment(res.data.data.data.webinar_payment_transactions)
            setDataPaymentTransaction(res.data.data.data.webinar_payment_transactions[0].webinar_transaction)
            console.log(bankAccounts);
            // ========================== Config ==========================
            setConfig(res.data.data.config)

            // ========================== Payment method ==========================
            let payment_method = []
            for (const item of JSON.parse(res.data.data.payment_method).value) {
                payment_method[item.key] = item
            }
            setPaymentMethod(payment_method);
            // console.log(paymentMethod)
        }).catch(error => {
            console.log(error);
            if (error.response) {
                console.log(error.response)
                // if (error.response.status === 403) this.props.history.push(CustomerRoutePath.ACCOUNT_SETTINGS_MY_ORDERS)
            }
        }).finally(() => {
            //
        });
    }

    const paymentMethodRender = (item) => {
        // const { t } = useTranslation()
        return (
            <div className="d-flex align-items-center">
                <div>
                    {/* <input type="radio" className="" name="paymentMethod" id={`checkout-pay-radio-${item.key}`} onChange={() => this.setPaymentMethod(item.key)} /> */}
                    <input type="radio" className="" name="paymentMethod" onChange={() => funcSelectPaymentMethod(item.key)} />
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

    const funcSelectPaymentMethod = (select) => {
        setSelectedPaymentMethod(select)
        calculatePlatformFee();
    }

    const calculatePlatformFee = () => {
        if (!selectedPaymentMethod) return;

        let payment_method = paymentMethod[selectedPaymentMethod]
        if (!payment_method) return;

        let platform_fee = 0;
        let platform_fee_percentage = null;
        if (payment_method.platform_fee_type === "value") {
            platform_fee = payment_method.platform_fee
        } else if (payment_method.platform_fee_type === "percentage") {
            platform_fee = Math.ceil(dataPaymentTransaction.total_payment * payment_method.platform_fee / 100)
            platform_fee_percentage = payment_method.platform_fee
        }

        let grand_total= dataPaymentTransaction.total_payment + platform_fee;
        setPlatformFee(platform_fee);
        setGrandTotal(grand_total);
    }

    const checkPaymentMethodExist = (itemKey) => {
        let payment_method = paymentMethod[itemKey]
        if (payment_method && payment_method.selected) return true
        else return false
    }

    const validateCheckout = () => {
        let validate = true
        let errorsTemp = {};
        if(IsEmpty(selectedPaymentMethod)) {
            errorsTemp.selectedPayment = "Selected Payment is Empty";
            validate = false
        }
        // focusError(errorsTemp);
        setErrors(errorsTemp);
        return validate
    }

    const funcModalConfirmation = () => {
        if (!validateCheckout()) return;
        setConfirmationModal(true)
    }


    const checkoutPay = (e) => {
        e.preventDefault();

        // if (!validateCheckout()) return;
        if (selectedPaymentMethod === "manual") {
            setManualModalShow(true);
            console.log(manualModalShow);
        } else {
            let params = {
                invoice_number: invoice,
                enabled_payment: selectedPaymentMethod
            }
            // console.log(params);
            // return;
            axios.post(`${process.env.REACT_APP_BASE_API_URL}webinar/checkout-pay/getMidtransToken`, params, Config({
                Authorization: `Bearer ${Cookies.get('token')}`
            })).then(response => {
                window.snap.pay(response.data.data.token, {
                    onSuccess: (result) => {
                        console.log('success', result)
                        history.replace({
                            pathname: CustomerRoutePath.ACCOUNT_SETTINGS_MY_ORDERS
                            // pathname: GeneralRoutePath.WEBINAR_DASHBOARD
                        });
                    },
                    onPending: (result) => {
                        console.log('pending', result)
    
                        if (result.pdf_url) {
                            saveMidtransPdf(result.pdf_url)
                        }
    
                        history.replace({
                            // pathname: CustomerRoutePath.ACCOUNT_SETTINGS_MY_PAYMENT_DETAIL.replace(':invoice_number', invoice)
                            pathname: GeneralRoutePath.WEBINAR_DASHBOARD
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
                setSubmitting(false)
            });
        }
    }

    const checkoutManual = (e) => {
        e.preventDefault();
        if (!dataPaymentTransaction) return;
        if (!selectedManualPayment) return;

        let params = {
            mp_payment_id: dataWebinarPayment[0].mp_payment_id,
            mp_company_bank_account_id: selectedManualPayment
        }
        // console.log(params);
        // return

        setSubmitting(true);
        axios.post(`${process.env.REACT_APP_BASE_API_URL}checkout-pay/checkoutManual`, params, Config({
            Authorization: `Bearer ${Cookies.get('token')}`
        })).then(response => {
            SwalToast.fire({ icon: "success", title: response.data.message })
            history.push({ pathname: EcommerceRoutePath.AWAITING_PAYMENT.replace(":id", response.data.data) })
            history.replace({
                // pathname: CustomerRoutePath.ACCOUNT_SETTINGS_MY_PAYMENT_DETAIL.replace(':invoice_number', invoice)
                // pathname: GeneralRoutePath.WEBINAR_DASHBOARD
            });
        }).catch(error => {
            console.log(error);
            if (error.response) {
                console.log(error.response);
                SwalToast.fire({ icon: "error", title: error.response.data.message })
            }
        }).finally(() => {
            setSubmitting(false);
        });
    }

    const saveMidtransPdf = (pdf_url) => {
        axios.post(`${process.env.REACT_APP_BASE_API_URL}checkout-pay/saveMidtransPdf`, {
            invoice_number: invoice,
            link: pdf_url
        }, Config({
            Authorization: `Bearer ${Cookies.get('token')}`
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
            <MyContext.Consumer>{context => (
                <>
                    <Styles themes={context.theme_settings} />
                    <div id="checkout" className="my-4">
                        <p className="m-0 font-weight-bold color-292929">{t('checkout_pay.select_payment_method')}</p>
                        <div className="row">
                            <div className="col-12 col-sm-12 col-md-8 col-lg-8 col-xl-8">
                                <Accordion>
                                    {paymentMethodOptions.map((item) => {
                                        if (item.group) {
                                            let visible = false
                                            for (const item2 of item.items) {
                                                if (checkPaymentMethodExist(item2.key)) {
                                                    visible = true;
                                                    break;
                                                }
                                                // visible = true;
                                                // break;
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
                                                                if (paymentMethod && checkPaymentMethodExist(item2.key)) return (
                                                                    <div className="mb-3" key={item2.key}>
                                                                        {paymentMethodRender(item2)}
                                                                    </div>
                                                                )
                                                                else return null
                                                                // return (
                                                                //     <div className="mb-3" key={item2.key}>
                                                                //         {paymentMethodRender(item2)}
                                                                //     </div>
                                                                // )
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
                                            if (checkPaymentMethodExist(item.key)) return (
                                                <div className="shadow-graph rounded mt-3 p-3" key={item.key}>
                                                    {paymentMethodRender(item)}
                                                </div>
                                            )
                                            else return null
                                        }
                                    })}
                                </Accordion>
                                <ErrorDiv error={errors.selectedPayment} />
                            </div>
                            <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4 mt-3 mt-md-0">
                                <div className="bg-white shadow-graph rounded p-3 position-sticky" style={{ top: context.sticky_top_px }}>
                                    <p className="m-0 font-weight-bold color-333333 ">{t('webinar.detail_payment')}</p>
                                    <div className="mt-3">
                                        <div className="d-flex justify-content-between mt-1">
                                            {/* <p className="m-0 color-333333 ">Harga Ticket</p> */}
                                            <p className="m-0 color-333333 ">{t('cart.price')}</p>
                                            <p className="m-0 color-333333 ">Rp {CurrencyFormat(dataPaymentTransaction?.total_payment)}</p>
                                        </div>
                                        <div className="d-flex justify-content-between mt-1">
                                            <p className="m-0 color-333333 ">{t('checkout.platform_fee')}</p>
                                            <p className="m-0 color-333333 ">Rp {CurrencyFormat(platformFee)}</p>
                                        </div>
                                        <div className="d-flex justify-content-between mt-1">
                                            <p className="m-0 color-333333 font-weight-bold">{t('cart.total_purchase')}</p>
                                            <p className="m-0 color-333333 ">Rp {CurrencyFormat(grandTotal)}</p>
                                        </div>
                                        {/* {this.state.platform_fee_percentage ? <p className="m-0 color-333333 ">({this.state.platform_fee_percentage}%)</p> : ""} */}
                                    </div>
                                    <button onClick={funcModalConfirmation} disabled={submitting} className="btn btn-block bgc-accent-color  mt-4">{t('webinar.proceed_to_buy')}</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Modal centered show={manualModalShow} onHide={() => setManualModalShow(false)}>
                        <Modal.Header className="d-flex justify-content-center" closeButton>
                            <Modal.Title className="font-weight-bold small color-5F6C73">{t('webinar.select_manual_bank_transfer')}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {(bankAccounts !== null) && bankAccounts?.map((item) => (
                                <div key={item.id} className={`p-2 d-flex align-items-center manual-destination mb-3 rounded  ${selectedManualPayment === item.id ? "active border-accent-color border-3" : ""}`}
                                    onClick={() => setSelectedManualPayment(item.id)} id={item.id}>
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
                            {selectedManualPayment &&
                                <button className="btn btn-block bgc-accent-color  mt-4" onClick={checkoutManual} disabled={submitting}>{t('webinar.checkout_manual')}</button>
                            }
                        </Modal.Body>
                    </Modal>

                    <Modal centered show={confirmationModal} onHide={() => setConfirmationModal(false)}>
                        <Modal.Header className="d-flex justify-content-center" closeButton>
                            <Modal.Title className="font-weight-bold small color-5F6C73">{t('webinar.modal_payment_title')}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="align-items-center">
                            <p  className='font-size-80-percent align-middle'>{t('webinar.modal_payment_body')}</p>
                            <button onClick={checkoutPay} className="mt-2 col-md-12" style={{ color: 'white', backgroundColor: '#F8931D', textAlign: 'center', width: '110%', height: 40, borderRadius: 5 }}>
                                <p>Lanjutkan Pembayaran</p>
                            </button>
                        </Modal.Body>
                    </Modal>
                </>

            )}
            </MyContext.Consumer>
        </Template>
    )
}

export default CheckoutPayment