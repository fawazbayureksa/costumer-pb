import React, { useState, useEffect } from 'react';
import CustomImage, { PublicStorageFolderPath } from '../../../components/helpers/CustomImage';
import MyContext from '../../../components/MyContext';
import Template from '../../../components/Template';
import { Tabs, Tab, Modal } from "react-bootstrap";
import TinyMceEditor, { TinyMceContent, TinyMcePreview } from '../../../components/helpers/TinyMceEditor';
import ReactSelect from 'react-select';
import { Link, useHistory, useParams } from 'react-router-dom';
import axios from 'axios';
import SwalToast from '../../../components/helpers/SwalToast';
import Cookies from 'js-cookie';
import Config from '../../../components/axios/Config';
import moment from 'moment'
import ErrorDiv from '../../../components/helpers/ErrorDiv';
import IsEmpty from '../../../components/helpers/IsEmpty';
import { Options } from './components/ReportCategory';
import { isLogin, isLoginTrue } from './components/IsLogin';
import { useTranslation } from 'react-i18next';
import Comment from './comments/Comment';
import update from 'immutability-helper';
import EcommerceRoutePath from '../../e-commerce/EcommerceRoutePath';
import MetaTrigger from '../../../components/MetaTrigger';
import TextTruncate from '../../../components/helpers/TextTruncate';
import GeneralRoutePath from '../GeneralRoutePath';
const Styles = props => {
    if (props.themes) {
        return (
            <style>{`
                #body {
                    max-width: ${props.themes.site_width.width};
                    margin: 0 auto;
                }
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
                @media (max-width: 767.98px) {
                    .tab-coment {
                        display: none;
                    }                        
                }
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
                        padding:100;
                        width:auto;
                        height:aut0;
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
        );
    } else return null;
};


const DetailThread = () => {
    const { id } = useParams()
    const [modalComment, setModalComment] = useState()
    const [modalReport, setModalReport] = useState()
    const [description, setDescription] = useState("")
    const [dataDetail, setDataDetail] = useState()
    const [modalReplyComment, setModalReplyComment] = useState()
    const [selected, setSelected] = useState([])
    const [error, setError] = useState({})
    const [dataHotThread, setDataHotThread] = useState([])

    const { history } = useHistory()

    useEffect(() => {
        getDetailThread()
        getHotThreads()
    }, [])

    const getDetailThread = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}forum/thread/detailForumThread/${id}`

        let axiosInstance = axios.get(url)
        if (isLogin()) {
            axiosInstance = axios.get(url, Config({ Authorization: `Bearer ${Cookies?.get("token")}` }))
        }

        axiosInstance.then(response => {
            let data = response.data.data;
            setDataDetail(data);
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

    const onSaveComment = (idComment, descriptionReply, getComments) => {


        let errors = []
        if (IsEmpty(descriptionReply)) {
            errors.descReply = "Komentar harus diisi"
            setError(errors)
            return
        }

        else {
            let url = `${process.env.REACT_APP_BASE_API_URL}forum/thread/comment/save`

            let body = {
                forum_thread_id: parseInt(id),
                content: descriptionReply,
                quote_id: idComment,
                user_type: "customer"
            }
            axios.post(url, body, Config({
                Authorization: `Bearer ${Cookies.get("token")}`,
            })).then(response => {
                console.log(response.data.message);
                SwalToast.fire({
                    icon: "success",
                    title: response.data.message
                })
                setModalComment(false)
                setModalReplyComment(false)
                getComments()
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
    }

    const onLikeThread = () => {
        if (!isLogin()) {
            SwalToast.fire({
                icon: "error",
                title: t('forum_please_login')
            })
            return
        } else {
            let url = `${process.env.REACT_APP_BASE_API_URL}forum/thread/sendLike`

            let body = {
                forum_thread_id: parseInt(id)
            }

            axios.post(url, body, Config({
                Authorization: `Bearer ${Cookies.get("token")}`,
            })).then(response => {
                console.log(response.data.message);
                getDetailThread()
            }).catch(error => {
                console.log(error);
            })
        }
    }


    const onUnlikeThread = () => {
        if (!isLogin()) {
            SwalToast.fire({
                icon: "error",
                title: "Silahkan login terlebih dahulu"
            })
            return
        } else {
            let url = `${process.env.REACT_APP_BASE_API_URL}forum/thread/unLike`

            let body = {
                forum_thread_id: parseInt(id)
            }
            axios.post(url, body, Config({
                Authorization: `Bearer ${Cookies.get("token")}`,
            })).then(response => {
                console.log(response.data.message);
                getDetailThread()
            }).catch(error => {
                console.log(error);
            })
        }
    }


    const onSaveBookmark = () => {
        if (!isLogin()) {
            SwalToast.fire({
                icon: "error",
                title: t('forum_please_login')
            })
        } else {
            let url = `${process.env.REACT_APP_BASE_API_URL}forum/thread/bookmark/save`

            let body = {
                forum_thread_id: parseInt(id)
            }

            axios.post(url, body, Config({
                Authorization: `Bearer ${Cookies.get("token")}`,
            })).then(response => {
                console.log(response.data.message);
                SwalToast.fire({
                    icon: "success",
                    title: response.data.message
                })
                getDetailThread()
            }).catch(error => {
                console.log(error.response.data)
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
    }

    const onDeleteBookmark = () => {

        let url = `${process.env.REACT_APP_BASE_API_URL}forum/thread/bookmark/delete/${id}`

        axios.delete(url, Config({
            Authorization: `Bearer ${Cookies.get("token")}`,
        })).then(response => {
            console.log(response.data.message);
            SwalToast.fire({
                icon: "success",
                title: response.data.message
            })
            getDetailThread()
        }).catch(error => {
            console.log(error.response.data)
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

    const onSelectedCategory = (e) => {
        setSelected(e)
    }

    const validation = () => {
        let errors = []
        let validate = true

        if (selected.length == 0) {
            errors.select = "Pilih Kategori terlebih dahulu"
            validate = false
        }
        else if (description == "") {
            errors.desc = "Keterangan harus diisi"
            validate = false
        }

        setError(errors)
        return validate
    }

    const onReportThread = () => {

        if (!validation()) return

        let url = `${process.env.REACT_APP_BASE_API_URL}forum/thread/report/save`

        let category = []
        selected.forEach(i => category.push(i.value))

        let body = {
            forum_thread_id: parseInt(id),
            description: description,
            category: category,
        }

        axios.post(url, body, Config({
            Authorization: `Bearer ${Cookies.get("token")}`,
        })).then(response => {
            console.log(response.data.message);
            SwalToast.fire({
                icon: "success",
                title: response.data.message
            })
            getDetailThread()
            setModalReport(false)
            setSelected()
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

    const onComment = () => {
        if (!isLogin()) {
            SwalToast.fire({
                icon: "error",
                title: t('forum_please_login')
            })
        } else {
            setModalComment(true)
        }
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

    const onReport = () => {
        if (!isLogin()) {
            SwalToast.fire({
                icon: "error",
                title: "Silahkan login terlebih dahulu"
            })
        } else {
            setModalReport(true)
        }
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
            // history.location.pathname(GeneralRoutePath.FORUM_DETAIL_THREAD.replace(':id', id_thread))
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
                {dataDetail &&
                    <MyContext.Consumer>{context => (
                        <div id="body" className="my-4">
                            <MetaTrigger
                                pageTitle={`${dataDetail?.title}`}
                                pageDesc={'Detail Thread'}
                            />
                            <Styles themes={context.theme_settings} />
                            <div className="row">
                                <div className='col-md-9'>
                                    <div className="bg-white shadow-graph rounded p-3 " style={{ top: 0 }}>
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <Link to={EcommerceRoutePath.CUSTOMER.replace(":id", dataDetail.user_id)} className='text-decoration-none'>
                                                <div className='d-flex'>
                                                    <div>
                                                        <CustomImage
                                                            folder={PublicStorageFolderPath.customer}
                                                            filename={dataDetail?.picture}
                                                            style={{ width: 25, height: 25, borderRadius: 50 }}
                                                            className="mr-2"
                                                        />
                                                    </div>
                                                    <div className=' align-self-center'>
                                                        <h6 className='h6 font-weight-bold color-black'>{dataDetail?.name}</h6>
                                                        <p className='small color-black'>{moment(new Date(dataDetail?.created_at)).fromNow()}</p>
                                                    </div>
                                                    {/* <div>
                                                    <i className="fas fa-check-circle color-EC9700 mx-1"></i>
                                                </div> */}
                                                </div>
                                            </Link>
                                            {dataDetail?.is_bookmark === false ?
                                                <div className='cursor-pointer color-6D6D6D' onClick={() => onSaveBookmark()}>
                                                    <i class={`fas fa-bookmark h6`}></i>
                                                </div>
                                                :
                                                <div className='cursor-pointer accent-color' onClick={() => onDeleteBookmark()}>
                                                    <i className="fas fa-bookmark h6"></i>
                                                </div>
                                            }
                                        </div>
                                        <h4 className='h4 color-black font-weight-bold'>
                                            {dataDetail?.title}
                                        </h4>
                                        <TinyMceContent className='body color-black'>
                                            {dataDetail?.content}
                                        </TinyMceContent>
                                        <div className='d-flex mt-2 flex-wrap'>
                                            {dataDetail?.categories.length > 0
                                                &&
                                                dataDetail?.categories.map((category) => (
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
                                        <div className='d-flex mt-2 justify-content-between mt-3'>
                                            <div className='d-flex align-items-center'>
                                                {dataDetail.is_like === true ?
                                                    (
                                                        <div onClick={() => onUnlikeThread(dataDetail.id)} className='cursor-pointer accent-color'>
                                                            <i className="fas fa-thumbs-up mr-2"></i>
                                                        </div>
                                                    )
                                                    :
                                                    (
                                                        <div onClick={() => onLikeThread(dataDetail.id)} className='cursor-pointer color-6D6D6D'>
                                                            <i className="fas fa-thumbs-up mr-2 "></i>
                                                        </div>
                                                    )
                                                }
                                                {/* </div> */}
                                                <p className='small'>{dataDetail.total_like}</p>
                                            </div>
                                            <div className='d-flex align-items-center'>
                                                <div className='d-flex align-items-center'>
                                                    <i className="fas fa-share-alt color-6D6D6D mr-3"></i>
                                                    <h6 className='small mt-2 mr-4'>Bagikan</h6>
                                                    {!isLoginTrue(dataDetail.user_id) &&
                                                        <>
                                                            <i className="fas fa-exclamation-triangle color-6D6D6D mr-2"></i>
                                                            <h6 className='small mt-2 pointer' onClick={() => onReport()}>{t('forum_report')}</h6>
                                                        </>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='mt-4'>
                                        <div className='float-right tab-coment ml-2'>
                                            <button onClick={() => onComment()} className="btn btn-sm text-white bgc-EC9700 button-nowrap rounded p-2 font-weight-bold" style={{ width: 360, height: 45 }}>
                                                {t('forum_create_comment')}
                                            </button>
                                        </div>
                                        <div className=''>
                                            <Comment
                                                id_thread={id}
                                                saveComment={onSaveComment}
                                                modalComment={modalComment}
                                                setModalComment={setModalComment}
                                                setModalReplyComment={setModalReplyComment}
                                                modalReplyComment={modalReplyComment}
                                                error={error}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className='col-sm-12 col-md-3'>
                                    <div className="bg-white shadow-graph rounded p-3 " style={{ top: 0 }}>
                                        <div>
                                            <h5 className='font-weight-bold'>Hot Threads</h5>
                                        </div>
                                        {dataHotThread && dataHotThread.map((item) => (
                                            <div>
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
                                                <div onClick={() => goToDetails(item.id)} className="cursor-pointer color-black" >
                                                    <div className='d-flex flex-column mt-2'>
                                                        <h6 className='h6 font-weight-bold '>
                                                            {item?.title}
                                                        </h6>
                                                        <TextTruncate className="small color-black" lineClamp={3}>
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
                            <button className="float btn btn-sm text-white bgc-EC9700 button-nowrap mx-4 rounded p-2 font-weight-bold" onClick={() => onComment()}>
                                <i class="fas fa-pen"></i> {t('forum_create_comment')}
                            </button>
                        </div>
                    )}</MyContext.Consumer>
                }
            </Template>
            <Modal
                size="lg"
                centered
                show={modalReport}
                onHide={() => setModalReport(false)}>
                <Modal.Header closeButton>
                    <h6 className='font-weight-bold'>
                        {t('forum_report')} Thread
                    </h6>
                </Modal.Header>
                <Modal.Body>
                    <div className="">
                        <h6 className='small' style={{ textAlign: "justify" }}>Hai, {Cookies.get('user') && JSON.parse(Cookies.get('user')).name} Mohon maaf atas ketidaknyamanan Anda. Bantu Tokodapur untuk menyajikan konten yang berkualitas yuk. Laporkan pada kami jika menemukan konten yang mengganggu kenyamanan bersama.</h6>

                        <h6 className='small'>{t('forum_category')} {t('forum_report')}</h6>
                        <div className='w-50'>
                            <ReactSelect
                                options={Options}
                                isMulti
                                onChange={(c) => onSelectedCategory(c)}
                            />
                            <ErrorDiv error={error.select} />
                        </div>
                        <div className='mt-3 w-100'>
                            <textarea
                                style={{
                                    color: '#000000',
                                    backgroundColor: '#FFF',
                                    borderWidth: 0.5,
                                    borderColor: "#AAAAAA",
                                    borderRadius: 10,
                                    height: 140,
                                    padding: 10
                                }}
                                className='w-100'
                                name='report_desc'
                                onChange={(e) => setDescription(e.target.value)}
                            >
                            </textarea>
                            <ErrorDiv error={error.desc} />
                        </div>
                        <div className='d-flex justify-content-end align-items-center mt-3'>
                            <div className=''>
                                <button onClick={() => setModalReport(false)} className="btn btn-sm border-CED4DA button-nowrap  mx-3 rounded p-2 font-weight-bold" style={{ width: 150 }}>
                                    {t('forum_back')}
                                </button>
                                <button onClick={() => onReportThread()} className="btn btn-sm text-white bgc-EC9700 button-nowrap rounded p-2 font-weight-bold" style={{ width: 150 }}>
                                    {t('forum_send')}
                                </button>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default DetailThread;
