import React, { PureComponent } from 'react';
import { Link, Redirect } from "react-router-dom";
import Cookie from 'js-cookie';
import Template from "../../components/Template";
import AuthRoutePath from './AuthRoutePath';
import SwalToast from '../../components/helpers/SwalToast';
import { withTranslation } from "react-i18next";
import GoogleLogin from 'react-google-login';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import { handleLogin, handleSocialLogin } from "../../components/AuthFunction";
import axios from 'axios';
import Config from '../../components/axios/Config';

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
                #txtName{
                    margin-bottom: 1rem;
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
                    height: 120vh;
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
                body{
                    background-color: #FFFFFF ;
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
class Login extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            errors: [],
            submitting: false,
            setting: '',
            token: null,
            needVerificationEmail: false,
        }

    }
    componentDidMount = () => {
        this.getLoginSetting()
        let params = new URLSearchParams(window.location.search);
        if (params.get('ssoToken') && params.get('ssoStatus') === "success" ){
            this.socialLogin(params.get('ssoToken'), "degadai")
        }
    }

    handleChange = (event) => {
        var name = event.target.name;
        var value = event.target.value;
        this.setState({ [name]: value })
    };

    login = async (event) => {
        event.preventDefault();
        if (!this.validate()) return;

        try {
            this.setState({ submitting: true })
            await handleLogin(this.state.email, this.state.password)
        } catch (err) {
            console.log(err)
            if (err === 403) {
                this.setState({
                    needVerificationEmail: true
                })
            }

            else {
                let errors = {}
                errors.wrong = [err.message]
                this.setState({
                    errors
                })

                SwalToast.fire({
                    icon: 'error',
                    title: err.message,
                });
            }

        } finally {
            this.setState({ submitting: false })
        }
    }

    validate = () => {
        let validate = true;
        let errors = {};
        if (!this.state.email) {
            validate = false;
            errors.email = ["Email is required"];
        }
        if (!this.state.password) {
            validate = false;
            errors.password = ["Password is required"];
        }
        this.setState({ errors })
        return validate
    }

    facebookResponses = (response) => {
        console.log(response);
        if (response?.accessToken) this.socialLogin(response.accessToken, "facebook");
    }

    googleResponses = (response) => {
        console.log(response);
        if (response?.tokenObj?.id_token) this.socialLogin(response.tokenObj.id_token, "google");
    }

    socialLogin = async (id_token, social) => {
        if (!id_token) return;

        try {
            this.setState({
                submitting: true
            })
            await handleSocialLogin(id_token, social)
        } catch (err) {
            console.log(err)

            let errors = {}
            errors.wrong = [err.message]
            this.setState({
                errors
            })

            SwalToast.fire({
                icon: 'error',
                title: err.message,
            });
        } finally {
            this.setState({
                submitting: false
            })
        }
    }

    getLoginSetting = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}auth/getLoginSetting`

        axios.get(url, Config({})).then(response => {
            let data = response.data.data.value;
            this.setState({
                setting: JSON.parse(data)
            })
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

    getUrlParams = () => {
        let params = new URLSearchParams(window.location.search);
        return {
            sso_token: params.get('ssoToken') || '',
        };
    }

    // loginDegadai = () => {
    //     let url = `${process.env.REACT_APP_BASE_API_URL}auth/sso-validate`

    //     let params = this.getUrlParams();

    //     let body = {
    //         sso_token: params?.sso_token
    //     }
    //     // console.log(body)
    //     // return
    //     axios.get(url, body, Config({})).then(response => {
    //         let data = response.data.data;
    //         console.log(data);
    //     }).catch(error => {
    //         console.log(error)
    //         if (error.response) {
    //             SwalToast.fire({
    //                 icon: "error",
    //                 title: error.response.data.message
    //             })
    //         } else {
    //             SwalToast.fire({
    //                 icon: "error",
    //                 title: "Something went wrong",
    //             })
    //         }
    //     })
    // }

    handleLoginDegadai = () => {
        var popup = window.open(this.state.setting.url_redirect_degadai, 'Degadai', 'width=400,height=600,status=1,scrollbars=yes,popup=true')
        popup.focus();
    }


    render() {
        const { t } = this.props;
        return (
            Cookie.get('token') == null ?
                <Template>
                    <Style />
                    <div className="container-xsdcn loginContainer p-5">
                        <div className="login-form">
                            <div className="mb-5">
                                <h3 style={{ textAlign: 'center' }} className="text accent-color font-weight-bold">{t('auth_form.sign_in_to_your_account')}</h3>
                            </div>
                            <div className="login-gap">
                                {this.state.setting && this.state.setting.login_type !== "sso_degadai" &&
                                    <form onSubmit={this.handleSubmit}>
                                        <div className="form-group">
                                            <Input type="email" id="txtEmail" name="email" onChange={this.handleChange} value={this.state.email} label={t('auth_form.email')} placeholder={t('auth_form.email_placeholder')} />
                                            {this.state.errors.email && <div className="text alert alert-danger p-2 mt-2" style={{ fontSize: "14px" }} role="alert">{this.state.errors.email[0]}</div>}
                                        </div>
                                        <div className="form-group">
                                            <Input type="password" id="txtPassword" name="password" onChange={this.handleChange} value={this.state.password} label={t('auth_form.password')} placeholder={t('auth_form.password_placeholder')} />
                                            {this.state.errors.password && <div className="text alert alert-danger p-2 mt-2" style={{ fontSize: "14px" }} role="alert">{this.state.errors.password[0]}</div>}
                                        </div>
                                        {this.state.errors.wrong && <div className="alert alert-danger p-2 mt-2 text-center text" style={{ fontSize: "14px" }} role="alert">{this.state.errors.wrong}</div>}
                                        {this.state.needVerificationEmail && <div className="alert alert-danger p-2 mt-2 text-center text" style={{ fontSize: "14px" }} role="alert">
                                            {t('auth_form.need_to_resend_verification_code')} <Link to={AuthRoutePath.RESEND_EMAIL_VERIFICATION}>{t('auth_form.click_here')}</Link>
                                        </div>}
                                        <>
                                            <div className="row">
                                                <div className="col-6 ">
                                                    <button className="btn bgc-accent-color font-weight-bold btn-login my-3" style={{ fontSize: "16px" }} disabled={this.state.submitting} onClick={this.login}>{t('auth_form.sign_in')}</button>
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
                                        </>
                                    </form>
                                }

                                {this.state.setting && this.state.setting.login_type !== "sso_degadai" &&
                                    <div className="row mt-2">
                                        <div className="col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6">
                                            <GoogleLogin
                                                clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
                                                // buttonText="Login"
                                                onSuccess={this.googleResponses}
                                                onFailure={this.googleResponses}
                                                render={renderProps => (
                                                    <button style={{ whiteSpace: 'pre' }}
                                                        className="btn bgc-google-color font-weight-bold text-white w-100"
                                                        onClick={renderProps.onClick}
                                                        disabled={this.state.submitting}
                                                    >Sign In With Google</button>
                                                )}
                                            />
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6 mt-2 mt-sm-2 mt-md-2 mt-lg-0 mt-xl-0">
                                            <FacebookLogin
                                                appId={process.env.REACT_APP_FACEBOOK_APP_ID}
                                                textButton="Sign In With Facebook"
                                                // autoLoad={false}
                                                fields="name,email,picture,birthday"
                                                // onClick={responseFacebook}
                                                callback={this.facebookResponses}
                                                scope="email"
                                                render={renderProps => (
                                                    <button style={{ whiteSpace: 'pre' }}
                                                        className="btn bgc-facebook-color font-weight-bold text-white w-100"
                                                        onClick={renderProps.onClick}
                                                        disabled={this.state.submitting}
                                                    >Sign In With Facebook</button>
                                                )}
                                            />
                                        </div>
                                    </div>
                                }
                            </div>
                            {this.state.setting && this.state.setting.login_type === "sso_degadai" &&
                                <div className="row justify-content-center">
                                    <button className="btn bgc-C6B27B font-weight-semi-bold text-white" onClick={this.handleLoginDegadai}>Masuk dengan akun deGadai</button>
                                </div>
                            }
                        </div>
                    </div>
                </Template> :
                <Redirect to={'/'} />
        );
    }
}

export default withTranslation()(Login);
