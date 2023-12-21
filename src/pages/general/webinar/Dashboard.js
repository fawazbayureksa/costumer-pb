import React, { createRef, useState, useEffect, useRef } from "react";
import axios from "axios"
import Cookies from "js-cookie"
import Carousel from "react-multi-carousel";
import Template from '../../../components/Template';
import Config from "../../../components/axios/Config";
import MyContext from "../../../components/MyContext";
import GeneralRoutePath from "../GeneralRoutePath";
import CustomImage, { PublicStorageFolderPath } from "../../../components/helpers/CustomImage";
import EventCard from "./components/EventCard";
import { useTranslation } from 'react-i18next';
import { Link, NavLink, Redirect, Route, Router, Switch, useHistory } from "react-router-dom";
import MetaTrigger from "../../../components/MetaTrigger";

const Dashboard = () => {
    const Style = (props) => {
        return (
            <style jsx="true">{`
                .nav-tabs .nav-link {
                    border: none;
                    margin-left : 2rem;
                    margin-right: 2rem;
                }
                .nav-tabs .nav-link.active {
                    border-bottom: 2px solid ${props.themes ? props.themes.accent_color.value : ''};
                    color:#F8931D;
                    font-weight:700;  
                }
                .nav-tabs .nav-item.show .nav-link, .nav-tabs .nav-link.active {
                    color: ${props.themes ? props.themes.accent_color.value : ''};
                    font-weight:700;  
                }
                .nav-tabs a{
                    font-size: 18px;
                }
                .nav-tabs a:hover {
                    color: ${props.themes ? props.themes.accent_color.value : ''};
                }
                #body {
                    max-width: ${props.themes ? props.themes.site_width.width : ''};
                    margin: 0 auto;
                }
            `}</style>
        )
    }

    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState([]);
    const [dataBanner, setDataBanner] = useState();
    const [events, setEvents] = useState([]);
    const [speakers, setSpeakers] = useState([]);
    const [title, setTitle] = useState();
    const [searchParam, setSearchParam] = useState('');

    const { t } = useTranslation()
    const history = useHistory()

    const responsive = {
        desktop: {
            breakpoint: { max: 3000, min: 1024 },
            items: 1,
        },
        tablet: {
            breakpoint: { max: 767, min: 464 },
            items: 1,
        },
        mobile: {
            breakpoint: { max: 464, min: 0 },
            items: 1,
        }
    };

    useEffect(() => {
        getDashboardBanner();
    }, []);

    const getDashboardBanner = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}webinar/dashboard/get`
        axios.get(url).then(res => {
            setSpeakers(res.data.data.DataSpeaker);
            setDataBanner(res.data.data.DataBanner);
            setImages(res.data.data.DataBanner.forum_banner_slide.map(banner => (
                { uri: banner.filename }
            )));
            setEvents(res.data.data.DataEvent);
            setTitle(res.data.data.Title)
            // console.log(res.data.data.Title);
        }).catch(error => {
            console.error('error banner: ', error);
        }).finally(() => setLoading(false))
    }

    const handleSearch = () => {
        if (!searchParam)
        return;
        history.push(GeneralRoutePath.WEBINAR_SEARCH_RESULT.replace(':search', searchParam))
    }

    return (
        <Template>
            <style>{`
                    
                `}</style>
            <MyContext.Consumer>{context => (
                // <div>Dashboard</div>
                <div id="body" className="my-1">
                    <MetaTrigger
                        pageTitle={context.companyName ? `${context.companyName} - ${t('account_setting.webinar')}` : ""}
                        pageDesc={'Lelang 365'}
                    />
                    <Style themes={context.theme_settings} />
                    <div className='row'>
                        <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 p-3">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <h1 style={{ color: '#F8931D' }} className='h1 font-weight-bold p-3'>{title}</h1>
                                <div className='d-flex mt-2 col-md-6' style={{ justifyContent: 'center' }}>
                                    <input
                                        name="search"
                                        type="text"
                                        className="form-control"
                                        placeholder="Search Event"
                                        onChange={(e) => setSearchParam(e.target.value)}
                                        value={searchParam}
                                    />
                                    <div onClick={handleSearch} style={{ backgroundColor: '#F8931D', textAlign: 'center', width: '7.5%', borderTopRightRadius: 5, borderBottomRightRadius: 5 }}>
                                        <i className="fas fa-search mt-2" style={{ color: 'white' }}></i>
                                    </div>                                   
                                </div>
                            </div>
                            {!dataBanner ?
                                <div>Banner Not Available</div>
                                :
                                <>
                                    <Style themes={context.theme_settings} />
                                    <Carousel
                                        responsive={responsive}
                                        autoPlay={dataBanner?.auto_play == "disable" ? false : true}
                                        autoPlaySpeed={dataBanner?.slideshow_speed}
                                        transitionDuration={dataBanner?.animation_speed}
                                        infinite={dataBanner?.auto_play == "disable" ? false : true}
                                    >
                                        {dataBanner && dataBanner?.forum_banner_slide.map((image) => (
                                            <div>
                                                <CustomImage
                                                    folder={PublicStorageFolderPath.cms}
                                                    filename={image?.filename}
                                                    style={{ width: `${dataBanner?.width}%`, height: dataBanner?.height, borderRadius: 10 }}
                                                    className="object-fit-cover"
                                                />
                                            </div>
                                        ))}
                                    </Carousel>
                                </>
                            }
                        </div>
                        <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 p-3">
                            {!speakers ? //data speaker
                                <div>Speakers Not Available</div>
                                :
                                <>
                                    <div className='row'>
                                        <h3 className='h3 font-weight-bold p-3 col-xl-6'>{t('webinar.featured_speaker')}</h3>
                                        <Link to={GeneralRoutePath.WEBINAR_LIST_SPEAKER} className='p-3 col-xl-6'>
                                            <h6 style={{ textAlign: 'right', color: '#F8931D' }}>{t('webinar.view_all')}</h6>
                                        </Link>
                                    </div>
                                    <div className='row'>
                                        {speakers.map((speaker) => {
                                            return (
                                                <Link to={GeneralRoutePath.WEBINAR_DETAIL_SPEAKER.replace(':id', speaker.id)}>
                                                    <div className="bg-white rounded p-4 col-xl-12" style={{ top: 0 }}>
                                                        <CustomImage
                                                            folder={PublicStorageFolderPath.cms}
                                                            filename={speaker?.image}
                                                            style={{ width: 180, height: 180, borderRadius: 100, borderColor: 20 }}
                                                            className="object-fit-cover"
                                                        />
                                                        <div style={{ textAlign: 'center' }}>{speaker.name}</div>
                                                    </div>
                                                </Link>
                                            )
                                        })}
                                    </div>
                                </>
                            }
                        </div>
                        <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 p-3">
                            {!events ? //data speaker
                                <div>Classes Not Available</div>
                                :
                                <>
                                    <div className='row'>
                                        <h3 className='h3 font-weight-bold p-3 col-xl-6'>{t('webinar.classes')}</h3>
                                        <Link to={GeneralRoutePath.WEBINAR_LIST_EVENT} className='p-3 col-xl-6'>
                                            <h6 style={{ textAlign: 'right', color: '#F8931D' }}>{t('webinar.view_all')}</h6>
                                        </Link>
                                    </div>
                                    <div className='row'>
                                        {events.map((event) => {
                                            console.log(event.speakers)
                                            return (
                                                <EventCard event={event} />
                                            )
                                        })}
                                    </div>

                                </>
                            }
                        </div>
                    </div>
                </div>
            )}
            </MyContext.Consumer>
        </Template>

    )
}

export default Dashboard