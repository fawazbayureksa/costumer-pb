import React, { useEffect, useState } from 'react'
import Template from '../../../components/Template'
import MyContext from '../../../components/MyContext';
import ImageBanner from './helpers/ImageBanner';
import CardAuction from './components/CardAuction';
import CardSlider, { CardBanner } from './components/CardSlider';
import axios from 'axios';
import Config from '../../../components/axios/Config';
import SwalToast from '../../../components/helpers/SwalToast';
import Cookies from 'js-cookie';
import SliderBanner from './helpers/SliderBanner';
import { isLogin } from '../../general/forum/components/IsLogin'
import MetaTrigger from '../../../components/MetaTrigger';
import { useTranslation } from 'react-i18next';

const Style = props => {
    if (props.themes) {
        return (
            <style>{`
                #body {
                    max-width: ${props.themes.site_width.width};
                    margin: 0 auto;
                }
            `}</style>
        );
    } else return null;
};

export default function Auction() {
    const [data, setData] = useState([])
    const [dataOnGoing, setDataOnGoing] = useState([])
    const [user, setUser] = useState(null)
    const [dataPromo, setDataPromo] = useState([])

    useEffect(() => {
        getData();
        // getDataOnAuction();
        let userData = Cookies.get('user') ? JSON.parse(Cookies.get('user')) : null
        setUser(userData)
    }, [])

    const getData = () => {

        let url = `${process.env.REACT_APP_BASE_API_URL}auction/welcomePage`

        let axiosInstance = axios.get(url, Config({}))

        if (isLogin()) {
            axiosInstance = axios.get(url, Config({ Authorization: `Bearer ${Cookies.get("token")}`, }))
        }
        // console.log(axiosInstance)
        // return
        axiosInstance.then(response => {
            let data = response.data.data;
            setData(data);
            if (data.activity_auction) {
                setDataOnGoing(data.activity_auction)
            } else {
                setDataOnGoing([])
            }
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

    const getDataOnAuction = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}auction/product/ongoing`

        axios.get(url, Config({
            Authorization: `Bearer ${Cookies.get("token")}`,
        })).then(response => {
            let data = response.data.data;
            setDataOnGoing(data);
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

    const { t } = useTranslation()
    return (
        <>
            <Template>
                <style>{`
                    .vouchers {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 15px;
                    }
                    .empty-state {
                        width: 300px;
                    }
                    .card-slider {
                        display: grid;
                        grid-template-rows: 1fr 1fr;
                        gap: 15px;
                    }
                    .show-history{
                        font-size:16px;
                    }
                    .hr34 {
                        margin-top:35px
                    }
                    @media (max-width: 765.98px) {
                        .empty-state {
                            width: 200px;
                        }
                        .vouchers {
                            display: grid;
                            grid-template-columns: 1fr;
                            gap: 10px;
                        }
                        .show-history{
                            display:none;
                        }
                        .iconafd{
                            font-size:20px;
                        }
                        .container {
                            padding:0;
                        }
                    }
                    @media (max-width: 425px) {
                        .responsive-card{
                            display:flex;
                            flex-direction:column;
                            
                        }
                        .button-exchange {
                            display:flex;
                            align-self:start;
                        }
                    }
                `}</style>
                <ImageBanner t={t} />
                <MyContext.Consumer>{context => (
                    <div id="body" className="my-4">
                        <MetaTrigger
                            pageTitle={context.companyName ? `${context.companyName} - ${t('account_setting.auction')}` : ""}
                            pageDesc={'Lelang 365'}
                        />
                        <Style themes={context.theme_settings} />

                        <div className='mt-5'>
                            <SliderBanner data={data?.auction_banner} />
                        </div>
                        <div className='mt-3'>
                            {dataOnGoing.length > 0 ?
                                <div className='ml-3'>
                                    <div className='h3 font-weight-bold'>
                                        {user ?
                                            user.name + ' , ' + t('auction.the_auction_still_going')
                                            :
                                            t('auction.find_product_you_love')
                                        }
                                    </div>
                                    <p className='body font-weight-bold'>{t('auction.bid_again')}</p>
                                </div>
                                :
                                <center>
                                    <div className="d-flex justify-content-center">
                                        <img
                                            src={`/images/empty.png`}
                                            className="empty-state"
                                            onError={event => event.target.src = `/images/placeholder.gif`}
                                            style={{ width: 250, height: "auto" }}
                                        />
                                    </div>
                                    <h5 className='h5'>{t('auction.not_yet')}</h5>
                                </center>
                            }
                            <div className='vouchers'>
                                {dataOnGoing.length > 0 && dataOnGoing.map((item) => (
                                    <CardAuction data={item} />
                                ))}
                            </div>
                            {(data?.data_promoted?.length > 0 || data?.on_going?.length > 0 || data?.on_the_day?.length > 0) &&
                                <div>
                                    <div className='h3 font-weight-bold my-3 ml-2'>
                                        {t('auction.find_product_you_love')}
                                    </div>
                                    <CardSlider data={data?.on_going} name={"onGoing"} t={t} />
                                    <CardSlider data={data?.data_promoted} name={"promote"} t={t} />
                                    <CardSlider data={data?.on_the_day} name={"onTheDay"} t={t} />
                                </div>
                            }
                            {data?.next_day?.length > 0 &&
                                <div>
                                    <div className='h3 font-weight-bold ml-2 my-3'>{t('auction.next_day')}</div>
                                    <CardSlider data={data?.next_day} name={"nextDay"} t={t} />
                                </div>
                            }
                        </div>
                    </div>
                )}</MyContext.Consumer>
            </Template>
        </>
    )
}

