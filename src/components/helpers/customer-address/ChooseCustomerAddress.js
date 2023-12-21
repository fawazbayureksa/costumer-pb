import React, { useState } from 'react';
import { withTranslation } from 'react-i18next';
import { Modal } from 'react-bootstrap';
import IsEmpty from '../IsEmpty';

const ChooseCustomerAddress = (props) => {

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
            #react-select-3-input{
                font-size: 14px;
            }
        `}
            </style>
        )
    }

    return (
        <>
            <Style />
            <Modal size="xl" centered show={props.modal} onHide={() => props.closeModal}>
                <Modal.Header className="d-flex">
                    <Modal.Title className="font-weight-bold small color-5F6C73">{t('checkout.select_shipping_address')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {props.config && props.config.type === 'type_1' ?
                        <>
                            <div className="border-dashed-707070 text-center p-1">
                                <a href="#" className="text-decoration-none font-weight-semi-bold accent-color" onClick={() => props.addAddress()}>{t('checkout.add_an_address')}</a>
                            </div>
                            {props.customer_addresses.map(value => (
                                <div className={`rounded p-3 mt-3 ${IsEmpty(props.address_selected) ? 'border-2E90E5' : props.address_selected.id === value.id ? 'border-accent-color' : 'border-2E90E5'}`} key={value.id}>
                                    <p className="m-0 color-646464 "><b>{value.receiver_name}</b> {value.receiver_phone} <b>({value.address_name})</b> {value.is_main && <span className="border-2E90E5 rounded px-2">Default</span>}</p>
                                    <p className="m-0 color-646464 ">{value.address}</p>
                                    <p className="m-0 color-646464 ">{value.subdistrict}, {value.city}, {value.postal_code}</p>
                                    <div className="d-flex align-items-center justify-content-between mt-1">
                                        <div className="d-flex align-items-center">
                                            <a href="#" className="text-decoration-none color-2678BF font-weight-semi-bold" onClick={() => props.editAddress("address_selected", value)}>{t('checkout.edit')}</a>
                                            {!value.is_main &&
                                                <>
                                                    <label className="mx-3 color-D3D3D3">|</label>
                                                    <a href="#" className="text-decoration-none color-2678BF font-weight-semi-bold" onClick={() => props.setDefaultAddress("address_selected", value)}>{t('checkout.set_default_address')}</a>
                                                </>}
                                        </div>
                                        {(!props.address_selected || props.address_selected.id != value.id) && <a href="#" onClick={() => props.useAddress("address_selected", value)} className="text-decoration-none color-2678BF ml-3">{t('checkout.use_this_address')}</a>}
                                    </div>
                                </div>
                            ))}
                        </> :
                        <>
                            <div className="">
                                {props.customer_addresses.map(value => (
                                    <div className="d-flex border-bottom py-2">
                                        <input type="radio" checked={props.address_selected && props.address_selected.id === value.id}
                                            onClick={() => props.useAddress("address_selected", value)}
                                        />
                                        <div className="w-100 ml-4">
                                            <p className=" font-weight-semi-bold">{value.receiver_name} ({value.address_name}) | {value.receiver_phone} {value.is_main && <span className="bgc-accent-color rounded px-2">Default</span>}</p>
                                            <p className="">{value.address}</p>
                                            <p className="">{value.subdistrict}, {value.city}, {value.postal_code}</p>
                                            <div className="d-flex accent-color py-2">
                                                <a href="#" className="text-decoration-none accent-color font-weight-semi-bold" onClick={() => props.editAddress("address_selected", value)}>{t('checkout.edit')}</a>
                                                {!value.is_main &&
                                                    <>
                                                        <label className="mx-3 color-D3D3D3">|</label>
                                                        <a href="#" className="text-decoration-none accent-color font-weight-semi-bold" onClick={() => props.setDefaultAddress("address_selected", value)}>{t('checkout.set_default_address')}</a>
                                                    </>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="my-3">
                                <a href="#" className="text-decoration-none font-weight-semi-bold accent-color" onClick={() => props.addAddress()}>{t('checkout.add_an_address')}</a>
                            </div>
                        </>}
                    <div className="d-flex">
                        <div className="btn border-707070 font-weight-semi-bold ml-auto mt-2" onClick={props.closeModal}>{t("general.cancel")}</div>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    )

}

export default withTranslation()(ChooseCustomerAddress)