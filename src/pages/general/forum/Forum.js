import React, { useEffect, useState } from 'react'
import CustomImage, { PublicStorageFolderPath } from '../../../components/helpers/CustomImage'
import Template from '../../../components/Template'
import { Link, NavLink, Redirect, Route, Router, Switch, useHistory } from "react-router-dom";
import MyContext from '../../../components/MyContext';
import MyPost from './my-post/Post';
import Saved from './saved/Saved';
import Liked from './liked/Liked';
import GeneralRoutePath from '../GeneralRoutePath';
import Categories from './categories/Categories';
import Cookies from 'js-cookie';
import AuthRoutePath from '../../auth/AuthRoutePath';
import SwalToast from '../../../components/helpers/SwalToast';
import { isLogin } from './components/IsLogin'
import { useTranslation } from 'react-i18next';
import EcommerceRoutePath from '../../e-commerce/EcommerceRoutePath';
import SelectCategory from './components/SelectCategory';
import axios from 'axios';
import Config from '../../../components/axios/Config';
import SelectCategories from './categories/SelectCategories';
import moment from 'moment';
import ListLangLocale from '../../../components/ListLangLocale';
import IsEmpty from '../../../components/helpers/IsEmpty';
import MetaTrigger from '../../../components/MetaTrigger';
import TextTruncate from '../../../components/helpers/TextTruncate';
import { TinyMcePreview } from '../../../components/helpers/TinyMceEditor';



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

export default function Forum() {
    const [categories, SetCategories] = useState([])
    const [dataMaster, setDataMaster] = useState([])
    const [dataHotThread, setDataHotThread] = useState([])
    const [selected, setSelected] = useState("")
    const history = useHistory()

    const { t } = useTranslation()

    const onCreateAddForum = () => {
        if (!isLogin()) {
            SwalToast.fire({
                icon: "error",
                title: t('forum_please_login')
            })
        } else {
            history.push(GeneralRoutePath.FORUM_CREATE)
        }
    }


    useEffect(() => {
        let name = Cookies.get('language_code')
        if (!IsEmpty(name)) {
            moment.locale(`${ListLangLocale[name]}`)
        } else {
            moment.locale(ListLangLocale['en'])
        }
    }, [])


    useEffect(() => {
        getCategories()
        getHotThreads()
        getMaster()
    }, [])

    const getCategories = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}forum/categories/get`;
        let category = []
        axios.get(url, Config({
            Authorization: `Bearer ${Cookies.get("token")}`,
        })).then(response => {
            category =
                response.data.data.map((item) => (
                    item.parent_id === null &&
                    {
                        name: item.name,
                        id: item.id
                    }
                ))
            SetCategories(category.filter(x => !!x))
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
    const getMaster = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}forum/master/get`;
        axios.get(url, Config({
            Authorization: `Bearer ${Cookies.get("token")}`,
        })).then(response => {
            setDataMaster(response.data.data)
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
    const getHotThreads = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}forum/master/getHotThread`;
        axios.get(url, Config({
            Authorization: `Bearer ${Cookies.get("token")}`,
        })).then(response => {
            setDataHotThread(response.data.data)
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

    const onSelectCategory = (name, id) => {
        setSelected(name)
    }

    const goToDetails = (id_thread) => {

        let url = `${process.env.REACT_APP_BASE_API_URL}forum/thread/addCounterView`;
        let body = {
            forum_thread_id: id_thread
        }
        axios.post(url, body, Config({
            Authorization: `Bearer ${Cookies.get("token")}`,
        }),
        ).then(response => {
            let data = response.data.data
            console.log(data);
            history.push(GeneralRoutePath.FORUM_DETAIL_THREAD.replace(':id', id_thread))
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
        <>
            <Template>
                <style>{`
                    .float {
                        display:none
                    }
                    @media (max-width: 767.98px) {
                        .card-mobile {
                            display: none;
                        }                        
                        .float{
                            display:block;
                            position:fixed;
                            width:50px;
                            height:50px;
                            bottom:40px;
                            right:40px;
                            border-radius:50px;
                            box-shadow: 1px 1px 2px #999;
                            text-align:center;
                            z-index:99
                        }

                        .my-float{
                            margin-top:20px
                        }
                    }
                `}</style>
                <MyContext.Consumer>{context => (
                    <div id="body" className="my-4">
                        <MetaTrigger
                            pageTitle={context.companyName ? `${context.companyName} - Forum ` : ""}
                            pageDesc={'Forum'}
                        />
                        <Style themes={context.theme_settings} />
                        <div className='row'>
                            <div className='col-md-3'>
                                <div className="bg-white shadow-graph rounded p-3 card-mobile" style={{ top: 0 }}>
                                    {isLogin() == false ?
                                        <Link to={AuthRoutePath.LOGIN} className='text-decoration-none'>
                                            <div className='h6 font-weight-bold'>
                                                {t('forum_please_login')}
                                            </div>
                                        </Link>
                                        :
                                        <Link className="text-decoration-none color-8D8D8D my-2" to={EcommerceRoutePath.CUSTOMER.replace(':id', JSON.parse(Cookies.get('user')).id)}>
                                            <div className="d-flex align-items-center">
                                                <div>
                                                    <CustomImage
                                                        className="mr-3 object-fit-cover"
                                                        style={{ width: 50, height: 50, borderRadius: 42 }}
                                                        folder={PublicStorageFolderPath.customer}
                                                        filename={JSON.parse(Cookies.get('user')).profile_picture}
                                                    />
                                                </div>
                                                <div className='mt-2'>
                                                    <h6 className='h6 font-weight-bold'>{JSON.parse(Cookies.get('user')).name}</h6>
                                                </div>
                                            </div>
                                        </Link>
                                    }
                                    {isLogin() == true &&
                                        <div className='d-flex flex-column mt-3'>
                                            <NavLink to={GeneralRoutePath.FORUM_MY_POST} className="text-decoration-none color-8D8D8D my-2" activeClassName="font-weight-bold accent-color">
                                                <div className="d-flex align-items-center">
                                                    <i className="h6 fas fa-edit mr-2 mt-1"></i>
                                                    <p className="h6 font-weight-semi-bold">
                                                        {t('forum_mypost')}
                                                    </p>
                                                </div>
                                            </NavLink>
                                            <NavLink to={GeneralRoutePath.FORUM_MY_SAVED} className="text-decoration-none color-8D8D8D my-2" activeClassName="font-weight-bold accent-color">
                                                <div className="d-flex align-items-center">
                                                    <i className="h6 fas fa-bookmark mr-2 mt-2"></i>
                                                    <p className="h6 font-weight-semi-bold">
                                                        {t('forum_saved')}
                                                    </p>
                                                </div>
                                            </NavLink>
                                            <NavLink to={GeneralRoutePath.FORUM_MY_LIKED} className="text-decoration-none color-8D8D8D my-2" activeClassName="font-weight-bold accent-color">
                                                <div className="d-flex align-items-center">
                                                    <i className="h6 fas fa-thumbs-up mr-2 mt-1"></i>
                                                    <p className="h6 font-weight-semi-bold">
                                                        {t('forum_liked')}
                                                    </p>
                                                </div>
                                            </NavLink>
                                        </div>
                                    }
                                </div>
                                <div className="bg-white shadow-graph rounded p-3 mt-5 card-mobile" style={{ top: 0 }}>
                                    <div>
                                        <h6 className='small'>{t('forum_category')}</h6>
                                    </div>

                                    <div className='d-flex flex-column'>
                                        <NavLink to={GeneralRoutePath.FORUM_MY_CATEGORY}
                                            onClick={() => onSelectCategory("Semua", null)}
                                            className={`text-decoration-none ${selected === "Semua" ? 'font-weight-semi-bold accent-color' : 'color-6D6D6D'} my-2`}

                                        >
                                            <div className="d-flex align-items-center">
                                                <p className="h6 font-weight-semi-bold">{t('forum_all_categories')}</p>
                                            </div>
                                        </NavLink>
                                        {categories?.map((category) => (
                                            <NavLink onClick={() => onSelectCategory(category.name, category.id)} to={GeneralRoutePath.FORUM_MY_SELECT_CATEGORY.replace(':id', category.id)}
                                                className={`text-decoration-none ${selected === category.name ? 'font-weight-semi-bold accent-color' : 'color-6D6D6D'} my-2`}
                                            // onClick={() => onSelectCategory(category.name, category.id)}
                                            >

                                                <div className="d-flex align-items-center">
                                                    <p className="h6 font-weight-semi-bold ">{category.name}</p>
                                                </div>
                                            </NavLink>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-white shadow-graph rounded p-3 mt-5 card-mobile" style={{ top: 0 }}>
                                    <div>
                                        <h6 className='small'>Forum Master</h6>
                                    </div>

                                    <div className='d-flex flex-column'>
                                        {dataMaster.map((item, index) => (
                                            <NavLink to={EcommerceRoutePath.CUSTOMER.replace(":id", item.user_id)} className="text-decoration-none my-2" activeClassName="font-weight-semi-bold accent-color">
                                                <div className="d-flex align-items-center">
                                                    <p className='accent-color mr-2'>#{index + 1}</p>
                                                    <CustomImage
                                                        folder={PublicStorageFolderPath.customer}
                                                        filename={item.profile_picture}
                                                        className="mr-2"
                                                        style={{ width: 30, height: 30, borderRadius: 50 }} />
                                                    <p className="h6 font-weight-bold">{item.name}</p>
                                                </div>
                                            </NavLink>
                                        ))}

                                    </div>
                                </div>
                            </div>

                            <div className="col-sm-12 col-md-6 col-lg-6 col-xl-6 p-3">
                                <Switch>
                                    <Route path={GeneralRoutePath.FORUM_MY_POST} component={MyPost} />
                                    <Route path={GeneralRoutePath.FORUM_MY_SAVED} component={Saved} />
                                    <Route path={GeneralRoutePath.FORUM_MY_LIKED} component={Liked} />
                                    <Route path={GeneralRoutePath.FORUM_MY_CATEGORY} component={Categories} />
                                    <Route path={GeneralRoutePath.FORUM_MY_SELECT_CATEGORY} component={SelectCategories} />
                                    <Redirect to={GeneralRoutePath.FORUM_MY_CATEGORY} />
                                </Switch>
                            </div>

                            <div className='col-md-3'>
                                <Link className="text-decoration-none color-8D8D8D my-2 card-mobile" onClick={() => onCreateAddForum()}>
                                    <button className="btn btn-sm text-white bgc-accent-color button-nowrap rounded p-2 font-weight-bold mb-3 w-100" >
                                        <i className='fas fa-edit mr-2'></i>
                                        {t('forum_create_new_thread')}
                                    </button>
                                </Link>
                                <div className="bg-white shadow-graph rounded p-3 " style={{ top: 0 }}>
                                    <div>
                                        <h5 className='font-weight-bold'>Hot Threads</h5>
                                    </div>
                                    {dataHotThread && dataHotThread.map((item) => (
                                        <div>
                                            <Link to={
                                                EcommerceRoutePath.CUSTOMER.replace(":id", item.user_id)
                                            }
                                                className="text-decoration-none"
                                            >
                                                <div className="d-flex">
                                                    <div>
                                                        <CustomImage
                                                            className="mr-2"
                                                            style={{ width: 50, height: 50, borderRadius: 50 }}
                                                            folder={item?.user_type === "seller" ? PublicStorageFolderPath.seller : PublicStorageFolderPath.customer}
                                                            filename={item?.picture}
                                                        />
                                                    </div>
                                                    <div className='d-flex  align-items-center'>
                                                        <div>
                                                            <h6 className='font-weight-bold color-black'>{item.name}</h6>
                                                            <p className='color-black fs-small'>{moment(new Date(item?.created_at)).fromNow()}</p>
                                                        </div>
                                                        {/* <div className="">
                                                        <i className="fas fa-check-circle color-EC9700 ml-2 mx-1 small"></i>
                                                    </div> */}
                                                        {/* <div className=''>
                                                        <p
                                                            className='bgc-accent-color'
                                                            style={{
                                                                whiteSpace: "nowrap",
                                                                width: "auto",
                                                                color: "#fff",
                                                                fontSize: 8,
                                                                borderRadius: 5,
                                                                padding: 3
                                                            }}
                                                        >
                                                            <i className="fas fa-store fs-small-10 mr-1"></i>
                                                            Seller
                                                        </p>
                                                    </div> */}
                                                    </div>

                                                </div>
                                            </Link>
                                            <div onClick={() => goToDetails(item.id)} className="cursor-pointer color-black" >
                                                <div className='d-flex flex-column mt-2'>
                                                    <h6 className='h6 font-weight-bold '>
                                                        {item?.title}
                                                    </h6>
                                                    <TextTruncate className="small color-black" lineClamp={5}>
                                                        <TinyMcePreview>{item.content}</TinyMcePreview>
                                                    </TextTruncate>
                                                    <div className='d-flex mt-2 flex-wrap'>
                                                        {item?.categories.length > 0
                                                            &&
                                                            item?.categories.map((category) => (
                                                                <div>
                                                                    <p
                                                                        className='small'
                                                                        style={{
                                                                            backgroundColor: "#eee",
                                                                            width: "auto",
                                                                            height: "auto",
                                                                            color: "#6D6D6D",
                                                                            borderRadius: 50,
                                                                            padding: 8,
                                                                            textAlign: "center",
                                                                            marginRight: 5,
                                                                            marginTop: 10
                                                                        }}
                                                                    >
                                                                        {category?.name}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <hr></hr>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <Link className="float bgc-accent-color color-F6F6F6" onClick={() => onCreateAddForum()}>
                            <i class="fas fa-pen my-float "></i>
                        </Link>
                    </div>
                )}</MyContext.Consumer>
            </Template>
        </>
    )
}

