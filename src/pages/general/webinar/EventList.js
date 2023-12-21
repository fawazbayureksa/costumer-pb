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
import { Tab, Tabs, Modal } from 'react-bootstrap';
import { Link, NavLink, Redirect, Route, Router, Switch, useHistory } from "react-router-dom";

const EventList = () => {
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
    const [loading, setLoading] = useState(false);
    const [init, set_init] = useState(false);
    const [events, setEvents] = useState([]);
    const [page_count, set_page_count] = useState(0);
    const [page, set_page] = useState(1);
    const [perPage, setPerPage] = useState(12);
    const [tabKey, setTabKey] = useState('all');
    const [eventType, setEventType] = useState(null);
    const [search, set_search] = useState("");

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

    const eventTypesOptionTab = [
        { value: null, label: 'Semua' },
        ...optionEventType
    ]

    useEffect(() => {
        getEventList();
    }, [page, eventType]);

    useEffect(() => {
        if (!init) return
        let timeout = setTimeout(() => {
            getEventList()
        }, 500);
        return () => {
            clearTimeout(timeout)
        }
    }, [search])

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

    const onPageChange = (page) => {
        set_page(page)
    }

    const handleFilterChanged = (e) => {
        const { value } = e.target;
        // if (e.key === "Enter" || e.keyCode === 13) {
        //     set_search(value) //pakai onkeydown
        // }
        set_search(value)
    };

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
                        <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 p-3">
                            {!events ? //data speaker
                                <div>Classes Not Available</div>
                                :
                                <>
                                    <div className='row mx-1' style={{ justifyContent: 'center' }}>  
                                        {eventTypesOptionTab.map((type) => {
                                            return (
                                                <button className="mx-2 btn-primary-outline" onClick={() => setEventType(type.value)}>
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
                                    </div>
                                    {/* <div className='row mt-1' style={{ justifyContent: 'center' }}>
                                        <input
                                            name="search"
                                            type="text"
                                            className="form-control mt-1 col-md-8"
                                            placeholder="Search Event"
                                            onChange={handleFilterChanged}
                                        // onKeyDown={handleFilterChanged} //untuk pakai enter
                                        />
                                    </div> */}
                                    <div className='row'>
                                        {events.map((event) => {
                                            console.log(event.speakers)
                                            return (
                                                <EventCard event={event} />
                                            )
                                        })}
                                    </div>
                                    <Paginate pageCount={page_count} onPageChange={onPageChange} initialPage={page} />
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



export default EventList