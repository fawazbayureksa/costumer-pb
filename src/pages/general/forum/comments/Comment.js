import axios from 'axios';
import Cookies from 'js-cookie';
import moment from 'moment';
import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import ReactSelect from 'react-select';
import Config from '../../../../components/axios/Config';
import CustomImage, { PublicStorageFolderPath } from '../../../../components/helpers/CustomImage';
import ErrorDiv from '../../../../components/helpers/ErrorDiv';
import SwalToast from '../../../../components/helpers/SwalToast';
import TinyMceEditor, { TinyMceContent } from '../../../../components/helpers/TinyMceEditor';
import { isLogin, isLoginTrue } from '../components/IsLogin';
import { Options } from '../components/ReportCategory';
import PaginateThread from '../components/PaginateThread'
import { useTranslation } from 'react-i18next';

let Style = () => {
    return (
        <style>
            {`
                #as-react-datatable-table-head {
                    display: none;
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

const Comment = ({ id_thread, saveComment, modalComment, setModalComment, modalReplyComment, setModalReplyComment, error, order }) => {
    const [description, setDescription] = useState()
    const [selected, setSelected] = useState([])
    const [reportDesc, setReportDesc] = useState("")
    const [dataComment, setDataComment] = useState([])
    const [idComment, setIdComment] = useState()
    const [modalReport, setModalReport] = useState(false)
    const [initialDesc, setInitialDesc] = useState(null)
    const [errorComment, setErrorComment] = useState({})
    const [lastPage, setLastPage] = useState()
    const [page, setPage] = useState(1)
    const [detailComment, setDetailComment] = useState()
    const [currentTab, setCurrentTab] = useState("");
    const [modalDelete, setModalDelete] = useState(false)
    const onDescriptionChange = (value) => {
        setDescription(value)
    }


    const tabStatus = [
        { id: "", text: "Semua" },
        { id: "new", text: "Terbaru" },
        { id: "popular", text: "Popular" }
    ]


    useEffect(() => {
        setInitialDesc('')
    }, [])

    useEffect(() => {
        getComments()
    }, [page, currentTab])


    const getComments = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}forum/thread/comment/${id_thread}`
        let body = {
            page: page,
            per_page: 10,
            order: currentTab
        }

        let axiosInstance = axios.get(url, Config({}, body))

        if (isLogin()) {
            axiosInstance = axios.get(url, Config({ Authorization: `Bearer ${Cookies?.get("token")}` }, body))
        }

        axiosInstance.then(response => {
            let data = response.data.data;
            setDataComment(data.data);
            setLastPage(data.last_page)
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

    const onLikeComment = (id_comment) => {
        if (!isLogin()) {
            SwalToast.fire({
                icon: "error",
                title: "Silahkan login terlebih dahulu"
            })
            return
        } else {
            let url = `${process.env.REACT_APP_BASE_API_URL}forum/thread/comment/sendLikeComment`

            let body = {
                forum_thread_id: parseInt(id_thread),
                forum_thread_comment_id: id_comment
            }

            axios.post(url, body, Config({
                Authorization: `Bearer ${Cookies.get("token")}`,
            })).then(response => {
                console.log(response.data.message);
                getComments()
            }).catch(error => {
                let url = `${process.env.REACT_APP_BASE_API_URL}forum/thread/comment/unlikeComment`
                axios.post(url, body, Config({
                    Authorization: `Bearer ${Cookies.get("token")}`,
                })).then(response => {
                    console.log(response.data.message);
                    getComments()
                })
            })
        }
    }
    const onUnlikeComment = (id_comment) => {
        if (!isLogin()) {
            SwalToast.fire({
                icon: "error",
                title: "Silahkan login terlebih dahulu"
            })
            return
        } else {
            let url = `${process.env.REACT_APP_BASE_API_URL}forum/thread/comment/unlikeComment`

            let body = {
                forum_thread_id: parseInt(id_thread),
                forum_thread_comment_id: id_comment
            }

            axios.post(url, body, Config({
                Authorization: `Bearer ${Cookies.get("token")}`,
            })).then(response => {
                console.log(response.data.message);
                getComments()
            }).catch(error => {
                console.log(error)
            })
        }
    }

    const getDetailComment = (id_comment) => {
        let url = `${process.env.REACT_APP_BASE_API_URL}forum/thread/comment/detail/${id_comment}`

        axios.get(url, Config({
            Authorization: `Bearer ${Cookies.get("token")}`,
        })).then(response => {
            let data = response.data.data;
            setDetailComment(data);
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

    const handleReplyComment = (id_comment) => {
        if (!isLogin()) {
            SwalToast.fire({
                icon: "error",
                title: "Silahkan login terlebih dahulu"
            })
        } else {
            getDetailComment(id_comment)
            setModalReplyComment(true)
            setIdComment(id_comment)
        }
    }
    const handleModalReport = (id_comment) => {
        if (!isLogin()) {
            SwalToast.fire({
                icon: "error",
                title: "Silahkan login terlebih dahulu"
            })
        } else {
            setIdComment(id_comment)
            setModalReport(true)
        }
    }

    const onDeleteComment = (id_comment) => {
        let url = `${process.env.REACT_APP_BASE_API_URL}forum/thread/comment/deleteComment`

        let body = {
            forum_thread_id: parseInt(id_thread),
            forum_thread_comment_id: idComment,
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
            setModalDelete()
            setIdComment()
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
        else if (reportDesc == "") {
            errors.reportDesc = "Keterangan harus diisi"
            validate = false
        }

        setErrorComment(errors)
        return validate
    }

    const onReportComment = () => {

        if (!validation()) return

        let url = `${process.env.REACT_APP_BASE_API_URL}forum/thread/comment/report/save`

        let category = []
        selected.forEach(i => category.push(i.value))

        let body = {
            forum_thread_id: parseInt(id_thread),
            forum_thread_comment_id: idComment,
            description: reportDesc,
            category: category,
        }
        // console.log(body)
        // return

        axios.post(url, body, Config({
            Authorization: `Bearer ${Cookies.get("token")}`,
        })).then(response => {
            console.log(response.data.message);
            SwalToast.fire({
                icon: "success",
                title: response.data.message
            })
            getComments()
            setModalReport(false)
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

    const handlePage = (selected) => {
        setPage(selected)
    }

    const { t } = useTranslation();

    return (
        <div>
            <Style />
            <div className="stepper px-4 pt-2 clearfix mb-3" style={{ borderBottom: '2px solid #ECECEC' }}>
                {
                    tabStatus.map((value) => (
                        <CustomLink key={value.id} onClick={() => setCurrentTab(value.id)} id={value.id} current_tab={currentTab} Text={value.text} ></CustomLink>
                    ))
                }
            </div>
            {dataComment.length > 0 ?
                dataComment.map((coment) => (
                    <div className="bg-white shadow-graph rounded p-3 mb-3" style={{ top: 0 }}>
                        <div className='d-flex justify-content-between'>
                            <div className='d-flex'>
                                <div>
                                    <CustomImage
                                        folder={PublicStorageFolderPath.customer}
                                        filename={coment?.profile_picture}
                                        style={{ width: 25, height: 25, borderRadius: 50 }}
                                        className="mr-2"
                                    />
                                </div>
                                <div className='align-self-center mr-1'>
                                    <p className='h6 font-weight-bold button-nowrap'>{coment?.name}</p>
                                </div>
                                {/* <div className="align-self-center"> */}
                                {/* <i className="fas fa-check-circle accent-color mx-1"></i> */}
                                {/* </div> */}
                                <div className='align-self-center'>
                                    <p className='small'>{moment(new Date(coment?.created_at)).fromNow()}</p>
                                </div>
                            </div>
                            <div>
                                {isLoginTrue(coment?.user_id) &&
                                    <div className="align-self-center">
                                        {/* <div onClick={() => onDeleteComment(coment?.id)} className='cursor-pointer'> */}
                                        <div onClick={() => { setModalDelete(true); setIdComment(coment?.id) }} className='cursor-pointer'>
                                            <i className="fas fa-trash color-6D6D6D mx-1"></i>
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                        {(coment?.data_quote != null && coment?.quote_id != 0) &&
                            <div className="bgc-F6F6F6 rounded p-3 my-3" style={{ top: 0 }}>
                                <div className='d-flex justify-content-between'>
                                    <div className='d-flex'>
                                        <div>
                                            <CustomImage
                                                folder={PublicStorageFolderPath.customer}
                                                filename={coment?.data_quote?.profile_picture}
                                                className="mr-3"
                                                style={{ width: 25, height: 25, borderRadius: 50 }} />
                                        </div>
                                        <div className='align-self-center'>
                                            <p className='h6 font-weight-bold'>{coment?.data_quote?.name}</p>
                                            <p className='small'>{moment(new Date(coment?.data_quote?.created_at)).fromNow()}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className='my-1'>
                                    <TinyMceContent>
                                        {coment?.data_quote?.content}
                                    </TinyMceContent>
                                </div>
                            </div>
                        }
                        {(coment?.data_quote === null && coment?.quote_id != 0) &&
                            <div className="bgc-F6F6F6 rounded p-3 my-3" style={{ top: 0 }}>
                                <div className='my-1'>
                                    <i>{t('forum_comment_delete')}</i>
                                </div>
                            </div>
                        }
                        <div className='my-3'>
                            <TinyMceContent>
                                {coment?.content}
                            </TinyMceContent>
                        </div>
                        <div className='d-flex mt-2 justify-content-between mt-3'>
                            <div className='d-flex align-items-center'>
                                {coment.is_like === true ?
                                    (
                                        <div onClick={() => onUnlikeComment(coment.id)} className='cursor-pointer accent-color'>
                                            <i className="fas fa-thumbs-up mr-2"></i>
                                        </div>
                                    )
                                    :
                                    (
                                        <div onClick={() => onLikeComment(coment.id)} className='cursor-pointer color-6D6D6D'>
                                            <i className="fas fa-thumbs-up mr-2 "></i>
                                        </div>
                                    )
                                }
                                <p className='small'>{coment.total_like}</p>
                            </div>
                            <div className='d-flex align-items-center'>
                                <div className='d-flex align-items-center'>
                                    <i className="fas fa-reply color-6D6D6D mr-3"></i>
                                    <h6 className='small mt-2 mr-4 pointer' onClick={() => handleReplyComment(coment?.id)}>{t('forum_reply')}</h6>
                                    {!isLoginTrue(coment.user_id) &&
                                        <>
                                            <i className="fas fa-exclamation-triangle color-6D6D6D mr-2"></i>
                                            <div className='cursor-pointer' onClick={() => handleModalReport(coment?.id)}>
                                                <h6 className='small mt-2' >{t('forum_report')}</h6>
                                            </div>
                                        </>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                ))
                :
                <div>
                    <div className="d-flex justify-content-center">
                        <img
                            src={`/images/empty_folder.png`}
                            className="empty-state"
                            onError={event => event.target.src = `/images/placeholder.gif`}
                            style={{ width: 250, height: "auto" }}
                        />
                    </div>
                    <h5 className='h5 text-center'>{t('forum_no_comment')}</h5>
                </div>
            }
            <PaginateThread
                data={dataComment}
                lastPage={lastPage}
                handlePage={handlePage}
                page={page}
            />
            <Modal
                size="lg"
                centered
                show={modalReplyComment}
                onHide={() => setModalReplyComment(false)}>
                <Modal.Header closeButton>
                    <h6 className='font-weight-bold'>
                        Berikan Komentar
                    </h6>
                </Modal.Header>
                <Modal.Body>
                    {detailComment &&
                        <div className="">
                            <div className="bgc-F5F5F5 shadow-graph rounded p-3 my-3 border-EC9700" style={{ top: 0 }}>
                                <div className='d-flex justify-content-between'>
                                    <div className='d-flex align-items-center'>
                                        <div>
                                            <CustomImage
                                                folder={PublicStorageFolderPath.customer}
                                                filename={detailComment?.profile_picture}
                                                style={{ width: 50, height: 50, borderRadius: "50%" }}
                                                className="mr-2"
                                            />
                                        </div>
                                        <div className='align-self-center'>
                                            <p className='h6 font-weight-bold'>{detailComment?.name}</p>
                                            <p className='small'>{moment(new Date(detailComment?.created_at)).fromNow()}</p>
                                        </div>
                                        <div className="h6">
                                            <i className="fas fa-check-circle accent-color mx-1"></i>
                                        </div>
                                    </div>
                                </div>
                                <div className='mt-3'>
                                    <TinyMceContent>
                                        {detailComment?.content}
                                    </TinyMceContent>
                                </div>
                            </div>
                            {initialDesc != null &&
                                <TinyMceEditor
                                    onEditorChange={(content) => onDescriptionChange(content)}
                                    initialValue={initialDesc}
                                />
                            }
                            {/* <i className='text-danger'>*{t('forum_max_comment')} </i> */}
                            <ErrorDiv error={error.descReply} />

                            <div className='d-flex justify-content-end align-items-center mt-3'>
                                <div className=''>
                                    <button onClick={() => setModalReplyComment(false)} className="btn btn-sm border-CED4DA button-nowrap  mx-3 rounded p-2 font-weight-bold" style={{ width: 150 }}>
                                        kembali
                                    </button>
                                    <button onClick={() => saveComment(idComment, description, getComments)} className="btn btn-sm text-white bgc-EC9700 button-nowrap rounded p-2 font-weight-bold" style={{ width: 150 }}>
                                        Kirim
                                    </button>
                                </div>
                            </div>
                        </div>
                    }
                </Modal.Body>
            </Modal>
            <Modal
                size="lg"
                centered
                show={modalComment}
                onHide={() => setModalComment(false)}>
                <Modal.Header closeButton>
                    <h6 className='font-weight-bold'>
                        {t('forum_create_comment')}
                    </h6>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        {initialDesc != null &&
                            <TinyMceEditor
                                onEditorChange={(content) => onDescriptionChange(content)}
                                initialValue={initialDesc}
                            />
                        }
                        {/* <i className='text-danger'>*{t('forum_max_comment')} </i> */}
                        <ErrorDiv error={error.descReply} />
                        <div className='d-flex justify-content-end align-items-center mt-3'>
                            <div className=''>
                                <button onClick={() => setModalComment(false)} className="btn btn-sm border-CED4DA button-nowrap  mx-3 rounded p-2 font-weight-bold" style={{ width: 150 }}>
                                    {t('forum_back')}
                                </button>
                                <button onClick={() => saveComment(null, description, getComments)} className="btn btn-sm text-white bgc-EC9700 button-nowrap rounded p-2 font-weight-bold" style={{ width: 150 }}>
                                    {t('forum_send')}
                                </button>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
            {/* Modal Report Coment */}
            <Modal
                size="lg"
                centered
                show={modalReport}
                onHide={() => { setModalReport(false); setSelected() }}>
                <Modal.Header closeButton>
                    <h6 className='font-weight-bold'>
                        {t('forum_report')}
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
                                value={selected}
                            />
                            <ErrorDiv error={errorComment.select} />
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
                                onChange={(e) => setReportDesc(e.target.value)}
                            >
                            </textarea>
                            <ErrorDiv error={errorComment.reportDesc} />
                        </div>
                        <div className='d-flex justify-content-end align-items-center mt-3'>
                            <div className=''>
                                <button onClick={() => setModalReport(false)} className="btn btn-sm border-CED4DA button-nowrap  mx-3 rounded p-2 font-weight-bold" style={{ width: 150 }}>
                                    {t('forum_back')}
                                </button>
                                <button onClick={() => onReportComment()} className="btn btn-sm text-white bgc-EC9700 button-nowrap rounded p-2 font-weight-bold" style={{ width: 150 }}>
                                    {t('forum_send')}
                                </button>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>

            <Modal
                centered
                show={modalDelete}
                onHide={() => setModalDelete(false)}>
                <Modal.Header closeButton>
                    <h6 className="font-weight-bold text-center">{t("forum_ask_delete")}</h6>
                </Modal.Header>
                <Modal.Body>
                    <div className='d-flex justify-content-end'>
                        <button type="button" className="w-50 btn bgc-FFFFFF border-95A4AF text-dark font-weight-bold " onClick={() => setModalDelete(false)}>Tidak</button>
                        <button type="button" className="w-50 btn text-white font-weight-bold bgc-EC9700  ml-2" onClick={onDeleteComment}>Ya</button>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default Comment;

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