import React, { PureComponent } from "react";
import { Link, Redirect } from "react-router-dom";
import axios from "axios";
import Config from "../../components/axios/Config";
import Template from "../../components/Template";
import SwalToast from "../../components/helpers/SwalToast";
import { TinyMceContent } from "../../components/helpers/TinyMceEditor";
import Modal from '../../components/helpers/Modal';
import { isPossiblePhoneNumber } from "react-phone-number-input";
import PhoneInput from 'react-phone-number-input/input';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css"
import { withTranslation } from "react-i18next";
import AuthRoutePath from "./AuthRoutePath";
import Cookie from 'js-cookie';

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
                .register-image{
                    display:none;
                }
                .registerContainer{  
                    background: #FFFFFF 0% 0% no-repeat padding-box;
                    box-shadow: 0px 3px 6px #00000029;
                    height: 100vh;
                }
                .register-form{
                    padding: 0rem;
                }
                .btn-register{
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
                .register-gap{
                    margin-top: 0rem;
                }
                .div-btn-register{
                    width: 100%;
                }
                body{
                    background-color: #FFFFFF ;
                }
            }
            @media only screen and (min-width: 768px) {
                register-image{
                    display: block;
                }
                .registerContainer{  
                    background: #D3D3D3 0% 0% no-repeat padding-box;
                    box-shadow: 0px 3px 6px #00000029;
                    border-radius: 14px;
                    margin-bottom: 3rem;
                    margin-top: 3rem;
                }
                .register-form{
                    background: #FFFFFF 0% 0% no-repeat padding-box;
                    border-radius: 14px;
                    padding: 3rem;
                    width: 50%;
                    margin: 0.6rem 0 0.6rem 3rem;
                }
                
                .btn-register{
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
                .register-gap{
                    margin-top: 0rem;
                }
            }           
            .react-datepicker-wrapper{
                width: 100%;
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

class Register extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            email: '',
            date_of_birth: '',
            phone_number: '',
            password: '',
            confirm_password: '',
            errors: [],
            submitting: false,
            terms_and_conditions: "",
            marketplace: "",
        }
    }

    handleChange = (event) => {
        var name = event.target.name;
        var value = event.target.value;
        this.setState({ [name]: value })
    };
    handleDateOfBirth = (selected) => {
        this.setState({ date_of_birth: selected })
    }
    componentDidMount() {
        this.getMasterDataRegister()
    }

    getMasterDataRegister = () => {
        axios.get(`${process.env.REACT_APP_BASE_API_URL}auth/getMasterDataRegister`, Config()).then(res => {
            this.setState({
                marketplace: res.data.data.company_name,
                terms_and_conditions: res.data.data.terms_and_conditions,
            })
        }).catch((error) => {
            console.log(error)
            SwalToast.fire({ icon: 'error', title: 'Whoops, Something went wrong!' })
        })
    }


    handlePhoneNumberChange = (value) => {
        this.setState({
            phone_number: value
        });
        if (value && !isPossiblePhoneNumber(value)) {
            this.setState({
                errors: { 'phone_number': ['Plese use a valid phone number'] }
            });
        } else {
            this.setState({
                errors: []
            });
        }
    };

    validate = () => {
        let validate = true;
        let errors = {};
        if (!this.state.name) {
            validate = false;
            errors.name = ["Name is required"];
        }
        if (!this.state.email) {
            validate = false;
            errors.email = ["Email is required"];
        }
        if (!this.state.phone_number) {
            validate = false;
            errors.phone_number = ["Phone Number is required"];
        }
        if (!this.state.password) {
            validate = false;
            errors.password = ["Password is required"];
        }
        if (!this.state.confirm_password) {
            validate = false;
            errors.confirm_password = ["Confirm Password is required"];
        }
        if (this.state.password && this.state.confirm_password && this.state.password !== this.state.confirm_password) {
            validate = false;
            errors.confirm_password = ["Passwords do not match"];
        }
        this.setState({ errors })
        return validate
    }

    handleSubmit = event => {
        event.preventDefault();
        if (!this.validate()) return;
        else {
            var data = {
                name: this.state.name,
                email: this.state.email,
                date_of_birth: this.state.date_of_birth,
                phone_number: this.state.phone_number,
                password: this.state.password,
            };

            this.setState({ submitting: true })
            axios.post(`${process.env.REACT_APP_BASE_API_URL}auth/register`, data, Config()).then(res => {
                console.log(res)
                this.props.history.push({
                    pathname: "/email-sent/",
                    state: { email: this.state.email, marketplace: this.state.marketplace }
                });
                SwalToast.fire({
                    icon: 'success',
                    title: 'Register Successfully, Check Your Email For Verification!'
                });
            }).catch((error) => {
                console.log(error)
                if (error.response && error.response.data.message) {
                    SwalToast.fire({ icon: 'error', title: error.response.data.message })
                }
                this.setState({
                    errors: error.response.data.message,
                });
            }).finally(() => {
                this.setState({ submitting: false })
            })
        }

    };
    render() {
        return (
            Cookie.get('token') == null ?
                <Template>
                    <Style />
                    <div className="container-xsdcn registerContainer p-5">
                        <div className="register-form ">
                            <div className="mb-5">
                                <h3 style={{ textAlign: 'center' }} className="text accent-color font-weight-bold">{this.props.t('auth_form.register_on')} {this.state.marketplace}</h3>
                            </div>
                            <div className="register-gap">
                                <form onSubmit={this.handleSubmit}>
                                    <div className="form-group">
                                        <Input type="text" id="txtName" name="name" onChange={this.handleChange} value={this.state.name} label={this.props.t('auth_form.name')} placeholder={this.props.t('auth_form.name_placeholder')} />
                                        {this.state.errors.name && <div className="alert alert-danger p-2 mt-2" role="alert">{this.state.errors.name[0]}</div>}
                                    </div>
                                    <div className="form-group">
                                        <Input type="email" id="txtEmail" name="email" onChange={this.handleChange} value={this.state.email} label={this.props.t('auth_form.email')} placeholder={this.props.t('auth_form.email_placeholder')} />
                                        {this.state.errors.email && <div className="alert alert-danger p-2 mt-2" style={{ fontSize: "14px" }} role="alert">{this.state.errors.email[0]}</div>}
                                    </div>

                                    <div className="form-group">
                                        <label className="text mobile-label color-374650" style={{ fontSize: "16px" }} htmlFor="date_of_birth">{this.props.t('auth_form.date_of_birth')} (yyyy/MM/dd)</label>
                                        <DatePicker selected={this.state.date_of_birth} name="date_of_birth" id="date_of_birth" onChange={this.handleDateOfBirth}
                                            autoComplete="off" className="form-control mobile-input" dateFormat="yyyy/MM/dd" placeholderText={this.props.t('auth_form.date_of_birth_placeholder')}
                                            showMonthDropdown showYearDropdown dropdownMode="select" />
                                        {this.state.errors.date_of_birth && <div className="alert alert-danger mt-2 p-2" role="alert">{this.state.errors.date_of_birth[0]}</div>}
                                    </div>

                                    <div className="form-group">
                                        {/* <Input type="tel" id="txtPhoneNumber" name="phone_number" onChange={this.handleChange} value={this.state.phone_number} label="Phone Number" pattern="^[+]{0,1}[-\s\./0-9]+$" /> */}
                                        <label className="text mobile-label color-374650" style={{ fontSize: "16px" }} htmlFor={"txtPhoneNumber"}>{this.props.t('auth_form.phone_number')}</label>
                                        <div className="d-flex">
                                            <div className="text my-auto mr-1 color-374650" style={{ fontSize: "16px" }}>+62</div>
                                            <PhoneInput
                                                country="ID"
                                                value={this.state.phone_number}
                                                onChange={this.handlePhoneNumberChange}
                                                name="phone_number" id="txtPhoneNumber"
                                                className="form-control mobile-input"
                                                placeholder={this.props.t('auth_form.phone_number_placholder')} required />
                                        </div>
                                        {this.state.errors.phone_number && <div className="alert alert-danger p-2 mt-2" style={{ fontSize: "14px" }} role="alert">{this.state.errors.phone_number[0]}</div>}
                                    </div>
                                    <div className="form-group">
                                        <Input type="password" id="txtPassword" name="password" onChange={this.handleChange} value={this.state.password} label={this.props.t('auth_form.password')} placeholder={this.props.t('auth_form.password_placeholder')} />
                                        {this.state.errors.password && <div className="alert alert-danger p-2 mt-2" style={{ fontSize: "14px" }} role="alert">{this.state.errors.password[0]}</div>}
                                    </div>

                                    <div className="form-group">
                                        <Input type="password" id="txtConfirmPassword" name="confirm_password" onChange={this.handleChange} value={this.state.confirm_password} label={this.props.t('auth_form.confirm_password')} placeholder={this.props.t('auth_form.password_placeholder')} />
                                        {this.state.errors.confirm_password && <div className="alert alert-danger p-2 mt-2" style={{ fontSize: "14px" }} role="alert">{this.state.errors.confirm_password[0]}</div>}
                                    </div>
                                    <div className="row">
                                        <div className="col-12">
                                            <label className="text mb-0" style={{ fontSize: '16px' }}>{this.props.t('auth_form.terms_message_opening')} <b>{this.props.t('auth_form.register')}</b>{this.props.t('auth_form.terms_message_closing')}</label>
                                        </div>
                                        <div className="col">
                                            <label className="text mt-0" style={{ fontSize: '16px' }}><a className="accent-color" href="javascript:void(0)" data-toggle="modal" data-target="#modal-terms_and_conditions" data-dismiss="modal">{this.props.t('auth_form.terms_and_conditions')}</a></label>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-6 ">
                                            <button className="btn bgc-accent-color font-weight-bold btn-register my-3" style={{ fontSize: "16px" }} disabled={this.state.submitting} onClick={this.Register}>{this.props.t('auth_form.register')}</button>
                                        </div>
                                        <p className="font-weight-bold text my-auto ml-auto mr-3" style={{ fontSize: "12px" }} >{this.props.t('auth_form.already_registered')}
                                            <Link to={AuthRoutePath.LOGIN} className="">
                                                <span style={{ fontSize: "12px" }} className="text accent-color ml-1"> {this.props.t('auth_form.sign_in')}</span>
                                            </Link>
                                        </p>
                                    </div>

                                </form>
                            </div>
                        </div>
                        <Modal modalId="modal-terms_and_conditions" maxWidth={800}>
                            <style>{`
                        .modal-terms_and_conditions-div::-webkit-scrollbar {
                            width: 4px;
                        }
                        .modal-terms_and_conditions-div::-webkit-scrollbar-thumb {
                            background-color: #0F74BD;
                            border-radius: 4px;
                        }
                        `}</style>
                            <div className="overflow-auto p-3 modal-terms_and_conditions-div" style={{ maxHeight: '80vh' }}>
                                <TinyMceContent>
                                    {this.state.terms_and_conditions}
                                </TinyMceContent>
                            </div>
                        </Modal>
                    </div>
                </Template> :
                <Redirect to={'/'} />
        )
    }
}

export default withTranslation()(Register)