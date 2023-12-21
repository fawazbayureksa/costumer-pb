import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useState } from 'react';
import { useEffect } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import Config from '../../../../../components/axios/Config';
import SwalToast from '../../../../../components/helpers/SwalToast';
import MetaTrigger from '../../../../../components/MetaTrigger';
import MyContext from '../../../../../components/MyContext';
import Followers from './Followers';
import Following from './Following';

const Style = (props) => {
    return (
        <style jsx="true">{`
                .nav-tabs .nav-link {
                    width: 45%;
                    border: none;
                    margin-left : 2rem;
                    margin-right: 2rem;
                    text-align: center;
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
                .nav-tabs a:hover {
                    color: ${props.themes ? props.themes.accent_color.value : ''};
                }
            `}</style>
    )
}



const TabFriend = () => {
    const [key, setKey] = useState('new');
    const [dataFollower, setDataFollower] = useState([])
    const [dataFollowing, setDataFollowing] = useState([])

    const { t } = useTranslation()

    useEffect(() => {
        getFollowers()
        getFollowing()
    }, [])


    const getFollowers = () => {

        let url = `${process.env.REACT_APP_BASE_API_URL}ecommerce/customer/getFollowers`;

        axios.get(url, Config({
            Authorization: `Bearer ${Cookies.get("token")}`,
        })
        ).then(response => {
            let data = response.data.data;
            setDataFollower(data.data);
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

    const getFollowing = () => {

        let url = `${process.env.REACT_APP_BASE_API_URL}ecommerce/customer/getFollowing`;

        axios.get(url, Config({
            Authorization: `Bearer ${Cookies.get("token")}`,
        })
        ).then(response => {
            let data = response.data.data;
            setDataFollowing(data.data);
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

    const onFollow = (mp_customer_id,mp_seller_id, status, type) => {
        let url = `${process.env.REACT_APP_BASE_API_URL}ecommerce/${type}/follow`;
        


        let body = {
            mp_customer_id: parseInt(mp_customer_id),
            mp_seller_id: parseInt(mp_seller_id),
            is_follow: status,
        }

        // console.log(body);
        // return
        axios.post(url, body, Config({
            Authorization: `Bearer ${Cookies.get("token")}`,
        })
        ).then(response => {
            let data = response.data;
            console.log(data);
            SwalToast.fire({
                icon: "success",
                title: response.data.message
            })
            getFollowers()
            getFollowing()
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


    return (
        <MyContext.Consumer>{context => (
            <div className="">
                <MetaTrigger
                    pageTitle={context.companyName ? `${context.companyName} - ${t('account_setting.friend_list')}` : ""}
                    pageDesc={t('account_setting.friend_list')}
                />
                <Style themes={context.theme_settings} />
                <Tabs id="controlled-tab" className="mb-3" activeKey={key} onSelect={(k) => setKey(k)}>
                    <Tab tabClassName="mx-0 mx-sm-0 mx-md-3 mx-4" eventKey="new" title={t('friend_list.following')}>
                        <Following data={dataFollowing} onFollow={onFollow} />
                    </Tab>
                    <Tab tabClassName="mx-0 mx-sm-0 mx-md-3 mx-4" eventKey="trend" title={t('friend_list.followers')}>
                        <Followers data={dataFollower} onFollow={onFollow} />
                    </Tab>
                </Tabs>
            </div>
        )}</MyContext.Consumer>
    )
}
export default TabFriend;