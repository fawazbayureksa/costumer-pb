import axios from 'axios';
import Cookies from 'js-cookie';
import Cookie from 'js-cookie';
import React, { PureComponent } from 'react';
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from "react-i18next";
import { useLocation, useParams } from 'react-router-dom';
import Config from '../../../../../components/axios/Config';
import CurrencyFormat from '../../../../../components/helpers/CurrencyFormat';
import ManualSwitchLanguage from '../../../../../components/helpers/ManualSwitchLanguage';
import GlobalStyle from '../../../../../styles/GlobalStyle';
import { isLogin } from '../../../../general/forum/components/IsLogin'

const WebinarInvoice = () => {

    const [dataTicketDetail, setDataTicketDetail] = useState(null);
    const [invoice, setInvoice] = useState()
    const [speaker, setSpeaker] = useState([])
    const [themeSetting, setThemeSetting] = useState()
    const [favicon, setFavicon] = useState()
    const [logo, setLogo] = useState()
    const [companyName, setCompanyName] = useState()
    const params = useParams()
    const location = useLocation();

    useEffect(() => {
        getTemplateMasterData()
    }, [])

    useEffect(() => {
        if (isLogin()) {
            detailTicketModal();
        } else {
            detailWithToken()
        }
    }, [])


    const detailTicketModal = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}webinar/my-orders/get-detail`

        let body = {
            transaction_code: params.invoice
        }

        axios.get(url, Config({ Authorization: 'Bearer ' + Cookies.get('token') }, body)).then(res => {
            // console.log(invoice);
            console.log(res.data.data);
            setDataTicketDetail(res.data.data);
            setSpeaker(getSpeaker(res.data.data?.webinar_event?.speakers))
        }).catch(error => {
            console.error('error ticket Detail: ', error);
        }).finally()

    }

    const detailWithToken = () => {

        let param = new URLSearchParams(location.search);

        let url = `${process.env.REACT_APP_BASE_API_URL}webinar/my-orders/get-detail-with-token?token=${param.get('token')}`;

        let axiosInstance = axios.get(url, Config())

        axiosInstance.then(res => {
            setDataTicketDetail(res.data.data);
            setSpeaker(getSpeaker(res.data.data?.webinar_event?.speakers))
        }).catch(error => {
            console.error('error ticket Detail: ', error);
        }).finally()
    }


    const getThemeSettings = (theme_settings_from_database) => {
        let data = {}
        for (let i = 0; i < theme_settings_from_database.length; i++) {
            let theme_setting = theme_settings_from_database[i]
            data[theme_setting.key] = JSON.parse(theme_setting.value)
        }
        return data
    }
    const getTemplateMasterData = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}template/getTemplateMasterData`

        axios.get(url, Config({})).then(response => {
            let theme_settings = getThemeSettings(response.data.data.theme_settings)
            setThemeSetting(theme_settings)
            setFavicon(response.data.data.favicon)
            setLogo(response.data.data.logo)
            setCompanyName(response.data.data.companyName)
            // console.log(response.data.data)
        }).catch((error) => {
            console.log(error)
            if (error.response) console.log(error.response)
        })
    }

    const getSpeaker = (speaker) => {
        let data = []
        speaker.map((item) => {
            data.push(item.speaker.name)
        })
        return data
    }


    const { t } = useTranslation()

    return (
        <>
            {(favicon && dataTicketDetail) &&
                <Helmet>
                    <title>{companyName} - {dataTicketDetail?.transaction_code}</title>
                    <link rel="icon" href={favicon} />
                    <link rel="apple-touch-icon" href={favicon} />
                </Helmet>
            }
            {themeSetting && <GlobalStyle themes={themeSetting} />}
            <style>{`
            .invoice-container {
                margin: 20px 160px;
            }
            @media print { 
                .print  { display: none;}
            }
        `}</style>
            {dataTicketDetail &&
                <div className="invoice-container">
                    <div className="text-right print">
                        <button className="btn bgc-accent-color  font-weight-bold" onClick={() => window.print()}>Print</button>
                    </div>
                    <div className="row mt-5">
                        <div className="col-6">
                            <img src={logo} style={{ height: 60 }} />
                        </div>
                        <div className="col-6 text-right">
                            <h6>Invoice</h6>
                            <div>{t("invoice.number")}: <label className="font-weight-bold">{dataTicketDetail?.transaction_code}</label></div>
                            {/* <div>Tanggal Terbit: </div>
                <div>Berlaku Sampai: </div> */}
                        </div>
                    </div>
                    <hr />
                    <div className="row">
                        <div className="col-6">
                            <div className='font-weight-bold'> {t("invoice.published_to")}:</div>
                            <div>{dataTicketDetail?.mp_customer?.name}</div>
                            <div>{dataTicketDetail?.mp_customer?.phone_number}</div>
                            <div className="mt-4">
                                <div className='font-weight-bold'>{t("invoice.payment_method")}:</div>
                                <div>{dataTicketDetail?.mp_payment?.last_status?.payment_type.replace(/_/g, ' ').toLowerCase().replace(/\b[a-z]/g, letter => letter.toUpperCase())}</div>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className='font-weight-bold'>{t("invoice.published_from")}:</div>
                            <div>
                                {speaker.map((i) => (
                                    i + ' , '
                                ))}
                            </div>
                            <div className='font-weight-bold'>Alamat</div>
                            <div>{dataTicketDetail.webinar_event.venue}</div>
                        </div>
                    </div>
                    <table className="w-100 mt-4">
                        <tr className="bgc-accent-color justify-content-between font-weight-bold">
                            <td className="p-2">{t("invoice.event_name")}</td>
                            <td className="p-2">{t("invoice.quantity")}</td>
                            <td className="p-2">{t("invoice.price")}</td>
                            <td className="text-right p-2">{t("invoice.subtotal")}</td>
                        </tr>
                        <tr>
                            <td className='p-2'>{dataTicketDetail.webinar_event.title}</td>
                            <td className="p-2">{dataTicketDetail.total_ticket}</td>
                            <td className="p-2">Rp {CurrencyFormat(dataTicketDetail.price)}</td>
                            <td className="p-2 text-right">Rp {CurrencyFormat(dataTicketDetail.total_payment)}</td>
                        </tr>
                        <tr className="">
                            <td className="p-2"></td>
                            <td className="p-2"></td>
                            <td className="p-2">{t("invoice.subtotal")}</td>
                            <td className="text-right font-weight-bold p-2">Rp {CurrencyFormat(dataTicketDetail.total_payment.toString())}</td>
                        </tr>
                        {/* <tr className="">
                            <td className="p-2"></td>
                            <td className="p-2"></td>
                            <td className="p-2">{t("invoice.discount")}</td>
                            <td className="text-right font-weight-bold p-2"> */}
                        {/* - Rp{CurrencyFormat(this.state.data.discount.toString())} */}
                        {/* </td> */}
                        {/* </tr> */}
                        <tr className="bgc-accent-color">
                            <td className="bg-white" colSpan="2"></td>
                            <td className="p-2">{t("invoice.grand_total")}</td>
                            <td className="text-right font-weight-bold p-2">
                                Rp {CurrencyFormat(dataTicketDetail.total_payment.toString())}
                            </td>
                        </tr>
                    </table>
                </div>
            }
        </>
    );
}

export default WebinarInvoice;


