import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Header from './template/Header';
import Footer from './template/Footer';
import Cookie from 'js-cookie'
import Config, { ErrorHandler } from './axios/Config';
import axios from 'axios'
import MyContext from './MyContext';
import GlobalStyle from '../styles/GlobalStyle';
import { Helmet } from "react-helmet";
import update from 'immutability-helper'
import FloatingWidgetChat from '../widgets/floatingChat/FloatingWidgetChat';
import EcommerceRoutePath from '../pages/e-commerce/EcommerceRoutePath';
import Script from '../widgets/Script';

class Template extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            context_data: {
                theme_settings: null,
                companyName: '',
                separateWebApp: null,
                changeMetaTitleAndDesc: this.changeMetaTitleAndDesc,

                ticket_is_being_process: 0,
                sticky_top_px: 0,
            },
            favicon: '',
            gtagID: '',

            page_title: '',
            page_desc: '',
            page_color: '#000000'
        }
    }
    componentDidMount() {
        this.refreshToken()
        this.getPrimaryLanguage()
        this.getTemplateMasterData()
        this.getTicketIsBeingProcessCount();
        console.log("console href", window.location.pathname);
    }
    refreshToken = () => {
        if (!Cookie.get("token")) return;

        let expire_date = localStorage.getItem("expire_date")
        if (new Date() < new Date(expire_date)) return

        let url = `${process.env.REACT_APP_BASE_API_URL}auth/refresh`

        axios.get(url, Config({
            Authorization: 'Bearer ' + Cookie.get('token'),
        })).then(res => {
            Cookie.set('token', res.data.data.access_token);
            let now = new Date()
            now.setDate(now.getDate() + parseInt(process.env.REACT_APP_TOKEN_EXPIRE_DAYS))
            localStorage.setItem("expire_date", now)
        }).catch((error) => {
            ErrorHandler(error)
            console.log(error)
            if (error.response) {
                console.log(error.response)
            }
        })
    }
    getPrimaryLanguage = () => {
        if (Cookie.get("language_code")) return;

        let url = `${process.env.REACT_APP_BASE_API_URL}template/getPrimaryLanguage`
        let params = {
        }
        axios.get(url, Config({}, params)).then(res => {
            Cookie.set("language_code", res.data.data.language_code)
        }).catch((error) => {
            console.log(error)
            if (error.response) console.log(error.response)
        })
    }
    getThemeSettings = (theme_settings_from_database) => {
        let data = {}
        for (let i = 0; i < theme_settings_from_database.length; i++) {
            let theme_setting = theme_settings_from_database[i]
            data[theme_setting.key] = JSON.parse(theme_setting.value)
        }
        return data
    }
    getTemplateMasterData = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}template/getTemplateMasterData`

        axios.get(url, Config({})).then(response => {
            let theme_settings = this.getThemeSettings(response.data.data.theme_settings)
            let companyName = response.data.data.companyName

            this.setState({
                context_data: update(this.state.context_data, {
                    theme_settings: { $set: theme_settings },
                    companyName: { $set: companyName },
                    logo: { $set: response.data.data.logo },
                    separateWebApp: { $set: response.data.data.separateWebApp }
                }),
                favicon: response.data.data.favicon,
                gtagID: response.data.data.gtagID,
                // page_title: this.state.page_title || companyName,
                // page_desc: this.state.page_desc || `Create an account or login to ${companyName}. Find and purchase your desired products.`,
                page_color: theme_settings.accent_color.value,
            })
        }).catch((error) => {
            console.log(error)
            if (error.response) console.log(error.response)
        })
    }
    getTicketIsBeingProcessCount = () => {
        if (!Cookie.get('token')) return;
        if (!JSON.parse(process.env.REACT_APP_FEATURE_MARKETPLACE)) return;

        let url = `${process.env.REACT_APP_BASE_API_URL}drs/ticket/process/count`

        axios.get(url, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        })).then(response => {
            this.setState({
                context_data: update(this.state.context_data, {
                    ticket_is_being_process: { $set: response.data.data }
                })
            });
        }).catch(error => {
            console.log(error)
            if (error.response) {
                // console.log(error.response)
            }
        });
    }
    setStickyTop = (sticky_top_px) => {
        this.setState({
            context_data: update(this.state.context_data, {
                sticky_top_px: { $set: sticky_top_px }
            })
        });
    }
    changeMetaTitleAndDesc = (page_title, page_desc) => {
        this.setState({
            page_title: page_title,
            page_desc: page_desc,
        })
    }

    googleAnalyticsData = () => {
        return {
            value: `
            <!-- Google tag (gtag.js) -->
            <script async src="https://www.googletagmanager.com/gtag/js?id=${this.state.gtagID}"></script>
            <script>
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('config', '${this.state.gtagID}');
            </script>
            `
        }
    }

    render() {
        return (<>
            {Cookie.get("language_code") ? <MyContext.Provider value={this.state.context_data}>
                <Helmet>
                    <title>{this.state.page_title}</title>
                    <meta name="description" content={this.state.page_desc} />
                    <meta name="theme-color" content={this.state.page_color} />
                    <link rel="icon" href={this.state.favicon} />
                    <link rel="apple-touch-icon" href={this.state.favicon} />
                </Helmet>

                {this.state.gtagID && <Script data={this.googleAnalyticsData()} />}

                {this.state.context_data.theme_settings && <GlobalStyle themes={this.state.context_data.theme_settings} />}

                <div className="responsive-mode">
                    <Header setStickyTop={this.setStickyTop} />
                    {this.props.children}
                    <Footer />
                </div>
                {
                    ((window.location.pathname === EcommerceRoutePath.CHAT) || (!Cookie.get("token"))) ?
                        <>

                        </> :
                        <>
                            <FloatingWidgetChat />
                        </>
                }
            </MyContext.Provider > : <></>}
        </>)
    }
}

Template.propTypes = {
    isLoading: PropTypes.bool
};
Template.defaultProps = {
    isLoading: false
}

export default Template;