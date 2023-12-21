import React, { lazy, Suspense, useEffect, useState } from 'react';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import Cookies from 'js-cookie';
import Config from "../../axios/Config";
import { Modal } from 'react-bootstrap';
import Select from 'react-select';
import SwalToast from '../SwalToast';
import LoadingProgress from '../LoadingProgress';

const MapBox = lazy(() => import('../MapBox'));

const EditCustomerAddress = (props) => {
    const [show_edit_modal, set_show_edit_modal] = useState(false);
    const [submitting, set_submitting] = useState(false);
    const [current_address, set_current_address] = useState({});
    const [receiver_name, set_receiver_name] = useState('');
    const [receiver_phone, set_receiver_phone] = useState('');
    const [city, set_city] = useState('')
    const [subdistrict, set_subdistrict] = useState('')
    const [province, set_province] = useState('');
    const [postal_code, set_postal_code] = useState('');
    const [address_name, set_address_name] = useState('');
    const [address, set_address] = useState('');
    const [provinces, set_provinces] = useState([]);
    const [cities, set_cities] = useState([]);
    const [subdistricts, set_subdistricts] = useState([]);
    const [lng, set_lng] = useState(null)
    const [lat, set_lat] = useState(null)
    const [map_modal, set_map_modal] = useState(false)
    const [is_main, set_is_main] = useState(false);
    const [errors, set_errors] = useState({});

    useEffect(() => {
        if (props.modal) {
            showModalEdit(props.data)
        }
    }, [props.modal])

    const reactSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            fontSize: "16px"
        }),
        singleValue: (provided, state) => ({
            ...provided,
            fontSize: "16px"
        }),
        input: (provided, state) => ({
            ...provided,
            fontSize: "16px"
        }),
        valueContainer: (provided, state) => ({
            ...provided,
            fontSize: "16px"
        }),
        option: (provided, state) => ({
            ...provided,
            fontSize: "16px"
        }),
        placeholder: (provided, state) => ({
            ...provided,
            fontSize: "16px"
        }),
        noOptionsMessage: (provided, state) => ({
            ...provided,
            fontSize: "16px"
        })

    }
    const updateCustomerAddress = (e) => {
        e.preventDefault()
        if (!validate()) return;

        let url = `${process.env.REACT_APP_BASE_API_URL}profile/address/update`
        let data = {
            mp_customer_address_id: current_address.id,
            receiver_name: receiver_name,
            receiver_phone: receiver_phone,
            city: city ? city.label : "",
            subdistrict: subdistrict ? subdistrict.label : "",
            province: province ? province.label : "",
            postal_code: postal_code,
            address_name: address_name,
            address: address,
            is_main: is_main,
            lng: lng,
            lat: lat,
        }
        set_submitting(true)
        axios.post(url, data, Config({
            Authorization: 'Bearer ' + Cookies.get('token')
        })).then(res => {
            SwalToast.fire({
                icon: 'success',
                title: 'Successfully Updated'
            })
            closeModalEdit()
            props.closeModal()
        }).catch((error) => {
            let errMsg = 'Whoops. Something went wrong!'
            if (error.response) errMsg = error.response.data.message
            SwalToast.fire({
                icon: "error",
                title: errMsg
            })
        }).finally(() => {
            set_submitting(false)
        })
    }
    const getProvinces = () => {
        axios.get(`${process.env.REACT_APP_BASE_API_URL}profile/address/getProvince`, Config({
            Authorization: 'Bearer ' + Cookies.get('token')
        })).then(res => {
            set_provinces(res.data.data)
        }).catch((error) => {
            SwalToast.fire({
                icon: 'error',
                title: 'Whoops. Something went wrong!'
            });
        })
    }
    const handleProvinceSelect = (option) => {
        set_province(option)
        let url = `${process.env.REACT_APP_BASE_API_URL}profile/address/getCityByProvince`
        let data = {
            mp_province_name: option.label
        }
        axios.post(url, data, Config({
            Authorization: 'Bearer ' + Cookies.get('token')
        })).then(res => {
            set_cities(res.data.data)
        }).catch(error => {
            if (error.response === undefined) {
                SwalToast.fire({
                    icon: 'error',
                    title: 'Whoops. Something went wrong!'
                });
            }
        })
    }
    const handleCitySelect = (option) => {
        set_city(option);
        let url = `${process.env.REACT_APP_BASE_API_URL}profile/address/getSubdistrictByCity`
        let data = {
            mp_city_name: option.label
        }
        axios.post(url, data, Config({
            Authorization: 'Bearer ' + Cookies.get('token')
        })).then(res => {
            set_subdistricts(res.data.data);
        }).catch(error => {
            if (error.response === undefined) {
                SwalToast.fire({
                    icon: 'error',
                    title: 'Whoops. Something went wrong!'
                });
            }
        })
    }

    const handleSubdistrictSelect = (option) => {
        set_subdistrict(option);
    }
    const showModalEdit = (data) => {
        getProvinces();
        handleProvinceSelect({ label: data.province, value: data.province })
        handleCitySelect({ label: data.city, value: data.city })
        set_current_address(data);
        set_receiver_name(data.receiver_name);
        set_receiver_phone(data.receiver_phone);
        set_city(cities.find(data1 => data1.label == data.city));
        set_subdistrict(subdistricts.find(data1 => data1.label == data.subdistrict));
        set_province(provinces.find(data1 => data1.label == data.province));
        set_postal_code(data.postal_code);
        set_address_name(data.address_name);
        set_address(data.address);
        set_is_main(data.is_main);
        set_show_edit_modal(true);
        set_errors({});
        set_lng(data.lng)
        set_lat(data.lat)
    }
    const closeModalEdit = () => {
        set_current_address({});
        set_show_edit_modal(false);
        props.runAfter();
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
            #react-select-3-input{
                font-size: 14px;
            }
        `}
            </style>
        )
    }
    const validate = () => {
        let validate = true;
        let errors = {};
        if (!receiver_name) {
            validate = false;
            errors.receiver_name = ["Receiver Name is required"];
        }
        if (!receiver_phone) {
            validate = false;
            errors.receiver_phone = ["Receiver Phone is required"];
        }
        if (!city) {
            validate = false;
            errors.city = ["City"];
        }
        if (!subdistrict) {
            validate = false;
            errors.subdistrict = ["Subdistrict"];
        }
        if (!province) {
            validate = false;
            errors.province = ["Province"];
        }
        if (!postal_code) {
            validate = false;
            errors.postal_code = ["Postal Code"];
        }
        if (!address_name) {
            validate = false;
            errors.address_name = ["Address Name is required"];
        }
        if (!address) {
            validate = false;
            errors.address = ["Address is required"];
        }
        set_errors(errors)
        console.log(errors)
        return validate
    }

    const onMapSave = (lngLat) => {
        set_lng(lngLat[0])
        set_lat(lngLat[1])
        set_map_modal(false)
    }

    return (
        <>
            <Style />
            {props.element &&
                <a href="#" className="text-decoration-none" onClick={event => { props.closeModalChangeAddress(); showModalEdit(props.data) }}>
                    {props.element}
                </a>}
            {/* edit modal */}
            <Modal size="lg" centered show={props.modal} onHide={props.closeModal}>
                <Modal.Header>
                    <label className="font-weight-bold text color-374650">{t('address_list.edit_address')}</label>
                </Modal.Header>
                <Modal.Body>
                    {map_modal ?
                        <Suspense fallback={<LoadingProgress />}>
                            <MapBox onSave={onMapSave} onCancel={() => set_map_modal(false)} />
                        </Suspense>
                        : <form>
                            <div className="px-3 col">
                                <div className="row">
                                    <div className="col-6">
                                        <label className="text mobile-label color-374650" htmlFor="address_name">{t('address_list.address_name')}</label>
                                        <input id="address_name"
                                            type="text"
                                            className="border-D3D3D3 form-control mobile-input"
                                            name="address_name"
                                            onChange={(event) => set_address_name(event.target.value)}
                                            value={address_name}
                                            placeholder={t('address_list.address_name')}
                                            required />
                                        {errors.address_name && <div className="alert alert-danger p-2 mt-2" style={{ fontSize: "14px" }} role="alert">{errors.address_name[0]}</div>}
                                    </div>
                                    <div className="col-6 mt-2 mt-sm-2 mt-md-2 mt-lg-4 mt-xl-4 d-flex">
                                        <input type="checkbox" disabled={submitting} checked={is_main} onChange={() => set_is_main(!is_main)} className={`form-input mt-1`} />
                                        <label className="ml-2 color-374650" htmlFor="address_name">{t('address_list.set_as_default')}</label>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-6">
                                        <label className="text mobile-label color-374650" htmlFor="receiver_name">{t('address_list.receiver_name')}</label>
                                        <input id="receiver_name"
                                            type="text"
                                            className="border-D3D3D3 form-control mobile-input"
                                            name="receiver_name"
                                            onChange={(event) => { if (event.target.value.length < 20) set_receiver_name(event.target.value) }}
                                            value={receiver_name}
                                            placeholder={t('address_list.receiver_name')}
                                            required />
                                        {errors.receiver_name && <div className="alert alert-danger p-2 mt-2" style={{ fontSize: "14px" }} role="alert">{errors.receiver_name[0]}</div>}
                                    </div>
                                    <div className="col-6">
                                        <label className="text mobile-label color-374650" htmlFor="receiver_phone">{t('address_list.phone_number')}</label>
                                        <input id="receiver_phone"
                                            type="number"
                                            className="border-D3D3D3 form-control mobile-input"
                                            name="receiver_phone"
                                            onChange={(event) => set_receiver_phone(event.target.value)}
                                            value={receiver_phone}
                                            placeholder={t('address_list.phone_number')}
                                            required />
                                        <label className="text color-858585" style={{ fontSize: "9px" }}>{t('address_list.phone_number_message')}</label>
                                        {errors.receiver_phone && <div className="alert alert-danger p-2 mt-2" style={{ fontSize: "14px" }} role="alert">{errors.receiver_phone[0]}</div>}
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-6">
                                        <label className="text mobile-label color-374650" htmlFor="province">{t('address_list.province')}</label>
                                        <Select id="province" value={province} options={provinces} className="text" onChange={option => { set_city(""); set_subdistrict(""); handleProvinceSelect(option) }} required />
                                    </div>
                                    <div className="col-6">
                                        <label className="text mobile-label color-374650" htmlFor="city">{t('address_list.city')}</label>
                                        <Select id="province" value={city} options={cities} className="text" onChange={option => { set_subdistrict(""); handleCitySelect(option) }} required />
                                    </div>
                                </div>
                                <div className="row mt-3">
                                    <div className="col-6">
                                        <label className="text mobile-label color-374650" htmlFor="subdistrict">{t('address_list.sub_district')}</label>
                                        <Select id="subdistrict" value={subdistrict} options={subdistricts} className="text" onChange={handleSubdistrictSelect} required />
                                    </div>
                                    <div className="col-6">
                                        <label className="text mobile-label color-374650" htmlFor="postal_code">{t('address_list.postal_code')}</label>
                                        <input id="postal_code"
                                            type="text"
                                            className="border-D3D3D3 form-control mobile-input"
                                            onChange={(event) => set_postal_code(event.target.value)}
                                            name="postal_code"
                                            placeholder={t('address_list.postal_code')}
                                            value={postal_code}
                                            required />
                                    </div>
                                </div>
                                {
                                    errors.postal_code || errors.city || errors.subdistrict || errors.province ?
                                        <div className="alert alert-danger p-2 mt-2" style={{ fontSize: "14px" }} role="alert">
                                            {errors.province ? errors.province[0] + " | " : null}
                                            {errors.city ? errors.city[0] + " | " : null}
                                            {errors.subdistrict ? errors.subdistrict[0] + " | " : null}
                                            {errors.postal_code ? errors.postal_code[0] + " | " : null}
                                            Is required
                                        </div> :
                                        null

                                }
                                <div className="row mt-3">
                                    <div className="col-12">
                                        <label className="text mobile-label color-374650" htmlFor="address_name">{t('address_list.address')}</label>
                                        <textarea id="address"
                                            type="text"
                                            className="border-D3D3D3 form-control mobile-input"
                                            name="address"
                                            rows={5}
                                            placeholder={t('address_list.enter_address_detail')}
                                            onChange={(event) => { if (event.target.value.length < 255) set_address(event.target.value) }}
                                            value={address}
                                            required />
                                        {errors.address && <div className="alert alert-danger p-2 mt-2" style={{ fontSize: "14px" }} role="alert">{errors.address[0]}</div>}
                                    </div>
                                </div>
                                <div className="d-flex mt-2">
                                    <div className="link" onClick={() => set_map_modal(true)}>{t('address_list.pinpoint_address')}</div>
                                    <div>{lng && lat ? `: ${lng}, ${lat}` : "..."}</div>
                                </div>
                            </div>
                            <div className="row no-gutters mt-4">
                                <div className="d-flex ml-auto">
                                    <button
                                        type="button"
                                        onClick={props.closeModal}
                                        className="btn border-707070 shadow-graph color-374650 font-weight-bold"
                                    >{t('general.cancel')}</button>
                                    <button type="submit"
                                        disabled={submitting}
                                        onClick={updateCustomerAddress}
                                        className="btn bgc-accent-color shadow-graph font-weight-bold ml-3"
                                    >{t('general.edit')}</button>
                                </div>
                            </div>
                        </form>}
                </Modal.Body>
            </Modal>

        </>
    )

}

export default withTranslation()(EditCustomerAddress)