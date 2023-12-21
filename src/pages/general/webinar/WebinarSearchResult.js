import React, { createRef, useState, useEffect, useRef } from "react";
import axios from "axios"
import Cookies from "js-cookie"
import Template from '../../../components/Template';
import Config from "../../../components/axios/Config";
import MyContext from "../../../components/MyContext";
import Paginate from "../../../components/helpers/Paginate";
import GeneralRoutePath from "../GeneralRoutePath";
import {optionEventType} from "./components/WebinarOptions"
import EventCard from "./components/EventCard";
import SpeakerCard from "./components/SpeakerCard";
import { useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const WebinarSearchResult = () => {
    const Style = (props) => {
        return (
            <style jsx="true">{`
                .btn-primary-outline {
                    background-color: transparent;
                    border: none;
                  }
                #body {
                    max-width: ${props.themes ? props.themes.site_width.width : ''};
                    margin: 0 auto;
                }
            `}</style>
        )
    }
    const { search } = useParams()
    const [loading, setLoading] = useState(false);
    const [init, set_init] = useState(false);
    const [events, setEvents] = useState([]);
    const [page_count, set_page_count] = useState(0);
    const [page, set_page] = useState(1);
    const [perPage, setPerPage] = useState(15);
    const [tabKey, setTabKey] = useState('all');
    const [eventType, setEventType] = useState(null);
    const [searchSpeaker, setSearchSpeaker] = useState(false);
    const [speakers, setSpeakers] = useState([]);

    const { t } = useTranslation()

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
        if (searchSpeaker) {
            getSepakerList();
        } else {
            getEventList();
        }
    }, [page, eventType, searchSpeaker]);

    const getEventList = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}webinar/getEvent`;
        let params = {
            page: page,
            per_page: perPage,
            event_type: eventType,
            search: search,
            // min_price: '',
            // max_price: ''
        }
        axios.get(url, Config({
            Authorization: 'Bearer ' + Cookies.get('token')
        }, params
        )).then(res => {
            setEvents(res.data.data.data);
            set_page_count(res.data.data.last_page)
            set_init(true)
            // console.log(res.data.data.data);
        }).catch(error => {
            console.error('error Event List: ', error);
        }).finally(() => setLoading(false))
    }

    const getSepakerList = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}webinar/getSpeaker`;
        let params = {
            page: page,
            per_page: perPage,
            expertise_level: null,
            search: search
        }
        axios.get(url, Config({
            Authorization: 'Bearer ' + Cookies.get('token')
        }, params
        )).then(res => {
            setSpeakers(res.data.data.data);
            set_page_count(res.data.data.last_page)
            set_init(true)
            // console.log(res.data.data.data);
        }).catch(error => {
            console.error('error banner: ', error);
        }).finally(() => setLoading(false))
    }

    const onPageChange = (page) => {
        set_page(page)
    }

    const selectSpeakerTab = (val) => {
        setEventType(null);
        setSearchSpeaker(val);
    }

    const selectEventsTab = (val) => {
        setEventType(val);
        setSearchSpeaker(false);
    }

    return (
        <Template>
            <style>{`
                    .category{
                        color: '#F8931D';
                        backgroundColor: 'white'; 
                        textAlign: 'center'; 
                        borderRadius: 50; 
                        width: '120%';
                        borderWidth: 1000;
                    }
                `}</style>
            <MyContext.Consumer>{context => (
                // <div>Dashboard</div>
                <div id="body" className="mt-1">
                    <Style themes={context.theme_settings} />
                    <div className='row'>
                        <h6 className='h1 font-weight-bold p-3'>{t('webinar.search_result')} "{search}"</h6>
                        <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 p-3">
                            {!events ? //data speaker
                                <div>Classes Not Available</div>
                                :
                                <>
                                    <div className='row mx-1' style={{ justifyContent: 'center' }}>  
                                        <button className="mx-2 btn-primary-outline" onClick={() => selectEventsTab(null)}>
                                            {((!searchSpeaker) && (eventType === null)) ?
                                                <>
                                                    <p style={{ color: 'white', backgroundColor: '#F8931D', textAlign: 'center', borderRadius: 50, width: '120%' }}>All Event</p>
                                                </> :
                                                <>
                                                    <p style={{ color: '#8D8D8D', backgroundColor: '#F3F3F3', borderWidth: 10, textAlign: 'center', borderRadius: 50, width: '120%' }}>All Event</p>
                                                </>
                                            }
                                        </button>  
                                        {optionEventType.map((type) => {
                                            return (
                                                <button className="mx-2 btn-primary-outline" onClick={() => selectEventsTab(type.value)}>
                                                    {(eventType === type.value)? 
                                                    <>
                                                        <p style={{ color: 'white', backgroundColor: '#F8931D', textAlign: 'center', borderRadius: 50, width: '120%' }}>{type.label}</p>
                                                    </>:
                                                    <>
                                                        <p style={{ color: '#8D8D8D', backgroundColor: '#F3F3F3', borderWidth: 10, textAlign: 'center', borderRadius: 50, width: '120%' }}>{type.label}</p>
                                                    </>
                                                    }
                                                </button>        
                                            )
                                        })}
                                        <button className="mx-2 btn-primary-outline" onClick={() => selectSpeakerTab(true)}>
                                            {(searchSpeaker) ?
                                                <>
                                                    <p style={{ color: 'white', backgroundColor: '#F8931D', textAlign: 'center', borderRadius: 50, width: '120%' }}>Speaker</p>
                                                </> :
                                                <>
                                                    <p style={{ color: '#8D8D8D', backgroundColor: '#F3F3F3', borderWidth: 10, textAlign: 'center', borderRadius: 50, width: '120%' }}>Speaker</p>
                                                </>
                                            }
                                        </button>
                                    </div>
                                    {
                                        (searchSpeaker) ? 
                                        <><ListSpeaker speakers={speakers} page_count={page_count} onPageChange={onPageChange()} page={page} /></>:
                                        <><ListEvent events={events} page_count={page_count} onPageChange={onPageChange()} page={page} /></>
                                    }
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

export const ListEvent = ({ events, page_count, onPageChange, page }) => {
    return (
        <>
            <div className='row'>
                {events.map((event) => {
                    return (
                        <EventCard event={event} />
                    )
                })}
            </div>
            <Paginate pageCount={page_count} onPageChange={onPageChange} initialPage={page} />
        </>
    );
}

export const ListSpeaker = ({ speakers, page_count, onPageChange, page }) => {
    return (
        <>
            <div className='row'>
                {speakers.map((speaker) => {
                    return (
                        <SpeakerCard speaker={speaker} />
                    )
                })}
            </div>
            <Paginate pageCount={page_count} onPageChange={onPageChange} initialPage={page} />
        </>
    );
}

export default WebinarSearchResult