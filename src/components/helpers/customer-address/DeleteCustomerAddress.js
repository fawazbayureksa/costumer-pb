import React, { useEffect, useState } from 'react';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import Cookies from 'js-cookie';
import Config from "../../axios/Config";
import { Modal } from 'react-bootstrap';
import SwalToast from '../SwalToast';

const DeleteCustomerAddress = (props) => {
    const [current_address, set_current_address] = useState({});
    const [show_delete_modal, set_show_delete_modal] = useState(false);
    const [submitting, set_submitting] = useState(false);

    useEffect(() => {
        if (props.modal) {
            showModalDelete(props.data)
        }
    }, [props.modal])

    const deleteCustomerAddress = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}profile/address/delete`
        let data = {
            mp_customer_address_id: current_address.id
        }
        set_submitting(true);
        axios.post(url, data, Config({
            Authorization: 'Bearer ' + Cookies.get('token')
        })).then(res => {
            SwalToast.fire({
                icon: 'success',
                title: 'Successfully Deleted'
            });
            props.closeModal()
            props.runAfter()
        }).catch((error) => {
            console.log(error)
            let errMsg = 'Whoops. Something went wrong!'
            if (error.response) errMsg = error.response.data.message
            SwalToast.fire({
                icon: 'error',
                title: errMsg
            });
        }).finally(() => {
            set_submitting(false)
        })
    }

    const showModalDelete = (data) => {
        set_current_address(data);
        set_show_delete_modal(true);
    }

    const { t } = props;

    const Style = () => {
        return (
            <style jsx="true">
                {`
            @media only screen and (max-width: 767.98px) {
                .mobile-input{
                    border: none;
                    border-bottom:solid 1px #C1C8CE;
                    padding: 0.6rem;
                    border-radius: 0;
                }
                .mobile-label{
                    display:none;
                }   
            }          
            .mobile-input::placeholder { 
                color: #D3D3D3;
                opacity: 1; 
            }
            .text{
                letter-spacing: 0rem;
            }
        `}
            </style>
        )
    }

    return (
        <>
            <Style />
            {/* delete modal */}
            <Modal size="lg" centered show={props.modal} onHide={props.closeModal}>
                <Modal.Header>
                    <label className="font-weight-bold mx-auto text color-374650">{t('address_list.delete_address')}</label>
                </Modal.Header>
                <Modal.Body>
                    <div className="row mt-4 px-3">
                        <div className="col-4">
                            <p className="m-0 text color-22262A font-weight-semi-bold">{current_address.receiver_name}</p>
                            <p className="m-0 text color-22262A">{current_address.receiver_phone}</p>
                        </div>
                        <div className="col-4">
                            <p className="m-0 text color-22262A font-weight-semi-bold">{current_address.address_name}</p>
                            <p className="m-0 text color-22262A">{current_address.address}</p>
                        </div>
                        <div className="col-4">
                            <p className="m-0 text color-22262A">{current_address.city} {current_address.postal_code}</p>
                            <p className="m-0 text color-22262A">{current_address.province}</p>
                        </div>
                    </div>
                    <hr />
                    <form>
                        <div className="row">
                            <div className="col-6">
                                <button
                                    type="button"
                                    onClick={props.closeModal}
                                    className="btn btn-block border-707070 shadow-graph color-374650 font-weight-bold ml-auto" style={{ width: "40%" }}
                                >{t('general.cancel')}</button>
                            </div>
                            <div className="col-6">
                                <button type="submit"
                                    onClick={deleteCustomerAddress}
                                    disabled={submitting}
                                    className="btn btn-block bgc-EB2424 shadow-graph text-white font-weight-bold" style={{ width: "40%" }}
                                >{t('general.delete')}</button>
                            </div>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
        </>
    )
}

export default withTranslation()(DeleteCustomerAddress)