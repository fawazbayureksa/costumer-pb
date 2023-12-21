import React, { useEffect, useState } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import TabProfil from './TabProfile';
import SwalToast from '../../../../components/helpers/SwalToast';
import Cookies from 'js-cookie';
import axios from 'axios';
import CustomImage, { PublicStorageFolderPath } from '../../../../components/helpers/CustomImage';
import MyContext from '../../../../components/MyContext';
import Template from '../../../../components/Template';
import Config from '../../../../components/axios/Config';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { isLogin, isLoginTrue } from '../../../general/forum/components/IsLogin'
import MetaTrigger from '../../../../components/MetaTrigger';
import AllThread from './AllThread';


let Style = (props) => {
    return (
        <style>
            {`
                #as-react-datatable-table-head {
                    display: none;
                }
                #body{
                    max-width: ${props?.themes?.site_width?.width};
                    margin: 0 auto;
                }
                thead {
                    background-color: #384651;
                    color: white;
                }
                thead th.sortable {
                    color: white !important;
                }
                .primary-btn {
                    background-color: #EC9700;
                    color: #FFFFFF;
                    font-weight: bold;
                }
                .primary-btn:hover {
                    background-color: #EC9700;
                    color: #FFFFFF;
                    font-weight: bold;
                }
                .stepper .active {
                    border-bottom: 2px solid #EC9700;
                    color: #EC9700 !important;
                }
            `}
        </style>
    )
};


const ProfilCustomer = () => {

    const [key, setKey] = useState('new');
    const [data, setData] = useState([])
    const { id } = useParams()
    const [dataFollower, setDataFollower] = useState()
    const [dataFollowing, setDataFollowing] = useState()
    const [isFollowing, setIsFollowing] = useState(false)
    const [currentTab, setCurrentTab] = useState("");

    const tabStatus = [
        { id: "", text: "Semua" },
        { id: "new", text: "Terbaru" },
        { id: "popular", text: "Popular" }
    ]


    useEffect(() => {
        getUserDetail()
    }, []);


    const getUserDetail = () => {

        let url = `${process.env.REACT_APP_BASE_API_URL}ecommerce/customer/find/${id}`;

        let axiosInstance = axios.get(url, Config({}))

        if (isLogin()) {
            axiosInstance = axios.get(url, Config({ Authorization: `Bearer ${Cookies.get("token")}`, }))
        }
        axiosInstance.then(response => {
            let data = response.data.data;
            setData(data.customerData);
            setDataFollower(data.customerFollower);
            setDataFollowing(data.customerFollowing);
            setIsFollowing(data.isFollowing);
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

    const sendFollow = () => {

        let url = `${process.env.REACT_APP_BASE_API_URL}ecommerce/customer/follow`;


        let body = {
            mp_customer_id: parseInt(id),
            is_follow: !isFollowing,
        }

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
            getUserDetail()
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
        <Template>
            <MyContext.Consumer>{context => (
                <div>
                    <Style themes={context.theme_settings} />
                    <div id="body" className="my-4">
                        <MetaTrigger
                            pageTitle={(context.companyName && data.name) ? `${context.companyName} - ${data?.name} ` : ""}
                            pageDesc={'Forum'}
                        />
                        <div className="bg-white shadow-graph rounded p-3">
                            <div className='d-flex justify-content-between'>
                                <div className='d-flex align-items-center'>
                                    <CustomImage
                                        folder={PublicStorageFolderPath.customer}
                                        filename={data?.profile_picture}
                                        style={{ width: 100, height: 100, borderRadius: "50%" }}
                                    />
                                    <div className='ml-3'>
                                        <h6 className=' font-weight-bold'>{data?.name}</h6>
                                        <p className='fs-small font-weight-bold'>{dataFollowing} Following | {dataFollower} Followers</p>
                                    </div>
                                </div>
                                {isLoginTrue(id) == false &&
                                    <div className='d-flex align-items-center'>
                                        <div className='d-flex'>
                                            <button className="btn btn-sm border-CED4DA button-nowrap  mx-3 rounded p-2 font-weight-bold" style={{ width: 200 }}>
                                                {t('forum_chat')}
                                            </button>
                                            <button onClick={sendFollow} className="btn btn-sm text-white bgc-accent-color button-nowrap rounded p-2 font-weight-bold" style={{ width: 200 }}>
                                                {isFollowing ? t('seller.unfollow') : t('seller.follow')}
                                            </button>
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                        <div className="stepper  pt-2 clearfix mb-3" style={{ borderBottom: '2px solid #ECECEC' }}>                    {
                            tabStatus.map((value) => (
                                <CustomLink key={value.id} onClick={() => setCurrentTab(value.id)} id={value.id} current_tab={currentTab} Text={value.text} ></CustomLink>
                            ))
                        }
                        </div>
                        <div>
                            <AllThread order={currentTab} type={"customer"} />
                        </div>
                    </div>
                </div>
            )}</MyContext.Consumer>
        </Template>
    )
}

export default ProfilCustomer;

let CustomLink = (props) => {
    let onClick = () => {
        props.onClick(props.id);
    }
    let className = "m-0 px-4 py-2 d-inline-block color-A6A6A6 text-decoration-none ";
    if (props.current_tab === props.id) className += "active "
    return (
        <div onClick={onClick} className={className} style={{ cursor: 'pointer' }}>{props.Text} {props.counter > 0 ? <small className="rounded-circle bgc-EC9700 text-white font-weight-semi-bold px-2 py-1">{props.counter}</small> : null}</div>
    );
}