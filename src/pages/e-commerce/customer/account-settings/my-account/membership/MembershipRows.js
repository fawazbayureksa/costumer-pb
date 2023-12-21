import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import Config from '../../../../../../components/axios/Config';
import SwalToast from '../../../../../../components/helpers/SwalToast';
import { TinyMceContent } from '../../../../../../components/helpers/TinyMceEditor';
import { CurrencyFormat2 } from '../../../../../../components/helpers/CurrencyFormat';
import { ManualSwitchLanguageFn } from '../../../../../../components/helpers/ManualSwitchLanguage';
import CustomImage, { PublicStorageFolderPath } from '../../../../../../components/helpers/CustomImage';
import { useTranslation } from 'react-i18next';

const MembershipRows = ({ item, type, submit }) => {


    const [modalVoucher, setModalVoucher] = useState(false)
    const [detail, setModalDetail] = useState()
    const [submitting, setSubmitting] = useState()
    const [modalError, setModalError] = useState()



    const getMinPurchase = () => {
        if (!item.conditions) return null
        let min_purchase = item.conditions.find(x => x.type == "purchase" && x.purchase_trigger === true)
        if (min_purchase) return min_purchase.value

        return 0
    }
    const [t] = useTranslation()



    const handleSubmit = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}membership/buyVoucherWithPoints?`;

        setSubmitting(true)

        let data = {
            mp_voucher_id: item.id
        }

        axios.post(url, data, Config({
            Authorization: 'Bearer ' + Cookies.get('token'),
        })).then(res => {
            SwalToast.fire({
                icon: "success",
                title: res.data.message
            })
            setModalVoucher(false)
            submit()
        }).catch((error) => {
            let errMsg = "Whoops, something went wrong!"
            console.log(error)
            if (error.response) {
                console.log(error.response)
                errMsg = error.response.data.message
                if (errMsg == "Your Point is not enough") {
                    setModalError(true)
                    setModalVoucher(false)
                } else if (errMsg == "Loyalty Point is not enough") {
                    setModalError(true)
                    setModalVoucher(false)
                }
                else {
                    SwalToast.fire({ icon: "error", title: errMsg })
                }
            }
        }).finally(() => {
            setSubmitting(false)
        })
    }

    const editButton = () => {
        return type === 0
    }

    return (
        <>

            <div key={item.id} className="shadow-graph mt-3 border-accent-color mb-3" style={{ borderRadius: 10 }}>
                <div className='d-flex mb-2 responsive-card p-2'>
                    <div className='col-md-5 col-sm-5 col-lg-5 align-self-center'>
                        <CustomImage folder={PublicStorageFolderPath.voucher}
                            filename={item.image}
                            alt={item.image}
                            style={{ maxWidth: '100%', filter: (editButton() === true) ? "grayscale(1)" : "" }}
                            className="mt-2" />
                    </div>
                    <div className='col-md-7 col-sm-7 col-lg-7'>
                        <h6 className='font-weight-bold'>{item.name}</h6>
                        <h6 className='color-AAAAAA'>{item.code}</h6>
                        <h6 className='font-weight-bold color-EC9700'>
                            {CurrencyFormat2(getMinPurchase())} Point
                        </h6>
                        <h6 className='color-EC9700 cursor-pointer ' onClick={() => setModalDetail(true)}>{t("membership.details")}</h6>
                        <div className='button-exchange'>
                            {editButton() === true ?
                                <button
                                    disabled
                                    className="btn btn-sm text-white bgc-95A4AF button-nowrap"
                                    onClick={(e) => setModalVoucher(true)}>
                                    {t("membership.exchange_points")}
                                </button>
                                :
                                <button
                                    className="btn btn-sm text-white bgc-accent-color button-nowrap"
                                    onClick={(e) => setModalVoucher(true)}>
                                    {t("membership.exchange_points")}
                                </button>
                            }
                        </div>
                    </div>
                </div>

            </div>

            <Modal
                centered
                show={modalVoucher}
                onHide={() => setModalVoucher(false)}>
                <Modal.Header closeButton>
                    <h6 className="font-weight-bold text-center">{t("membership.header_modal_exchange_point")}</h6>
                </Modal.Header>
                <Modal.Body>
                    <h6 className="font-weight-bold">{item.name} </h6>
                    <h6 className='color-EC9700'>{CurrencyFormat2(getMinPurchase())} {t("membership.point")}</h6>
                    <hr />
                    <div className='d-flex justify-content-end'>
                        <button type="button" className="btn bgc-FFFFFF border-95A4AF text-dark font-weight-bold " onClick={() => setModalVoucher(false)}>{t("membership.button_cancel_modal_exchange_point")}</button>
                        <button type="button" className="btn text-white font-weight-bold bgc-EC9700  ml-2" onClick={handleSubmit}>{t("membership.button_modal_exchange_point")}</button>
                    </div>
                </Modal.Body>
            </Modal>
            <Modal
                centered
                show={detail}
                onHide={() => setModalDetail(false)}>
                <Modal.Body>
                    <TinyMceContent>
                        {ManualSwitchLanguageFn(item.informations, "language_code", "terms_and_conditions")}
                    </TinyMceContent>
                </Modal.Body>
            </Modal>
            <Modal
                size='md'
                centered
                show={modalError}
                onHide={() => setModalError(false)}
            >
                <Modal.Header closeButton>
                    <h5 className='font-weight-bold'>{t("membership.header_modal_error_point")}</h5>
                </Modal.Header>
                <Modal.Body>
                    <h6>{t("membership.body_modal_error_point")}</h6>
                </Modal.Body>
            </Modal>
        </>
    )
}

export default MembershipRows