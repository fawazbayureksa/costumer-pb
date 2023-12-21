import React, {PureComponent} from 'react';
import {Redirect} from "react-router-dom";
import {withTranslation} from 'react-i18next';
import Template from "../../components/Template";
import AuthRoutePath from './AuthRoutePath';
import Cookie from 'js-cookie'

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
                letter-spacing: 0rem;
            }

        `}</style>
    )
}
class EmailVerificationSent extends PureComponent {
    constructor(props){
        super(props);
        this.navigateHome = this.navigateHome.bind(this)
    }

    componentDidMount(){
        console.log(this.props.location)
    }

    navigateHome = () => {
        this.props.history.push('/')
    }

    render(){
        return(
            !Cookie.get('token') && this.props.location.state != null ?
                <Template>
                    <Style/>
                    <div className="container-xsdcn container p-5">
                        <div className="ml-5 mt-3 mb-5 p-5">
                            <div className="row my-5">
                                <img src={`/images/email-sent.png`} className="w-30 h-30"/>
                            </div>
                            <div className="row p-0">
                                <label className="text color-374650 font-weight-bold w-100" style={{fontSize:'21px'}}>{this.props.t('email.email_sent')} {this.props.location.state.email}</label>
                                <label className="text color-374650 w-100" style={{fontSize:'16px'}}>{this.props.t('email.email_sent_message')} {this.props.location.state.marketplace}</label>
                            </div>
                            <div className="row mb-5">
                                <button className="btn bgc-accent-color font-weight-bold my-3" style={{fontSize:"16px"}} onClick={this.navigateHome}>{this.props.t('general.back_to_home')}</button>
                            </div>
                        </div>
                        
                    </div>
                </Template>
            : <Redirect to={AuthRoutePath.LOGIN}/>
        ) 
    }
}

export default withTranslation()(EmailVerificationSent)
