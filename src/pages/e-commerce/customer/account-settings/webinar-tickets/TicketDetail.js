import React, { useState, useEffect } from "react";
import CustomImage, { PublicStorageFolderPath } from "../../../../../components/helpers/CustomImage";
import moment from 'moment';
import axios from "axios"
import Cookies from "js-cookie"
import Config from "../../../../../components/axios/Config";
import CurrencyFormat from "../../../../../components/helpers/CurrencyFormat";
import { useTranslation } from 'react-i18next';
import { DateTimeFormat } from "../../../../../components/helpers/DateTimeFormat";
import GeneralRoutePath from "../../../../general/GeneralRoutePath";
import { Link } from "react-router-dom";

const TicketDetail = (invoice) => {
    const [dataTicketDetail, setDataTicketDetail] = useState();
    const [webinarEventDetail, setWebinarEventDetail] = useState();
    const [webinarSpeakers, setWebinarSpeakers] = useState([]);

    //Payment Data
    const [paymentDetail, setPaymentDetail] = useState();
    const [paymentStatus, setPaymentStatus] = useState(); //last status
    const [paymentTransaction, setPaymentTransaction] = useState();
    const [paymentAdditionals, setPaymentAdditionals] = useState();

    const { t } = useTranslation()

    useEffect(() => {
        detailTicketModal();
    }, []);

    const detailTicketModal = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}webinar/my-orders/get-detail`;
        let params = {
            transaction_code: invoice.invoice
        }
        axios.get(url, Config({
            Authorization: 'Bearer ' + Cookies.get('token')
        }, params
        )).then(res => {
            // console.log(invoice);
            setDataTicketDetail(res.data.data);
            setWebinarEventDetail(res.data.data.webinar_event);
            setWebinarSpeakers(res.data.data.webinar_event.speakers);

            setPaymentDetail(res.data.data.mp_payment);
            setPaymentTransaction(res.data.data.mp_payment.webinar_payment_transactions[0]);
            setPaymentStatus(res.data.data.mp_payment.last_status);
            setPaymentAdditionals(res.data.data.mp_payment.mp_payment_additionals);
        }).catch(error => {
            console.error('error ticket Detail: ', error);
        }).finally()

    }

    return (
        <div className="bg-white col-md-12">
            <div
                // to={GeneralRoutePath.WEBINAR_DETAIL_EVENT.replace(':id', 1)}
                className='text-decoration-none'>
                <div className='row'>
                    <div className="col-xl-8">
                        <p>{t('webinar.transaction_id')}</p>
                        <p className='font-weight-bold'>{dataTicketDetail?.transaction_code}</p>
                    </div>
                    <Link className="btn bgc-accent-color" style={{ color: 'white', width: '30%', height: 40, borderRadius: 5 }}
                        to={GeneralRoutePath.WEBINAR_PRINT_INVOICE.replace(':invoice', invoice.invoice)}
                    >
                        <p>{t('webinar.print_invoice')}</p>
                    </Link>
                </div>
                <div className="column mt-2">
                    <p>{t('webinar.transaction_status')}</p>
                    <p className='font-weight-bold'>{paymentStatus?.status}</p>
                </div>
                <div className="column mt-2">
                    <p>{t('webinar.transaction_date')}</p>
                    <p className='font-weight-bold'>{DateTimeFormat(dataTicketDetail?.created_at, 1)}</p>
                </div>
                {
                    (dataTicketDetail?.last_status?.mp_transaction_status_master_key === 'payment_waiting_for_payment' || dataTicketDetail?.last_status?.mp_transaction_status_master_key === 'payment_pending') ?
                        <>
                            <div className="column mt-2">
                                <p>{t('webinar.payment_deadline')}</p>
                                <p className='font-weight-bold'>{DateTimeFormat(dataTicketDetail?.last_status?.deadline, 1)}</p>
                            </div>
                        </> :
                        <></>
                }
                <hr />
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="col-md-4 d-flex">
                        <CustomImage
                            folder={PublicStorageFolderPath.cms}
                            filename={webinarEventDetail?.image}
                            style={{ width: '100%', height: 120 }}
                            className="object-fit-cover"
                        />
                    </div>
                    <div className="col-md-8 d-flex">
                        <div className="p-2">
                            <p className='font-weight-bold ml-1 mt-1' style={{ fontSize: '110%', marginBottom: 0 }}>{webinarEventDetail?.title}</p>
                            <div className="ml-1 mt-1 row">
                                <div className="d-flex ml-1">
                                    <i className="fas fa-calendar mr-1 mt-1 font-size-80-percent" style={{ color: 'black' }}></i>
                                    <p className='font-size-80-percent'>{moment(webinarEventDetail?.event_date).format('DD MMMM YYYY')}</p>
                                </div>
                                <div className="d-flex ml-4">
                                    <i className="fas fa-clock mr-1 mt-1 font-size-80-percent" style={{ color: 'black' }}></i>
                                    <p className='font-size-80-percent'>{moment(webinarEventDetail?.event_date).format('HH : MM')}</p>
                                </div>
                            </div>
                            {/* <div className="ml-1 mt-2 row">
                                {webinarSpeakers?.map((speaker) => {
                                    return (
                                        <div>
                                            <div className="d-flex">
                                                <CustomImage
                                                    folder={PublicStorageFolderPath.cms}
                                                    filename={speaker?.speaker.image}
                                                    style={{ width: 25, height: 25, borderRadius: 50 }}
                                                    className="object-fit-cover"
                                                />
                                                <p className='font-size-80-percent font-weight-bold ml-2 mr-3' style={{ width: 'auto' }}>{speaker?.speaker.name}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div> */}
                        </div>
                    </div>
                </div>
                <hr />
                <div className='row'>
                    <div className="col-xl-4">
                        <p>{t('webinar.detail_payment')}</p>
                        <p>{t('cart.total_price')}</p>
                    </div>
                    <div className="col-xl-4">
                        <br />
                        <p className='font-weight-bold'>Rp {CurrencyFormat(dataTicketDetail?.price)}</p>
                    </div>
                    <div className="col-xl-4">
                        <p>{t('my_orders_detail.payment_method')}</p>
                        <p className='font-weight-bold'>{paymentStatus?.payment_type}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TicketDetail