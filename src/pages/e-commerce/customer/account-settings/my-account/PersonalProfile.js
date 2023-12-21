import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import { withTranslation } from 'react-i18next';
import axios from "axios";
import Config from "../../../../../components/axios/Config";
import { Modal } from 'react-bootstrap'
import Swal from 'sweetalert2';
import DatePicker from 'react-datepicker';
import Select from "react-select";
import makeAnimated from 'react-select/animated';
import PhoneInput from 'react-phone-number-input/input';
import ExceedUploadLimit from '../../../../../components/helpers/ExceedUploadLimit';
import SwalToast from '../../../../../components/helpers/SwalToast';
import CustomImage, { PublicStorageFolderPath } from '../../../../../components/helpers/CustomImage';
import { DateTimeFormat } from '../../../../../components/helpers/DateTimeFormat';
const animatedComponents = makeAnimated();

const OnlyInput = (props) => {
    const onChange = (e) => {
        if (props.onChange) props.onChange(e);
    }
    return (
        <input id={props.id} type={props.type} disabled={props.disabled} className="border-D3D3D3 form-control mobile-input" name={props.name} onChange={onChange} value={props.value} onBlur={props.onBlur} placeholder={props.placeholder} pattern={props.pattern} required />
    )

}

const PersonalProfile = (props) => {
    const [user_data, set_user_data] = useState({});
    const [old_password, set_old_password] = useState('');
    const [new_password, set_new_password] = useState('');
    const [confirm_password, set_confirm_password] = useState('');
    const [change_password, set_change_password] = useState(false);
    const [name, set_name] = useState('');
    const [email, set_email] = useState('');
    // const [change_email, set_change_email] = useState(false);
    const [email_verified, set_email_verified] = useState(false);
    const [phone_number, set_phone_number] = useState('');
    const [change_phone_number, set_change_phone_number] = useState(false);
    const [phone_number_verified, set_phone_number_verified] = useState(false);
    const [date_of_birth, set_date_of_birth] = useState('');
    const [gender, set_gender] = useState('');
    const [edit_name, set_edit_name] = useState(false);
    const [edit_gender, set_edit_gender] = useState(false);
    const [edit_date_of_birth, set_edit_date_of_birth] = useState(false);
    const [is_submitting, set_is_submitting] = useState(false);
    const [password_match, set_password_match] = useState(false);
    const [profile_picture, set_profile_picture] = useState('');
    const [errors, set_errors] = useState({});
    const [show_image, set_show_image] = useState(false)
    // const [on_curation, set_on_curation] = useState(false);

    const gender_option = {
        'male': { value: 'male', label: 'Male', className: 'select-input' },
        'female': { value: 'female', label: 'Female', className: 'select-input' },
        'unassigned': { value: 'unassigned', label: 'Not Specified', className: 'select-input' }
    }
    const gender_options = [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'unassigned', label: 'Not Specified' }
    ]


    const Style = () => {
        return (
            <style jsx="true">{`
                .label-text{
                    letter-spacing: 0px;
                    font-size: 14px;
                }
                .edit-toggle{
                    letter-spacing: 0px;
                    font-size: 9px;
                }
                .select-input {
                    font-size:14px;
                }
                .profile-picture-container {
                    border-radius: 15px;
                    box-shadow: 0px 3px 6px #00000029;
                    height: 100px;
                    width: 100px;
                }
                
            `}</style>
        )
    }

    useEffect(() => {
        getMasterDataProfile()
    }, [])

    const getMasterDataProfile = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}profile/get`
        axios.get(url, Config({
            Authorization: 'Bearer ' + Cookies.get('token')
        })).then(res => {
            set_name(res.data.data.name)
            set_email(res.data.data.email)
            if (res.data.data.email_verified_at) {
                set_email_verified(true)
            } else {
                set_email_verified(false)
            }
            set_phone_number(res.data.data.phone_number)
            set_date_of_birth(res.data.data.date_of_birth)
            set_gender(res.data.data.gender)
            set_profile_picture(res.data.data.profile_picture)
            // set_on_curation(res.data.data.curation_status)
        })
    }

    const updateProfile = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}profile/update`
        let data = {
            name: name,
            date_of_birth: date_of_birth,
            gender: gender,
        }

        set_is_submitting(true)

        axios.post(url, data, Config({
            Authorization: 'Bearer ' + Cookies.get('token')
        })).then(res => {
            if (res.data.success) {
                SwalToast.fire({
                    icon: 'success',
                    title: 'Data Updated'
                });
                Cookies.set('user', res.data.data)
            } else {
                SwalToast.fire({
                    icon: 'error',
                    title: 'Whoops. Something went wrong!'
                });
                getMasterDataProfile()
            }
        }).catch((error) => {
            console.log(error)
            if (error.response === undefined) {
                SwalToast.fire({
                    icon: 'error',
                    title: 'Whoops. Something went wrong!'
                });
            }
            getMasterDataProfile()
        }).finally(() => {
            set_is_submitting(false)
        });
    }

    const handleDateOfBirth = (selected) => {
        set_date_of_birth(selected)
    }
    const handleChangeName = (event) => {
        set_name(event.target.value)
    }
    const handleChangeGender = (event, e) => {
        set_gender(event.value)
    }
    const handleChangePhoneNumber = (event, e) => {
        set_phone_number(event)
    }

    // const handleChangeEmail = (event, e) => {
    //     set_email(event.target.value)
    // }
    const handleChangePassword = () => {
        changePassword();
        set_change_password(false);
        set_old_password('');
        set_new_password('');
        set_confirm_password('');
    }

    const changePassword = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}password/change`
        let data = {
            old_password: old_password,
            new_password: new_password,
        }
        set_is_submitting(true)
        axios.post(url, data, Config({
            Authorization: 'Bearer ' + Cookies.get('token')
        })).then(res => {
            if (res.data.success) {
                SwalToast.fire({
                    icon: 'success',
                    title: 'Password succesfully changed!'
                });
            } else {
                SwalToast.fire({
                    icon: 'error',
                    title: 'Whoops. Something went wrong!'
                });
            }
            getMasterDataProfile()
        }).catch((error) => {
            SwalToast.fire({
                icon: 'error',
                title: error.response.data.message
            });
            getMasterDataProfile()
        }).finally(() => {
            set_is_submitting(false)
            set_change_password(false)
        });
    }

    const changePhoneNumber = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}profile/change/phone-number`
        let data = {
            phone_number: phone_number,
        }
        axios.post(url, data, Config({
            Authorization: 'Bearer ' + Cookies.get('token')
        })).then(res => {
            console.log(res)
            if (res.data.success) {
                SwalToast.fire({
                    icon: 'success',
                    title: 'Phone number successfuly changed!'
                });
            } else {
                SwalToast.fire({
                    icon: 'error',
                    title: 'Whoops. Something went wrong!'
                });
            }
            getMasterDataProfile()
        }).catch((error) => {
            console.log(error)
            SwalToast.fire({
                icon: 'error',
                title: 'Whoops. Something went wrong!'
            });
            getMasterDataProfile()
        }).finally(() => {
            set_is_submitting(false)
            set_change_phone_number(false)
        });
    }

    // const changeEmail = () => {
    //     let url = `${process.env.REACT_APP_BASE_API_URL}profile/change/email`
    //     let data = {
    //         email : email,
    //     }
    //     axios.post(url, data, Config({
    //         Authorization: 'Bearer ' + Cookies.get('token') 
    //     })).then(res => {
    //         console.log(res)
    //         if(res.data.success){
    //             SwalToast.fire({
    //                 icon: 'success',
    //                 title: 'Email successfuly changed! Verification Code has been sent to your new email address'
    //             });
    //         }else{
    //             SwalToast.fire({
    //                 icon: 'error',
    //                 title: 'Whoops. Something went wrong!'
    //             });
    //         }
    //         getMasterDataProfile()
    //     }).catch((error) => {
    //         console.log(error)
    //         SwalToast.fire({
    //             icon: 'error',
    //             title: 'Whoops. Something went wrong!'
    //         });
    //         getMasterDataProfile()
    //     }).finally(() => {
    //         set_is_submitting(false)
    //         set_change_email(false)
    //     });
    // }

    const setConfirmPassword = (event) => {
        set_confirm_password(event.target.value)
        if (new_password != event.target.value) {
            set_password_match(false)
        } else {
            set_password_match(true)
        }
    }

    const toggleEdit = (key) => {
        if (key == "name") {
            set_edit_name(true)
        } else if (key == "gender") {
            set_edit_gender(true)
        } else if (key == "date_of_birth") {
            set_edit_date_of_birth(true)
        } else if (key == "password") {
            set_change_password(true)
        } else if (key == "phone_number") {
            set_change_phone_number(true)
        }
        // else if(key == "email"){
        //     set_change_email(true)
        // }
    }

    const toggleSave = (key) => {
        updateProfile()
        if (key == "name") {
            set_edit_name(false)
        } else if (key == "gender") {
            set_edit_gender(false)
        } else if (key == "date_of_birth") {
            set_edit_date_of_birth(false)
        }
    }

    const onFileChange = (event) => {
        let value = event.target.files[0]
        if (value) {
            let exceed = ExceedUploadLimit(value)
            if (exceed.value) {
                let errors = {}
                errors.filename = `limit upload size is ${exceed.max_size / 1024} Kb`
                set_errors(errors);
                return;
            }
            // set_loading(true);
            const formData = new FormData()
            formData.append('file', value);
            let url = process.env.REACT_APP_BASE_API_URL + 'profile/change/profile-picture';

            axios.post(url, formData, Config({
                Authorization: 'Bearer ' + Cookies.get('token'),
                'content-type': 'multipart/form-data'
            })).then(response => {
                console.log(response)
                getMasterDataProfile()
            }).catch(error => {
                console.log(error)
                if (error.response) {
                    let errors = {}
                    errors.filename = error.response.data.message
                    set_errors(errors)
                }
            }).finally(() => {
            });

        }
    }

    const toggleImage = () => {
        set_show_image(!show_image)
    }

    const { t } = props;
    return (
        <>
            {/* if (props.data.layout == "type_1") */}
            <Style />
            <div className="col-12 mt-3">
                <div className="col-12 mb-5">
                    <div className="row mb-3">
                        <div className="col-12 col-sm-12 col-md-12 col-lg-4 col-xl-4 mt-3">
                            <div>
                                <CustomImage folder={PublicStorageFolderPath.customer} filename={profile_picture} alt={profile_picture} className="profile-picture-container object-fit-cover rounded" onClick={toggleImage} />
                            </div>
                            <label for="add-file" className="btn border-707070 mt-3">Pilih Foto</label>
                            <input type="file" className="custom-file-input d-none" id="add-file" onChange={onFileChange} accept="image/*" />
                            <p className="label-text">Ukuran maksimal 1MB</p>
                            <p className="label-text">Ekstensi JPG, JPEG, PNG</p>


                            {
                                errors.filename ?
                                    <div className="alert alert-danger p-2 mt-2" role="alert">{errors.filename}</div> : null
                            }
                            <Modal size="xl" centered show={show_image} onHide={toggleImage}>
                                <CustomImage folder={PublicStorageFolderPath.customer} filename={profile_picture} alt={profile_picture} />
                            </Modal>
                        </div>
                        <div className="col-12 col-sm-12 col-md-12 col-lg-8 col-xl-8 mt-4 mt-sm-4 mt-md-4 mt-lg-0 mt-xl-0">
                            <label className="font-weight-bold label-text">{t('profile_setting.contact_information')}</label>
                            <div className="row">
                                <div className="col-4">
                                    <label className="label-text">{t('profile_setting.name')}</label>
                                </div>
                                <div className="col-8">
                                    {
                                        edit_name ?
                                            <div className="row">
                                                <div className="col-6">
                                                    <OnlyInput type="text" id="txtName" name="name" onChange={handleChangeName} value={name} placeholder={t('auth_form.name')} />
                                                </div>
                                                <div className="col-6">
                                                    <label className="label-text color-8CC73F" onClick={() => { toggleSave('name') }}>Save</label>
                                                </div>
                                            </div>
                                            :
                                            <div className="row">
                                                <div className="col-6">
                                                    <label className="label-text">{name}</label>
                                                </div>
                                                <div className="col-6">
                                                    <label className="label-text accent-color" onClick={() => { toggleEdit('name') }}>Edit</label>
                                                </div>
                                            </div>
                                    }
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-4">
                                    <label className="label-text">{t('profile_setting.date_of_birth')}</label>
                                </div>
                                <div className="col-8">
                                    {
                                        edit_date_of_birth ?
                                            <div className="row">
                                                <div className="col-6">
                                                    <DatePicker selected={Date.parse(date_of_birth)} name="date_of_birth" id="date_of_birth" onChange={handleDateOfBirth}
                                                        autoComplete="off" className="form-control" placeholderText={t('auth_form.date_of_birth_placeholder')}
                                                        showMonthDropdown showYearDropdown dropdownMode="select" />
                                                </div>
                                                <div className="col-6">
                                                    <label className="label-text color-8CC73F" onClick={() => { toggleSave('date_of_birth') }}>Save</label>
                                                </div>
                                            </div>
                                            :
                                            <div className="row">
                                                <div className="col-6">
                                                    <label className="label-text">{DateTimeFormat(date_of_birth, 0)}</label>
                                                </div>
                                                <div className="col-6">
                                                    <label className="label-text accent-color" onClick={() => { toggleEdit('date_of_birth') }}>Edit</label>
                                                </div>
                                            </div>
                                    }
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-4">
                                    <label className="label-text">{t('profile_setting.gender')}</label>
                                </div>
                                <div className="col-8">
                                    {
                                        edit_gender ?
                                            <div className="row">
                                                <div className="col-6 label-text">
                                                    <Select
                                                        isClearable
                                                        components={animatedComponents}
                                                        options={gender_options}
                                                        value={gender_option[gender]}
                                                        onChange={handleChangeGender}
                                                    />
                                                </div>
                                                <div className="col-6">
                                                    <label className="label-text color-8CC73F" onClick={() => { toggleSave('gender') }}>Save</label>
                                                </div>
                                            </div>
                                            :
                                            <div className="row">
                                                <div className="col-6">
                                                    {
                                                        gender ?
                                                            <label className="label-text">{gender_option[gender].label}</label> :
                                                            <label className="label-text">{gender_option['unassigned'].label}</label>
                                                    }
                                                </div>
                                                <div className="col-6">
                                                    <label className="label-text accent-color" onClick={() => { toggleEdit('gender') }}>Edit</label>
                                                </div>
                                            </div>
                                    }
                                </div>
                            </div>
                            <hr />
                            <label className="font-weight-bold label-text">{t('profile_setting.account_security')}</label>
                            <div className="row">
                                <div className="col-4">
                                    <label className="label-text">{t('profile_setting.email')}</label>
                                </div>
                                <div className="col-8">
                                    {/* {
                                        change_email ? 
                                        <div className="row">
                                            <div className="col-6">
                                                <OnlyInput type="text" id="txtEmail" name="email" onChange={handleChangeEmail} value={email} placeholder={t('auth_form.email')}/>
                                            </div>
                                            <div className="col-6">
                                                <label className="label-text color-8CC73F" onClick={() => {changeEmail()}}>Save</label>
                                            </div>
                                        </div>
                                        :  */}
                                    <div className="row">
                                        <div className="col-6">
                                            <label className="label-text mr-3">{email}</label>
                                            {
                                                email_verified ?
                                                    <label className="label-text color-8CC73F font-weight-bold" style={{ fontSize: "12px" }}>Verified</label>
                                                    : <label className="label-text color-E32827 font-weight-bold" style={{ fontSize: "12px" }}>Not Verified</label>
                                            }
                                        </div>
                                        <div className="col-6">
                                            {/* <label className="label-text accent-color" onClick={() => {toggleEdit('email')}}>Change</label> */}
                                        </div>
                                    </div>
                                    {/* } */}
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-4">
                                    <label className="label-text">{t('profile_setting.mobile_phone')}</label>
                                </div>
                                <div className="col-8">
                                    <div className="row">
                                        <div className="col-12">
                                            {
                                                change_phone_number ?
                                                    <div className="row">
                                                        <div className="col-6 d-flex ">
                                                            <label className="label-text my-auto mr-3">+62</label>
                                                            <PhoneInput
                                                                country="ID"
                                                                value={phone_number}
                                                                onChange={handleChangePhoneNumber}
                                                                name="phone_number" id="txtPhoneNumber"
                                                                className="form-control mobile-input label-text"
                                                                placeholder={t('auth_form.phone_number_placholder')} required />
                                                        </div>
                                                        <div className="col-6">
                                                            <label className="label-text color-8CC73F" onClick={() => { changePhoneNumber() }}>Save</label>
                                                        </div>
                                                    </div>
                                                    :
                                                    <div className="row">
                                                        <div className="col-6">
                                                            <label className="label-text mr-3">{phone_number}</label>
                                                        </div>
                                                        <div className="col-6">
                                                            <label className="label-text accent-color" onClick={() => { toggleEdit('phone_number') }}>Change</label>
                                                        </div>
                                                    </div>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-4">
                                    <label className="label-text">{t('profile_setting.password')}</label>
                                </div>
                                <div className="col-8">
                                    {
                                        change_password ?
                                            null :
                                            <div className="row">
                                                {/* <div className="col-6">
                                                <label className="label-text">***********</label>
                                            </div> */}
                                                <div className="col-6">
                                                    <label className="label-text accent-color" onClick={() => { toggleEdit('password') }}>Change</label>
                                                </div>
                                            </div>

                                    }

                                </div>
                            </div>
                            {
                                change_password ?
                                    <div className="col-12">
                                        <div className="row my-2">
                                            <div className="col-4">
                                                <label className="label-text mobile-label color-374650" htmlFor="txtOldPassword">{t('profile_setting.old_password')}</label>
                                            </div>
                                            <div className="col-8">
                                                <OnlyInput type="password" id="txtOldPassword" name="old_password" value={old_password} onChange={(event) => { set_old_password(event.target.value) }} placeholder={t('auth_form.password_placeholder')} />
                                            </div>
                                        </div>
                                        <div className="row my-2">
                                            <div className="col-4">
                                                <label className="label-text mobile-label color-374650" htmlFor="txtNewPassword">{t('profile_setting.new_password')}</label>
                                            </div>
                                            <div className="col-8">
                                                <OnlyInput type="password" id="txtNewPassword" name="new_password" value={new_password} onChange={(event) => { set_new_password(event.target.value) }} placeholder={t('auth_form.password_placeholder')} />
                                            </div>
                                        </div>
                                        <div className="row my-2">
                                            <div className="col-4">
                                                <label className="label-text mobile-label color-374650" htmlFor="txtConfirmPassword">{t('profile_setting.confirm_password')}</label>
                                            </div>
                                            <div className="col-8">
                                                <OnlyInput type="password" id="txtConfirmPassword" name="confirm_password" value={confirm_password} onChange={setConfirmPassword} placeholder={t('auth_form.password_placeholder')} />
                                            </div>
                                        </div>
                                        <button className="label-text btn bgc-E32827 font-weight-bold text-white my-3 mr-3" onClick={() => { set_change_password(false) }}>{t('general.cancel')}</button>
                                        <button className="label-text btn bgc-8CC73F font-weight-bold text-white my-3" disabled={!password_match} onClick={handleChangePassword}>{t('general.save')}</button>
                                    </div> : null
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>

    )
}

export default withTranslation()(PersonalProfile)