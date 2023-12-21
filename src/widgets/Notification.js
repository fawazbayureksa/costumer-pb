import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import $ from "jquery";
import axios from "axios";
import Config from "../components/axios/Config";
import Cookie from "js-cookie";
import CustomerRoutePath from "../pages/e-commerce/customer/CustomerRoutePath";
import InfiniteScroll from 'react-infinite-scroll-component';
import update from 'immutability-helper'
import CustomImage, { PublicStorageFolderPath } from "../components/helpers/CustomImage";
import { DateTimeFormat } from "../components/helpers/DateTimeFormat";
import { FirebaseNotification } from "../components/helpers/FirebaseEvent";
import SwalToast from "../components/helpers/SwalToast";

/**
 * 
 * @param {object} data data for this component
 */
const Notification = (props) => {
    const [styles, set_styles] = useState({});
    const [counter, set_counter] = useState(0);
    const [notifications, set_notifications] = useState([])
    const [notification_next_max_id, set_notification_next_max_id] = useState(false)
    const [notifbar_hidden, set_notifbar_hidden] = useState(true)
    const notifPerPage = 11

    useEffect(() => {
        setStyle();
        getNotificationUnread()
        getNotifications()
    }, []);

    const imgFit = () => {
        let size = $('.notification-widget-text').css('font-size');
        $('.notification-widget-text img').css({ 'width': size, 'height': size });
    }

    const setStyle = () => {
        let temp_styles = {};
        if (props.data.font_weight) {
            temp_styles.fontWeight = props.data.font_weight === 'semi_bold' ? 600 : props.data.font_weight
        }
        if (props.data.color) {
            temp_styles.color = props.data.color
        }
        temp_styles.marginTop = props.data.margin_top || 0;
        temp_styles.marginBottom = props.data.margin_bottom || 0;
        temp_styles.marginRight = props.data.margin_right || 0;
        temp_styles.marginLeft = props.data.margin_left || 0;
        set_styles(temp_styles);
    }

    const getNotificationUnread = () => {
        if (!JSON.parse(process.env.REACT_APP_FEATURE_MARKETPLACE)) return;
        if (!Cookie.get('token')) return;

        let url = `${process.env.REACT_APP_BASE_API_URL}notification/getNotificationUnread`

        axios.get(url, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        })).then(res => {
            set_counter(res.data.data);
        }).catch((error) => {
            console.log(error)
        });
    }
    const getNotifications = () => {
        if (!JSON.parse(process.env.REACT_APP_FEATURE_MARKETPLACE)) return;
        if (!Cookie.get('token')) return;

        let url = `${process.env.REACT_APP_BASE_API_URL}notification/getNotificationsByParams`

        axios.get(url, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        }, {
            per_page: notifPerPage,
            max_id: notifications.length > 0 ? notification_next_max_id : null
        })).then(res => {
            // only show n-1 data
            set_notifications(update(notifications, {
                $push: res.data.data.slice(0, notifPerPage - 1)
            }))
            // the last data is used to detect load more, only if the length of response is equal to per_page param.
            set_notification_next_max_id(res.data.data.length === notifPerPage ? res.data.data[res.data.data.length - 1].id : false)

        }).catch((error) => {
            console.log(error)
        });
    }

    const markAsRead = (e) => {
        if (!JSON.parse(process.env.REACT_APP_FEATURE_MARKETPLACE)) return;
        if (!Cookie.get('token')) return;

        let index = e.currentTarget.getAttribute('index')
        let item = notifications[index]
        if (!item) return
        if (item.status === "read") return;

        let url = `${process.env.REACT_APP_BASE_API_URL}notification/markAsRead/${item.id}`

        axios.patch(url, null, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        })).then(res => {
            set_notifications(update(notifications, {
                [index]: { status: { $set: "read" } }
            }))
            set_counter(counter - 1)
        }).catch((error) => {
            console.log(error)
        });
    }
    const markAsReadAll = () => {
        if (!JSON.parse(process.env.REACT_APP_FEATURE_MARKETPLACE)) return;
        if (!Cookie.get('token')) return;

        let url = `${process.env.REACT_APP_BASE_API_URL}notification/markAsReadAll`
        axios.post(url, null, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        })).then(res => {
            // Object.keys(notifications).forEach(function (key) { notifications[key].status = "read" });
            let list = [...notifications];
            notifications.forEach((item, index) => {
                list[index].status = "read";
            })
            set_notifications(list);
            set_counter(0)
        }).catch((error) => {
            console.log(error)
        });
    }

    // console.log(counter)

    const openNotifBar = () => {
        set_notifbar_hidden(false)
    }
    const closeNotifBar = () => {
        set_notifbar_hidden(true)
    }
    const onNotificationReceived=(data)=>{
        SwalToast.fire({
            title: data.title,
            text:data.body
        });
        let newnotif = {
            id: data.notif_id,
            created_at:new Date().toUTCString(),
            redirect_to:data.redirect,
            title:data.title,
            desc:data.body,
            status:"unread"
        }
        set_notifications(update(notifications, {
            $unshift:[newnotif]
        }))
        set_counter(counter+1)
        // let dataNotif = JSON.parse(data.notif_detail)
        // let currentUser = JSON.parse(Cookie.get('user'))
        // dataNotif.map((item) => {
        //     if(item.mp_customer_id === currentUser.id){
        //         set_notifications(update(notifications, {
        //             $unshift:[item]
        //         }))
        //         set_counter(counter+1)
        //     }
        // })
    }
    return (
        <>
            <style>{`
                .notification-widget-text {
                    font-size: ${props.data.font_size};
                }
                .notifbar {
                    z-index: 2000; 
                    width: 18rem; 
                    top: 1.8rem;
                    left: 0;        
                }
                .badge-counter {
                    margin-left: -1.2em;
                    margin-top: -0.3em;
                }
                @media (max-width: 765.98px) {
                    .notification-widget-text {
                        font-size: 100%;
                    }
                    .notifbar {
                        // display: none;
                        z-index: 2000;
                        width: 18rem; 
                        top: 3rem;
                        left: -10rem;
                    }
                    .badge-counter {
                        margin-left: -1.6em;
                    }
                }
            `}</style>
            <div
                onMouseEnter={openNotifBar}
                onMouseLeave={closeNotifBar}
                className="text-decoration-none position-relative d-flex align-items-center notification-widget-text" style={styles}>
                {props.data.logo && props.data.logo_position === 'left' &&
                    <CustomImage folder={PublicStorageFolderPath.cms} filename={props.data.logo} alt={props.data.logo} className="object-fit-cover mr-1" style={{ width: 30, height: 30 }} />}
                {props.data.text}
                {props.data.logo && props.data.logo_position === 'right' &&
                    <CustomImage folder={PublicStorageFolderPath.cms} filename={props.data.logo} alt={props.data.logo} className="object-fit-cover ml-1" style={{ width: 30, height: 30 }} />}
                {props.data.with_counter === 'yes' &&
                    <div className={`${counter > 0 ? '' : 'd-none'} d-flex align-self-start`}>
                        <span className="badge badge-pill badge-counter bgc-EB2424"  >
                            <p className="m-0 small text-white">{counter > 99 ? '99+' : counter}</p>
                        </span>
                    </div>}
                <div className="notifbar position-absolute rounded bg-white shadow-graph pt-3" hidden={notifbar_hidden} style={{}}>
                    <div className="d-flex justify-content-between border-bottom">
                        <div className="px-3 pb-2 font-weight-bold ">Notification</div>
                        <div className="px-3 pb-2 small cursor-pointer" onClick={markAsReadAll}> Read All Notif</div>
                    </div>
                    <div className="text-left notifications-body-adgmu" id="notifScrollDiv" style={{ maxHeight: '20rem', overflow: 'auto' }}>
                        <style jsx="true">{`
                            .notifications-body-adgmu::-webkit-scrollbar {
                                width: 4px;
                            }
                            .notifications-body-adgmu::-webkit-scrollbar-thumb {
                                background-color: ${props.themes ? props.themes.accent_color.value : '#000'};
                                border-radius: 4px;
                            }
                            .notifications-item-xkvan:hover {
                                background-color: ${props.themes ? props.themes.accent_color.value : '#000'};
                                text-decoration: none;
                            }
                            .notifications-item-sdf3e{
                                background-color: #BDD7F0;
                            }
                        `}</style>
                        <FirebaseNotification type="notification" onReceived={onNotificationReceived} />
                        <InfiniteScroll
                            dataLength={notifications.length}
                            next={getNotifications}
                            hasMore={notification_next_max_id}
                            loader={<div className="text-center">Loading...</div>}
                            scrollableTarget="notifScrollDiv"
                        >
                            {notifications.map((item, index) => (<div key={item.id} >
                                <div className={`pt-2 px-3 border-bottom ${item.status === "unread" ? "notifications-item-sdf3e" : "notifications-item-xkvan"}`}
                                    onMouseEnter={markAsRead}
                                    index={index}>
                                    <Link className="text-decoration-none" to={"/" + item.redirect_to}>
                                        <p className="m-0 color-C1C8CE" style={{ fontSize: '70%' }}>{DateTimeFormat(item.created_at, 2)}</p>
                                        <p className="m-0 color-333333 font-weight-bold" style={{ fontSize: '90%' }}>{item.title}</p>
                                        <p className="mb-2 color-333333" style={{ fontSize: '90%' }}>{item.desc}</p>
                                    </Link>
                                </div>
                            </div>))}

                        </InfiniteScroll>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Notification