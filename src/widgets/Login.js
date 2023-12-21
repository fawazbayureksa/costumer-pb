import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, OverlayTrigger, Popover } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import AuthRoutePath from '../pages/auth/AuthRoutePath';
import { withTranslation } from "react-i18next";
import Cookie from 'js-cookie';
import IsEmpty from "../components/helpers/IsEmpty";
import CustomerRoutePath from "../pages/e-commerce/customer/CustomerRoutePath";
import SwalToast from "../components/helpers/SwalToast";
import { handleLogin, handleSocialLogin, handleLogout } from "../components/AuthFunction";
import GoogleLogin from 'react-google-login';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props'
import axios from "axios";
import Config from "../components/axios/Config";

const Input = (props) => {
    const onChange = (e) => {
        if (props.onChange) props.onChange(e);
    }
    return (
        <>
            <label className="text mobile-label color-374650" htmlFor={props.id} style={{ fontSize: "16px" }}>{props.label}</label>
            <input id={props.id} type={props.type} className="border-D3D3D3 form-control mobile-input" name={props.name} onChange={onChange} value={props.value} onBlur={props.onBlur} placeholder={props.placeholder} pattern={props.pattern} required />
        </>
    )

}

/**
 * 
 * @param {object} data data for this component
 */
const Login = (props) => {
    const history = useHistory();
    const [styles, set_styles] = useState({});
    const [modal_show, set_modal_show] = useState(false);
    const [email, set_email] = useState('');
    const [password, set_password] = useState('');
    const [errors, set_errors] = useState([]);
    const [submitting, set_submitting] = useState(false);
    const [needVerificationEmail, set_need_verification_email] = useState(false);
    const [setting, set_setting] = useState('');

    const feature = useMemo(() => ({
        marketplace: JSON.parse(process.env.REACT_APP_FEATURE_MARKETPLACE)
    }), [])

    useEffect(() => {
        setStyle();
        getLoginSetting()
    }, []);

    const setStyle = () => {
        let temp_styles = {};
        if (props.data.font_weight) {
            temp_styles.fontWeight = props.data.font_weight === 'semi_bold' ? 600 : props.data.font_weight
        }
        if (props.data.color) {
            temp_styles.color = props.data.color
        }
        temp_styles.marginTop = props.data.margin_top || 0;
        temp_styles.marginBottom = props.data.margin_bottom || 0;
        temp_styles.marginRight = props.data.margin_right || 0;
        temp_styles.marginLeft = props.data.margin_left || 0;
        set_styles(temp_styles);
    }

    const open = () => {
        if (props.data.type === 'popup') set_modal_show(true);
        else history.push(AuthRoutePath.LOGIN);
    }
    const handleChangeEmail = (event) => {
        set_email(event.target.value)
    }
    const handleChangePassword = (event) => {
        set_password(event.target.value)
    }

    const facebookResponses = (response) => {
        console.log(response);
        if (response?.accessToken) socialLogin(response.accessToken, "facebook");
    }

    const googleResponses = (response) => {
        console.log(response);
        if (response?.tokenObj?.id_token) socialLogin(response.tokenObj.id_token, "google");
    }

    const getLoginSetting = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}auth/getLoginSetting`

        axios.get(url, Config({})).then(response => {
            let data = response.data.data.value;
            set_setting(JSON.parse(data));
        }).catch(error => {
            console.log(error)
            if (error.response) {
                SwalToast.fire({
                    icon: "error",
                    title: error.response.data.message
                })
            } else {
                SwalToast.fire({
                    icon: "error",
                    title: "Something went wrong",
                })
            }
        })
    }

    const login = async (event) => {
        event.preventDefault();
        if (!validate()) return;

        try {
            set_submitting(true)
            await handleLogin(email, password)
            close()
        } catch (err) {
            console.log(err)
            if (err === 403) {
                set_need_verification_email(true)
            }

            else {
                let errors = {}
                errors.wrong = [err.message]
                set_errors(errors)

                SwalToast.fire({
                    icon: 'error',
                    title: err.message,
                });
            }

        } finally {
            set_submitting(false)
        }
    }

    const socialLogin = async (id_token, social) => {
        if (!id_token) return;

        try {
            set_submitting(true)
            await handleSocialLogin(id_token, social)
            close()
        } catch (err) {
            console.log(err)

            let errors = {}
            errors.wrong = [err.message]
            set_errors(errors)

            SwalToast.fire({
                icon: 'error',
                title: err.message,
            });
        } finally {
            set_submitting(false)
        }
    }

    const logout = () => {
        handleLogout(history);
    }

    const validate = () => {
        let validate = true;
        let errors = {};
        if (!email) {
            validate = false;
            errors.email = ["Email is required"];
        }
        if (!password) {
            validate = false;
            errors.password = ["Password is required"];
        }
        set_errors(errors)
        return validate
    }



    const close = () => {
        set_modal_show(false);
    }
    const handleDegadaiLogin = () => {
        var popup = window.open(setting.url_redirect_degadai, 'Degadai', 'width=400,height=600,status=1,scrollbars=yes,popup=true')
        popup.focus();
    }
    const Style = () => {
        return (
            <style jsx="true">{`
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
                    .form-group>small{
                        display:none;
                    }           
                    .login-image{
                        display:none;
                    }
                    .loginContainer{  
                        background: #FFFFFF 0% 0% no-repeat padding-box;
                        box-shadow: 0px 3px 6px #00000029;
                        height: 100vh;
                    }
                    .login-form{
                        padding: 0rem;
                    }
                    .btn-login{
                        width: 100%;
                    }
                    .form-i-am-parent{
                        padding: 0.6rem;
                    }
                    .form-i-am{
                        display: block;
                    }
                    .form-state-2{
                        display: block;
                    }
                    .login-gap{
                        margin-top: 0rem;
                    }
                    .div-btn-login{
                        width: 100%;
                    }
                }
                @media only screen and (min-width: 768px) {
                    login-image{
                        display: block;
                    }
                    .loginContainer{  
                        background: #D3D3D3 0% 0% no-repeat padding-box;
                        box-shadow: 0px 3px 6px #00000029;
                        border-radius: 14px;
                        margin-bottom: 3rem;
                        margin-top: 3rem;
                    }
                    .login-form{
                        background: #FFFFFF 0% 0% no-repeat padding-box;
                        border-radius: 14px;
                        padding: 3rem;
                        width: 50%;
                        margin: 0.6rem 0 0.6rem 3rem;
                    }
                   
                    .btn-login{
                        width: 150px;
                    }
                    .form-i-am{
                        display: grid;
                        grid-template-columns: 1fr 3fr;
                    }
                    .form-state-2{
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 5px;
                    }
                    .login-gap{
                        margin-top: 0rem;
                    }
                }       
                .mobile-input::placeholder { 
                    color: #D3D3D3;
                    opacity: 1; 
                }
                .text{
                    letter-spacing: 0rem;
                }
            `}</style>
        )
    }

    const { t } = props;

    return (
        <>
            <Style />
            <style>{`
                .login-text {
                    font-size: ${props.data.font_size};
                }
                @media (max-width: 765.98px) {
                    .login-text {
                        font-size: 100%;
                    }
                }
            `}</style>
            {IsEmpty(Cookie.get('token')) ?
                <div className="d-flex align-items-center">
                    <p className="pointer login-text" style={styles} onClick={open}>{props.data.text}</p>
                </div> :
                <OverlayTrigger
                    trigger="click"
                    key={'bottom'}
                    placement={'bottom'}
                    rootClose
                    overlay={
                        <Popover id={`popover-positioned-${'bottom'}`}>
                            <Popover.Content>
                                <div className="px-3 py-1">
                                    {props.data.dropdowns && props.data.dropdowns.map((value, index) => {
                                        if (value.is_enabled && value.type === 'my_account') {
                                            return (
                                                <p className={`mb-0 ${index === 0 ? 'mt-0' : 'mt-2'}`} key={value.id}>
                                                    <Link to={CustomerRoutePath.ACCOUNT_SETTINGS} className="color-333333">{t('account_setting.my_account')}</Link>
                                                </p>
                                            );
                                        } else if (feature.marketplace && value.is_enabled && value.type === 'my_inbox') {
                                            return (
                                                <p className={`mb-0 ${index === 0 ? 'mt-0' : 'mt-2'}`} key={value.id}>
                                                    <Link to={CustomerRoutePath.ACCOUNT_SETTINGS_INBOX} className="color-333333">{t('account_setting.inbox')}</Link>
                                                </p>
                                            );
                                        } else if (feature.marketplace && value.is_enabled && value.type === 'my_orders') {
                                            return (
                                                <p className={`mb-0 ${index === 0 ? 'mt-0' : 'mt-2'}`} key={value.id}>
                                                    <Link to={CustomerRoutePath.ACCOUNT_SETTINGS_MY_ORDERS} className="color-333333">{t('account_setting.my_orders')}</Link>
                                                </p>
                                            );
                                        } else if (feature.marketplace && value.is_enabled && value.type === 'my_wishlist') {
                                            return (
                                                <p className={`mb-0 ${index === 0 ? 'mt-0' : 'mt-2'}`} key={value.id}>
                                                    <Link to={CustomerRoutePath.ACCOUNT_SETTINGS_WISHLIST} className="color-333333">{t('account_setting.wishlist')}</Link>
                                                </p>
                                            );
                                        } else if (feature.marketplace && value.is_enabled && value.type === 'my_vouchers') {
                                            return (
                                                <p className={`mb-0 ${index === 0 ? 'mt-0' : 'mt-2'}`} key={value.id}>
                                                    <Link to={CustomerRoutePath.ACCOUNT_SETTINGS_MY_VOUCHERS} className="color-333333">{t('account_setting.my_vouchers')}</Link>
                                                </p>
                                            );
                                        } else if (feature.marketplace && value.is_enabled && value.type === 'address') {
                                            return (
                                                <p className={`mb-0 ${index === 0 ? 'mt-0' : 'mt-2'}`} key={value.id}>
                                                    <Link to={CustomerRoutePath.ACCOUNT_SETTINGS_ADDRESS} className="color-333333">{t('account_setting.address')}</Link>
                                                </p>
                                            );
                                        }
                                    })}
                                    {(props.data.dropdowns && IsEmpty(props.data.dropdowns.find(value => value.type === 'my_account'))) &&
                                        <p className={`mb-0 mt-2`}>
                                            <Link to={CustomerRoutePath.ACCOUNT_SETTINGS} className="color-333333">{t('account_setting.my_account')}</Link>
                                        </p>}
                                    {(props.data.dropdowns && IsEmpty(props.data.dropdowns.find(value => value.type === 'my_inbox'))) &&
                                        <p className={`mb-0 mt-2`}>
                                            <Link to={CustomerRoutePath.ACCOUNT_SETTINGS_INBOX} className="color-333333">{t('account_setting.inbox')}</Link>
                                        </p>}
                                    {(props.data.dropdowns && IsEmpty(props.data.dropdowns.find(value => value.type === 'my_orders'))) &&
                                        <p className={`mb-0 mt-2`}>
                                            <Link to={CustomerRoutePath.ACCOUNT_SETTINGS_MY_ORDERS} className="color-333333">{t('account_setting.my_orders')}</Link>
                                        </p>}
                                    {(props.data.dropdowns && IsEmpty(props.data.dropdowns.find(value => value.type === 'my_wishlist'))) &&
                                        <p className={`mb-0 mt-2`}>
                                            <Link to={CustomerRoutePath.ACCOUNT_SETTINGS_WISHLIST} className="color-333333">{t('account_setting.wishlist')}</Link>
                                        </p>}
                                    {(props.data.dropdowns && IsEmpty(props.data.dropdowns.find(value => value.type === 'my_vouchers'))) &&
                                        <p className={`mb-0 mt-2`}>
                                            <Link to={CustomerRoutePath.ACCOUNT_SETTINGS_MY_VOUCHERS} className="color-333333">{t('account_setting.my_vouchers')}</Link>
                                        </p>}
                                    {(props.data.dropdowns && IsEmpty(props.data.dropdowns.find(value => value.type === 'address'))) &&
                                        <p className={`mb-0 mt-2`}>
                                            <Link to={CustomerRoutePath.ACCOUNT_SETTINGS_ADDRESS} className="color-333333">{t('account_setting.address')}</Link>
                                        </p>}
                                    <p className="mb-0 mt-2 color-333333 pointer" onClick={logout}>{t('general.logout')}</p>
                                </div>
                            </Popover.Content>
                        </Popover>
                    }
                >
                    <div className="d-flex align-items-center">
                        <p className="pointer login-text" style={styles}>Hi, {!IsEmpty(Cookie.get('user')) && JSON.parse(Cookie.get('user')).name}</p>
                    </div>
                </OverlayTrigger>}
            <Modal centered show={modal_show} onHide={close}>
                <Modal.Body className="m-3">
                    <div className="mb-5 mt-3">
                        <h3 style={{ textAlign: 'center' }} className="text accent-color font-weight-bold">{t('auth_form.sign_in_to_your_account')}</h3>
                    </div>
                    <div className="login-gap">
                        {setting && setting.login_type !== "sso_degadai" &&
                            <form onSubmit={login}>
                                <div className="form-group">
                                    <Input type="email" id="txtEmail" name="email" label={t('auth_form.email')} onChange={handleChangeEmail} placeholder={t('auth_form.email_placeholder')} />
                                    {errors.email && <div className="text alert alert-danger p-2 mt-2" style={{ fontSize: "14px" }} role="alert">{errors.email[0]}</div>}
                                </div>
                                <div className="form-group">
                                    <Input type="password" id="txtPassword" name="password" onChange={handleChangePassword} label={t('auth_form.password')} placeholder={t('auth_form.password_placeholder')} />
                                    {errors.password && <div className="text alert alert-danger p-2 mt-2" style={{ fontSize: "14px" }} role="alert">{errors.password[0]}</div>}
                                </div>
                                {errors.wrong && <div className="alert alert-danger p-2 mt-2 text-center text" role="alert" style={{ fontSize: "14px" }}>{errors.wrong}</div>}
                                {needVerificationEmail && <div className="alert alert-danger p-2 mt-2 text-center text" style={{ fontSize: "14px" }} role="alert">
                                    {t('auth_form.need_to_resend_verification_code')} <Link to={AuthRoutePath.RESEND_EMAIL_VERIFICATION}>{t('auth_form.click_here')}</Link>
                                </div>}
                                <div className="row">
                                    <div className="col-4 ">
                                        <button className="btn bgc-accent-color font-weight-bold  btn-login my-3" disabled={submitting} style={{ fontSize: "16px" }} >{t('auth_form.sign_in')}</button>
                                    </div>

                                    <a className="ml-1 my-auto ml-auto mr-3">
                                        <Link to={AuthRoutePath.FORGOT_PASSWORD}><span style={{ fontSize: "12px" }} className="text accent-color font-weight-bold">{t('auth_form.forgot_password')}</span></Link>
                                    </a>
                                </div>
                                <div className="row">
                                    <p className="text font-weight-bold text my-auto ml-3" style={{ fontSize: "12px" }} >{t('auth_form.dont_have_an_account')}
                                        <Link to={AuthRoutePath.REGISTER} className="">
                                            <span style={{ fontSize: "12px" }} className="text accent-color ml-1"> {t('auth_form.register')}</span>
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        }
                        {setting && setting.login_type !== "sso_degadai" &&
                            <div className="row mt-2">
                                <div className="col-6">
                                    <GoogleLogin
                                        clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
                                        // buttonText="Login"
                                        onSuccess={googleResponses}
                                        onFailure={googleResponses}
                                        render={renderProps => (
                                            <button style={{ whiteSpace: 'pre' }}
                                                className="btn bgc-google-color font-weight-bold text-white w-100"
                                                onClick={renderProps.onClick}
                                                disabled={submitting}
                                            >Sign In With Google</button>
                                        )}
                                    />
                                </div>
                                <div className="col-6">
                                    <FacebookLogin
                                        appId={process.env.REACT_APP_FACEBOOK_APP_ID}
                                        textButton="Sign In With Facebook"
                                        // autoLoad={false}
                                        fields="name,email"
                                        // onClick={responseFacebook}
                                        callback={facebookResponses}
                                        scope="email"
                                        render={renderProps => (
                                            <button style={{ whiteSpace: 'pre' }}
                                                className="btn bgc-facebook-color font-weight-bold text-white w-100"
                                                onClick={renderProps.onClick}
                                                disabled={submitting}
                                            >Sign In With Facebook</button>
                                        )}
                                    />
                                </div>
                            </div>
                        }
                        {setting && setting.login_type === "sso_degadai" &&
                            <div className="row justify-content-center mt-3">
                                <button className="btn bgc-C6B27B font-weight-semi-bold text-white" onClick={handleDegadaiLogin}>Login With Degadai</button>
                            </div>
                        }
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default withTranslation()(Login)