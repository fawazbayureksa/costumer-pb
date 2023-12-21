import React, { useEffect, useState } from 'react';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import Cookies from 'js-cookie';
import Config from '../../../../components/axios/Config';
import SwalToast from '../../../../components/helpers/SwalToast';
import DeleteCustomerAddress from '../../../../components/helpers/customer-address/DeleteCustomerAddress';
import AddCustomerAddress from '../../../../components/helpers/customer-address/AddCustomerAddress';
import EditCustomerAddress from '../../../../components/helpers/customer-address/EditCustomerAddress';
import SetDefaultAddress from '../../../../components/helpers/customer-address/SetDefaultAddress';
import MyContext from '../../../../components/MyContext';
import MetaTrigger from '../../../../components/MetaTrigger';


const AddressList = (props) => {
    const [addresses, set_addresses] = useState([]);
    const [modal_add_address, set_modal_add_address] = useState(false);
    const [modal_edit_address, set_modal_edit_address] = useState(false);
    const [modal_delete_address, set_modal_delete_address] = useState(false);
    const [address_selected, set_address_selected] = useState(null);
    useEffect(() => {
        getMasterData()
    }, [])

    const getMasterData = () => {
        axios.get(`${process.env.REACT_APP_BASE_API_URL}profile/address/get`, Config({
            Authorization: 'Bearer ' + Cookies.get('token')
        })).then(res => {
            console.log(res.data.data)
            set_addresses(res.data.data)
        }).catch((error) => {
            SwalToast.fire({
                icon: 'error',
                title: 'Whoops. Something went wrong!'
            });
        })
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
        <MyContext.Consumer>{context => (
            <>
                <MetaTrigger
                    pageTitle={context.companyName ? `${t('account_setting.address')} - ${context.companyName} ` : ""}
                    pageDesc={t('account_setting.address')}
                />
                <div className="bg-white shadow-graph rounded p-3">
                    <div className="p-3">
                        <Style />
                        <div className="col-12">
                            <div className="d-flex justify-content-start">
                                <a href="#" className="text-decoration-none font-weight-semi-bold accent-color ml-3" onClick={() => set_modal_add_address(true)}>{t('checkout.add_an_address')}</a>
                            </div>
                            <div className="address-list mt-4">
                                <div className="d-none d-sm-none d-md-none d-lg-block d-xl-block">
                                    <div className="row">
                                        <div className="col-1">
                                        </div>
                                        <div className="col-3">
                                            <p className="m-0 color-22262A font-weight-bold">{t('address_list.receiver')}</p>
                                        </div>
                                        <div className="col-3">
                                            <p className="m-0 color-22262A font-weight-bold">{t('address_list.delivery_address')}</p>
                                        </div>
                                        <div className="col-3">
                                            <p className="m-0 color-22262A font-weight-bold">{t('address_list.delivery_area')}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-2" style={{ borderTop: '1px solid #C1C8CE' }}></div>
                                {addresses.map((value, index, array) => (
                                    <div key={index} className="row mt-4">
                                        <div className="col-12 col-sm-12 col-md-12 col-lg-1 col-xl-1">
                                            <SetDefaultAddress data={value} runAfter={() => getMasterData()} />
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-12 col-lg-3 col-xl-3">
                                            <p className="m-0 color-22262A font-weight-semi-bold">{value.receiver_name}</p>
                                            <p className="m-0 color-22262A">{value.receiver_phone}</p>
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-12 col-lg-3 col-xl-3">
                                            <p className="m-0 color-22262A font-weight-semi-bold">{value.address_name}</p>
                                            <p className="m-0 color-22262A">{value.address}</p>
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-12 col-lg-3 col-xl-3">
                                            <p className="m-0 color-22262A">{value.subdistrict}, {value.city} {value.postal_code}</p>
                                            <p className="m-0 color-22262A">{value.province}</p>
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-12 col-lg-2 col-xl-2 d-flex align-items start">
                                            <a href="#" className="text-decoration-none accent-color font-weight-semi-bold" onClick={() => { set_address_selected(value); set_modal_edit_address(true) }}>{t('checkout.edit')}</a>
                                            <a href="#" className="text-decoration-none accent-color font-weight-semi-bold ml-3" onClick={() => { set_address_selected(value); set_modal_delete_address(true) }}>{t('general.delete')}</a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <AddCustomerAddress
                            modal={modal_add_address}
                            runAfter={getMasterData}
                            closeModal={() => set_modal_add_address(false)} />

                        <EditCustomerAddress
                            modal={modal_edit_address}
                            data={address_selected}
                            runAfter={getMasterData}
                            closeModal={() => set_modal_edit_address(false)} />

                        <DeleteCustomerAddress
                            modal={modal_delete_address}
                            data={address_selected}
                            runAfter={getMasterData}
                            closeModal={() => set_modal_delete_address(false)} />

                    </div>
                </div>
            </>
        )}</MyContext.Consumer>
    )
}

export default withTranslation()(AddressList)