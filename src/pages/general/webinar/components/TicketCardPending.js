import React, { createRef, useState, useEffect, useRef } from "react";
import GeneralRoutePath from "../../GeneralRoutePath";
import EcommerceRoutePath from "../../../e-commerce/EcommerceRoutePath";
import CustomImage, { PublicStorageFolderPath } from "../../../../components/helpers/CustomImage";
import { Link } from "react-router-dom";
import { optionStatusPayment } from "./WebinarOptions"
import { useTranslation } from 'react-i18next';
import { DateTimeFormat } from "../../../../components/helpers/DateTimeFormat";

const TicketCardPending = ({ticket, funcDetailButton, handleCancelOrder}) => {

	const { t } = useTranslation()

    const setOptionLabel = (val, option) => {
		let result = option.find(x=>x.value === val)
		if (result) {
			return result.label
		} else {
			return val
		}
		
    }
  
    return (
        <div className="bg-white p-3 mb-2 col-md-12 position-relative border rounded position-relative">
            <div
                // to={GeneralRoutePath.WEBINAR_DETAIL_EVENT.replace(':id', 1)}
                className='text-decoration-none'>
                <div className='row mb-0'>
                    <h5 className='h5 font-weight-bold p-3 col-xl-6'>{t('my_orders_detail.invoice')}: {ticket.invoice_number}</h5>
                    <h6 className='p-3 col-xl-6' style={{ textAlign: 'right', color: '#F8931D' }}>{setOptionLabel(ticket?.last_status?.status, optionStatusPayment)}</h6>
                    {/* <h6 className='p-3 col-xl-6' style={{ textAlign: 'right', color: '#F8931D' }}>{ticket?.last_status?.status}</h6> */}
                </div>
                <hr />
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="col-md-4 d-flex">
                        <CustomImage
                            folder={PublicStorageFolderPath.cms}
                            filename={ticket?.webinar_payment_transactions[0]?.webinar_transaction.webinar_event?.image}
                            style={{ width: '100%', height: 120 }}
                            className="object-fit-cover"
                        />
                    </div>
                    <div className="col-md-8 d-flex">
                        <div className="p-2">
                            <p className='font-weight-bold ml-1 mt-1' style={{ fontSize: '110%', marginBottom: 0 }}>{ticket?.webinar_payment_transactions[0]?.webinar_transaction.webinar_event?.title}</p>
                            <div className="ml-1 mt-1 row">
                                <div className="d-flex ml-1">
                                    <i className="fas fa-calendar mr-1 mt-1 font-size-80-percent" style={{ color: 'black' }}></i>
                                    <p className='font-size-80-percent'>{DateTimeFormat(ticket?.webinar_payment_transactions[0]?.webinar_transaction.webinar_event?.event_date, 0)}</p>
                                </div>
                                <div className="d-flex ml-4">
                                    <i className="fas fa-clock mr-1 mt-1 font-size-80-percent" style={{ color: 'black' }}></i>
                                    <p className='font-size-80-percent'>{DateTimeFormat(ticket?.webinar_payment_transactions[0]?.webinar_transaction.webinar_event?.event_date, -1)}</p>
                                </div>
                            </div>
                            <div className="ml-1 mt-2 row">
                                {ticket?.webinar_payment_transactions[0]?.webinar_transaction.webinar_event?.speakers?.map((speaker) => {
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
                            </div>
                        </div>
                    </div>
                </div>  
                <hr />
                {
                   (ticket.last_status?.status === 'expired')  ?
                        <>
                            <div className='row mb-1 d-flex align-items-center justify-content-between'>
                                <div className="col-md-12 d-flex mt-3">
                                    <button className="mt-0 border" style={{ backgroundColor: 'white', textAlign: 'center', width: '110%', height: 40, borderRadius: 5 }}>
                                        <p>{t('webinar.view_detail_transaction')}</p>
                                    </button>
                                </div>
                            </div>
                        </> :
                        <>
                            <div className='row mb-1 d-flex align-items-center justify-content-between'>
                                {
                                    (ticket.last_status?.status === 'pending') ?
                                        <>
                                            <Link to={GeneralRoutePath.WEBINAR_CHECKOUT_PAYMENT.replace(':invoice', ticket.invoice_number)} className="col-md-6 d-flex">
                                                <button className="m-0 border" style={{ backgroundColor: '#F8931D', textAlign: 'center', width: '110%', height: 40, borderRadius: 5 }}>
                                                    <p style={{ color: 'white' }}>{t('my_orders.pay')}</p>
                                                </button>
                                            </Link>

                                        </> :
                                        (ticket.last_status?.status === 'waiting_for_upload') ?
                                            <>
                                                <Link to={EcommerceRoutePath.AWAITING_PAYMENT.replace(':id', ticket.mp_payment_destination.id)} className="col-md-6 d-flex">
                                                    <button className="m-0 border" style={{ backgroundColor: '#F8931D', textAlign: 'center', width: '110%', height: 40, borderRadius: 5 }}>
                                                        <p style={{ color: 'white' }}>{t('my_orders.pay')}</p>
                                                    </button>
                                                </Link>
                                            </> :
                                            (ticket.last_status?.status === 'waiting_for_payment') ?
                                            <>
                                                <a href={ticket.midtrans_pdf?.link} className="col-md-6 d-flex">
                                                    <button className="m-0 border" style={{ backgroundColor: '#F8931D', textAlign: 'center', width: '110%', height: 40, borderRadius: 5 }}>
                                                        <p style={{ color: 'white' }}>{t('my_orders.how_to_pay')}</p>
                                                    </button>
                                                </a>
                                            </> :
                                            <></>
                                }

                                <div className="col-md-6 d-flex">
                                    <button onClick={handleCancelOrder} className="m-0 border border-danger" style={{ backgroundColor: 'white', textAlign: 'center', width: '110%', height: 40, borderRadius: 5 }}>
                                        <p style={{ color: '#F81D1D' }}>{t('my_orders.cancel_order')}</p>
                                    </button>
                                </div>
                                <div className="col-md-12 d-flex mt-3">
                                    <button onClick={funcDetailButton} className="mt-0 border" style={{ backgroundColor: 'white', textAlign: 'center', width: '110%', height: 40, borderRadius: 5 }}>
                                        <p>{t('webinar.view_detail_transaction')}</p>
                                    </button>
                                </div>
                            </div>
                        </>
                }

            </div>
        </div>
    )
}

export default TicketCardPending