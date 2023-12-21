import React, {PureComponent} from 'react';
import {Link} from "react-router-dom";
import {withTranslation} from 'react-i18next';
import Template from "../../components/Template";
import SwalToast from '../../components/helpers/SwalToast'
import axios from 'axios';
import Config from '../../components/axios/Config';
import AuthRoutePath from './AuthRoutePath';

const Style = () => {
    return(
        <style jsx="true">{`
            .container{  
                background: #FFFFFF 0% 0% no-repeat padding-box;
                box-shadow: 0px 3px 6px #00000029;
                border-radius: 14px;
                margin-bottom: 3rem;
                margin-top: 3rem;
            }
            .text{
                letter-spacing: 0px;
            }

        `}</style>
    )
}

class EmailVerification extends PureComponent {
    constructor(props){
        super(props);
        this.state = {
            success: false
        }
        this.navigateHome = this.navigateHome.bind(this)
    }

    componentDidMount(){
        this.verifyEmail()
    }

    navigateHome = () => {
        this.props.history.push('/')
    }

    verifyEmail = () => {
        const data={
            token: this.props.match.params.token,
        }
        axios.post(`${process.env.REACT_APP_BASE_API_URL}auth/verifyEmail`, data ,Config()).then(res => {
            console.log(res)
            this.setState({success: true})
            SwalToast.fire({icon:"success", title: "Verification Successful"})
        }).catch((error) => {
            this.setState({success: false})
            console.log(error)
        }).finally(()=>{
            
        })
   }
    
    
    render(){
        return(
            this.state.success ?
            <Template>
                <Style/>
                <div className="container-xsdcn container p-5">
                    <div className="ml-5 mt-3 mb-5 p-5">
                        <div className="row my-5">
                            <img src={`/images/email-verified.png`} className="w-30 h-30"/>
                        </div>
                        <div className="row p-0">
                            <label className="text color-374650 font-weight-bold w-100" style={{fontSize:'21px'}}>{this.props.t('email.email_verified')} </label>
                            <label className="text color-374650 w-100" style={{fontSize:'16px'}}>{this.props.t('email.email_verified_message')}</label>
                        </div>
                        <div className="row mb-5">
                            <Link to={AuthRoutePath.LOGIN}>
                                <button className="btn bgc-accent-color font-weight-bold my-3" style={{fontSize:"16px"}} >{this.props.t('general.start')}</button>
                            </Link>
                        </div>
                    </div>
                </div>
            </Template> :
           <p>Invalid token verification</p>
        )
    }
}

export default withTranslation()(EmailVerification)
