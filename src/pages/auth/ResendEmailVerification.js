import React, {PureComponent} from 'react';
import { Link, Redirect } from "react-router-dom";
import axios from 'axios';
import {withTranslation} from 'react-i18next';
import AuthRoutePath from './AuthRoutePath';
import Config from '../../components/axios/Config'
import ErrorDiv from '../../components/helpers/ErrorDiv'
import Template from '../../components/Template';


const Input = (props) => {
    const onChange = (e) => {
        if (props.onChange) props.onChange(e);
    }
    return (
        <>
            <label className="text mobile-label color-374650"  htmlFor={props.id} style={{fontSize:"16px"}}>{props.label}</label>
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
                .resend-image{
                    display:none;
                }
                .resendContainer{  
                    background: #FFFFFF 0% 0% no-repeat padding-box;
                    box-shadow: 0px 3px 6px #00000029;
                    height: 100vh;
                }
                .resend-form{
                    padding: 0rem;
                }
                .btn-resend{
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
                .resend-gap{
                    margin-top: 0rem;
                }
                .div-btn-resend{
                    width: 100%;
                }
                body{
                    background-color: #FFFFFF ;
                }
            }
            @media only screen and (min-width: 768px) {
                resend-image{
                    display: block;
                }
                .resend-form{
                    background: #FFFFFF 0% 0% no-repeat padding-box;
                    border-radius: 14px;
                    padding: 3rem;
                    width: 40%;
                    box-shadow: 0px 3px 6px #00000029;
                }
                .btn-resend{
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
                .resend-gap{
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
class ResendEmailVerification extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            email : '',
            success : '',
            timeLeft : 0,
            errors : [],
            submitting : false,
        }
    }

    startCount(){
       
         var interval = setInterval(() => 
         {
            this.setState({timeLeft : this.state.timeLeft -1})
            if(this.state.timeLeft === 0){
                this.setState({submitting: false})
                clearInterval(interval)
                return
            }
         }
        , 1000);

    }

    handleChange = (event) => {
        this.setState({email : event.target.value})
    }
    validate=()=>{
        let validate = true
        let errors = {};

        if(!this.state.email){
            validate = false;
            errors.wrong = "Email harus diisi"
        }

        this.setState({errors})
        return validate;
    }
    resendEmail=(e)=>{
        e.preventDefault()
        if(!this.validate()) return;

        let data={
            email: this.state.email,
        }
        
        this.setState({submitting: true})
        let url = `${process.env.REACT_APP_BASE_API_URL}auth/resendEmailVerification`
        axios.post(url,data, Config()).then(res => {
            this.setState({
                success: this.props.t('email.please_check_your_email'),
                timeLeft: 60
            })

        }).catch((error) => {
            console.log(error)
            if(error.response){
                console.log(error.response)

                let errors = {}
                errors.wrong = error.response.data.message
                this.setState({errors})

            }
            this.setState({submitting: false})

        }).finally(()=>{
            this.startCount()
        })
    }

    render(){
        return (
           <>
           <Template>
            <Style/>
                <div className="resend-form mx-auto my-5 p-5">
                    <div className="mb-5">
                        <h3 style={{ textAlign: 'center'}} className="text accent-color font-weight-bold">{this.props.t('auth_form.send_email_verification')}</h3>
                    </div>
                    <div className="resend-gap">
                        <form onSubmit={this.handleSubmit}>
                            <div className="form-group">
                                <Input type="email" id="txtEmail" name="email" onChange={this.handleChange} value={this.state.email} label={this.props.t('auth_form.email')} placeholder={this.props.t('auth_form.email_placeholder')} />
                                {this.state.errors.email && <div className="text alert alert-danger p-2 mt-2" style={{fontSize:"14px"}} role="alert">{this.state.errors.email[0]}</div>}
                            </div>
                            
                            <ErrorDiv error={this.state.errors.wrong} />
                            {this.state.success && <div className="alert alert-success p-2 mt-2" role="alert">{this.state.success}</div>}
                            <div className="row">
                                <div className="col-6 ">
                                    <button className="btn bgc-accent-color font-weight-bold btn-resend my-3" style={{fontSize:"16px"}} disabled={this.state.submitting} onClick={this.resendEmail}>{this.state.timeLeft ? this.state.timeLeft + " detik" : this.props.t('general.send')}</button>
                                </div>
                                <a className="ml-1 my-auto ml-auto mr-3">
                                    <Link to={AuthRoutePath.FORGOT_PASSWORD}><span style={{fontSize:"12px"}} className="text accent-color font-weight-bold">{this.props.t('auth_form.forgot_password')}</span></Link>
                                </a>
                            </div>
                            <div >
                                <p className="text font-weight-bold text my-auto" style={{fontSize:"12px"}} >{this.props.t('auth_form.dont_have_an_account')}
                                    <Link to={AuthRoutePath.REGISTER} className="">
                                        <span style={{fontSize:"12px"}} className="text accent-color ml-1"> {this.props.t('auth_form.register')}</span>
                                    </Link>
                                </p>
                                <p className="font-weight-bold text my-auto ml-auto" style={{fontSize:"12px"}} >{this.props.t('auth_form.already_registered')}
                                    <Link to={AuthRoutePath.LOGIN} className="">
                                        <span style={{fontSize:"12px"}} className="text accent-color ml-1"> {this.props.t('auth_form.sign_in')}</span>
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
                </Template>
            </>
        )
    }
}
export default withTranslation()(ResendEmailVerification)