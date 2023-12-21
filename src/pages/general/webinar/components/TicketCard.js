import React, { createRef, useState, useEffect, useRef } from "react";
import GeneralRoutePath from "../../GeneralRoutePath";
import CustomImage, { PublicStorageFolderPath } from "../../../../components/helpers/CustomImage";
import moment, { now } from 'moment';
import { optionStatusPayment } from "./WebinarOptions"
import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";
import { DateTimeFormat } from "../../../../components/helpers/DateTimeFormat";

const TicketCard = ({ticket, funcDetailButton, funcReviewButton, funcETicketButton}) => {
    // console.log(ticket);
    let webinarEvent = ticket?.webinar_event;
    let speakers = webinarEvent?.speakers;

    const { t } = useTranslation()
    const currentDate = new Date(); 
    
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
                    <h5 className='h5 font-weight-bold p-3 col-xl-6'>{t('webinar.transaction_id')}: {ticket.transaction_code}</h5>
                    {/* <h6 className='p-3 col-xl-6' style={{ textAlign: 'right' }}>{t('my_orders_detail.status')}: {setOptionLabel(ticket?.last_status?.mp_transaction_status_master_key, optionStatusPayment)}</h6> */}
                    {
                        ((moment(webinarEvent?.event_date).isAfter(currentDate)) && (ticket?.last_status?.mp_transaction_status_master_key === 'complete')) ?
                            <>
                                <h6 className='p-3 col-xl-6' style={{ textAlign: 'right', color: '#6FC32E' }}>Active</h6>
                            </> :
                            ((ticket?.last_status?.mp_transaction_status_master_key === 'cancelled') || (ticket?.last_status?.mp_transaction_status_master_key === 'expired')) ?
                            <>
                                <h6 className='p-3 col-xl-6' style={{ textAlign: 'right', color: 'red' }}>{setOptionLabel(ticket?.last_status?.mp_transaction_status_master_key, optionStatusPayment)}</h6>
                            </> :
                            <>
                            <h6 className='p-3 col-xl-6' style={{ textAlign: 'right', color: '#6FC32E' }}>{setOptionLabel(ticket?.last_status?.mp_transaction_status_master_key, optionStatusPayment)}</h6>
                        </>
                    }
                </div>
                <hr />
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="col-md-4 d-flex">
                        <CustomImage
                            folder={PublicStorageFolderPath.cms}
                            filename={webinarEvent?.image}
                            style={{ width: '100%', height: 120 }}
                            className="object-fit-cover"
                        />
                    </div>
                    <div className="col-md-8 d-flex">
                        <div className="p-2">
                            <p className='font-weight-bold ml-1 mt-1' style={{ fontSize: '110%', marginBottom: 0 }}>{webinarEvent?.title}</p>
                            <div className="ml-1 mt-1 row">
                                <div className="d-flex ml-1">
                                    <i className="fas fa-calendar mr-1 mt-1 font-size-80-percent" style={{ color: 'black' }}></i>
                                    <p className='font-size-80-percent'>{DateTimeFormat(webinarEvent?.event_date, 0)}</p>
                                </div>
                                <div className="d-flex ml-4">
                                    <i className="fas fa-clock mr-1 mt-1 font-size-80-percent" style={{ color: 'black' }}></i>
                                    <p className='font-size-80-percent'>{DateTimeFormat(webinarEvent?.event_date, -1)}</p>
                                </div>
                            </div>
                            <div className="ml-1 mt-2 row">
                                {speakers?.map((speaker) => {
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
                <div className='row mb-1 d-flex align-items-center justify-content-between'>
                    {
                        (ticket?.last_status?.mp_transaction_status_master_key === 'cancelled' || ticket?.last_status?.mp_transaction_status_master_key === 'expired') ?
                            <>
                                <div className="col-md-6 d-flex">
                                    <button onClick={funcDetailButton} className="mt-0 border" style={{ backgroundColor: 'white', textAlign: 'center', width: '110%', height: 40, borderRadius: 5 }}>
                                        <p>{t('webinar.view_detail_transaction')}</p>
                                    </button>
                                </div>
                                <div className="col-md-6 d-flex">
                                    <Link to={GeneralRoutePath.WEBINAR_DETAIL_EVENT.replace(':id', webinarEvent?.id)} className="mt-0 border" style={{ color: 'white', backgroundColor: '#F8931D', textAlign: 'center', width: '110%', height: 40, borderRadius: 5 }}>
                                        <p>{t('my_orders.buy_again')}</p>
                                    </Link>
                                </div>
                            </> :
                            <>
                                {
                                    (moment(webinarEvent?.event_date).isAfter(currentDate)) ?
                                        <>
                                            <div className="col-md-6 d-flex">
                                                <button onClick={funcDetailButton} className="mt-0 border" style={{ backgroundColor: 'white', textAlign: 'center', width: '110%', height: 40, borderRadius: 5 }}>
                                                    <p>{t('webinar.view_detail_transaction')}</p>
                                                </button>
                                            </div>
                                            <div className="col-md-6 d-flex">
                                                <button onClick={funcETicketButton} className="m-0" style={{ color: 'white', backgroundColor: '#F8931D', textAlign: 'center', width: '110%', height: 40, borderRadius: 5 }}>
                                                    <p>E-Ticket</p>
                                                </button>
                                            </div>
                                        </> :
                                        <>
                                            {
                                                (ticket?.webinar_speaker_rating.length > 0) ?
                                                    <>
                                                        <div className="col-md-12 d-flex">
                                                            <button onClick={funcDetailButton} className="mt-0 border" style={{ backgroundColor: 'white', textAlign: 'center', width: '110%', height: 40, borderRadius: 5 }}>
                                                                <p>{t('webinar.view_detail_transaction')}</p>
                                                            </button>
                                                        </div>
                                                    </> :
                                                    <>
                                                        <div className="col-md-6 d-flex">
                                                            <button onClick={funcDetailButton} className="mt-0 border" style={{ backgroundColor: 'white', textAlign: 'center', width: '110%', height: 40, borderRadius: 5 }}>
                                                                <p>{t('webinar.view_detail_transaction')}</p>
                                                            </button>
                                                        </div>
                                                        <div className="col-md-6 d-flex">
                                                            <button onClick={funcReviewButton} className="m-0" style={{ color: 'white', backgroundColor: '#F8931D', textAlign: 'center', width: '110%', height: 40, borderRadius: 5 }}>
                                                                <p>{t('my_orders.review')}</p>
                                                            </button>
                                                        </div>
                                                    </>
                                            }
                                        </>
                                }
                            </>
                    }               
                </div>
            </div>
        </div>
    )
}

export default TicketCard