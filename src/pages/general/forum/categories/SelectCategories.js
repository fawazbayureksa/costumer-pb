import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import Config from '../../../../components/axios/Config';
import CustomImage, { PublicStorageFolderPath } from '../../../../components/helpers/CustomImage';
import SwalToast from '../../../../components/helpers/SwalToast';
import GeneralRoutePath from '../../GeneralRoutePath';
import { TinyMcePreview } from '../../../../components/helpers/TinyMceEditor';
import moment from 'moment';
import ReactSelect from 'react-select';
import ErrorDiv from '../../../../components/helpers/ErrorDiv';
import { Modal } from "react-bootstrap";
import { Options } from '../components/ReportCategory';
import { isLogin } from '../components/IsLogin';
import Paginate from '../../../../components/helpers/Paginate';
import { useTranslation } from 'react-i18next';
import EcommerceRoutePath from '../../../e-commerce/EcommerceRoutePath';
import SelectCategory from '../components/SelectCategory';
import TextTruncate from '../../../../components/helpers/TextTruncate';

let Style = () => {
    return (
        <style>
            {`
                .stepper .active {
                    border-bottom: 2px solid #EC9700;
                    color: #EC9700 !important;
                }
            `}
        </style>
    )
};

const SelectCategories = () => {
    const [data, setData] = useState([])
    const [ids, setIds] = useState([])
    let history = useHistory();
    const [selected, setSelected] = useState([])
    const [modalReport, setModalReport] = useState()
    const [description, setDescription] = useState("")
    const [error, setError] = useState({})
    const [lastPage, setLastPage] = useState(0)
    const [page, setPage] = useState(1)
    const [idCategory, setIdCategory] = useState()
    const [listCategories, setListCategories] = useState([])
    const [search, setSearch] = useState('');
    const [tabName, setTabName] = useState([]);
    const [currentTab, setCurrentTab] = useState("");

    const { id } = useParams();


    useEffect(() => {
        if (id) getThread(id)
        else return
    }, [page, id, search])

    useEffect(() => {
        if (currentTab) getThread(currentTab)
        else return
    }, [page, currentTab, search])

    useEffect(() => {
        getCategories()
    }, [id])


    const getCategories = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}forum/categories/get`;
        let category = []
        axios.get(url, Config({
            Authorization: `Bearer ${Cookies.get("token")}`,
        })).then(response => {
            let data = response.data.data;
            setListCategories(data)
            let x = data.filter((item) => item.parent_id === parseInt(id))
            setTabName(x)
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

    const getThread = (id) => {

        let url = `${process.env.REACT_APP_BASE_API_URL}forum/thread/get`;
        let params = {
            page: page,
            per_page: 10,
            search: search,
            category_id: id
        }

        let axiosInstance = axios.get(url, Config({}, params))

        if (isLogin()) {
            axiosInstance = axios.get(url, Config({ Authorization: `Bearer ${Cookies?.get("token")}` }, params))
        }
        axiosInstance.then(response => {
            let data = response.data.data;
            setData(data.data);
            setLastPage(data.last_page)

        }).catch(error => {
            console.log(error.response)
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

    const onLikeThread = (id) => {
        if (!isLogin()) {
            SwalToast.fire({
                icon: "error",
                title: "Silahkan login terlebih dahulu"
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
                getThread()
            }).catch(error => {
                console.log(error);
            })
        }
    }

    const onUnlikeThread = (id) => {
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
                getThread()
            }).catch(error => {
                console.log(error);
            })
        }
    }

    const handleModal = (id) => {
        if (!isLogin()) {
            SwalToast.fire({
                icon: "error",
                title: "Silahkan login terlebih dahulu"
            })
        } else {
            setModalReport(true)
            setIds(id)
        }
    }

    const onReportThread = () => {

        if (!validation()) return

        let url = `${process.env.REACT_APP_BASE_API_URL}forum/thread/report/save`

        let category = []
        selected.forEach(i => category.push(i.value))

        let body = {
            forum_thread_id: parseInt(ids),
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
            getThread()
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
    const onSelectedCategory = (e) => {
        setSelected(e)
    }

    const onChangeStatus = (id_thread) => {
        if (!isLogin()) {
            SwalToast.fire({
                icon: "error",
                title: "Silahkan login terlebih dahulu"
            })
        } else {

            let url = `${process.env.REACT_APP_BASE_API_URL}forum/thread/bookmark/save`;

            let data = {
                forum_thread_id: id_thread,
            }
            // console.log(data);
            // return
            axios.post(url, data, Config({
                Authorization: `Bearer ${Cookies.get('token')}`
            })).then(response => {
                SwalToast.fire({ icon: "success", title: response.data.message })
                getThread()
            }).catch(error => {
                console.log(error);
                if (error.response) {
                    console.log(error.response.data);
                    SwalToast.fire({ icon: "error", title: error.response.data.message })
                }
            })
        }
    }

    const validation = () => {
        let validate = true
        let errors = []
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

    const handlePage = (selected) => {
        setPage(selected)
    }

    const { t } = useTranslation()

    const handleCategory = (selected) => {
        setIdCategory(selected)
    }


    return (
        <>
            <Style />
            <div className="stepper px-4 pt-2 clearfix mb-3" style={{ borderBottom: '2px solid #ECECEC' }}>
                {
                    tabName.map((value) => (
                        <CustomLink
                            key={value.id}
                            onClick={() => setCurrentTab(value.id)}
                            id={value.id}
                            current_tab={currentTab}
                            Text={value.name} >
                        </CustomLink>
                    ))
                }
            </div>
            <div className='my-2'>
                <SelectCategory
                    listCategories={listCategories}
                    handleCategory={handleCategory}
                    idCategory={idCategory}
                />
            </div>
            <div className='row my-3'>
                <div className='col-3'>
                    <h4 className='h4 font-weight-bold'>Thread</h4>
                </div>
                <div className='col-9'>
                    <div class="input-group w-100">
                        <input
                            type="text"
                            class="form-control"
                            placeholder="Cari Thread"
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <div class="input-group-append">
                            <button className='btn bgc-accent-color'>
                                <i className="fa fa-search" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {data.length > 0 ? data.map((item) => (
                <div className="bg-white shadow-graph rounded p-3 mb-3" style={{ top: 0 }} key={item.id}>
                    <Link to={
                        EcommerceRoutePath.CUSTOMER.replace(":id", item.user_id)
                    }
                        className="text-decoration-none"
                    >
                        <div className="d-flex align-items-center">
                            <div>

                                <CustomImage
                                    folder={item?.user_type === "seller" ? PublicStorageFolderPath.seller : PublicStorageFolderPath.customer}
                                    filename={item?.picture}
                                    style={{ width: 50, height: 50, borderRadius: 50 }}
                                    className="mr-2"
                                />
                            </div>
                            <div>
                                <div className='d-flex align-items-center'>
                                    <h6 className='h6 font-weight-bold color-black'>{item.name}</h6>
                                    {/* <i className="fas fa-check-circle accent-color mx-1 align-self-start mt-1"></i> */}
                                    <div className='align-self-start ml-2'>
                                        {item?.user_type === "seller" &&
                                            <div>
                                                <p
                                                    className='bgc-accent-color'
                                                    style={{
                                                        width: "auto",
                                                        color: "#fff",
                                                        fontSize: 10,
                                                        borderRadius: 5,
                                                        padding: 3
                                                    }}
                                                >
                                                    <i class="fas fa-store mr-1"></i>
                                                    Seller
                                                </p>
                                            </div>
                                        }
                                    </div>
                                </div>
                                <p className='small color-black'>
                                    {/* {moment(new Date(item?.created_at)).fromNow()} */}
                                    {moment(new Date(item?.created_at)).fromNow()}
                                </p>
                            </div>
                        </div>
                    </Link>
                    <div onClick={() => goToDetails(item.id)} className="cursor-pointer color-black" >
                        <div className='d-flex flex-column mt-4'>
                            <h4 className='h4 font-weight-bold '>
                                {item?.title}
                            </h4>
                            <TextTruncate className="color-black" lineClamp={5}>
                                <TinyMcePreview>{item.content}</TinyMcePreview>
                            </TextTruncate>
                        </div>
                        <div className='d-flex mt-2 flex-wrap'>
                            {item?.categories.map((category) => (
                                <div>
                                    <p
                                        className='small color-black'
                                        style={{
                                            backgroundColor: "#eee",
                                            width: "auto",
                                            height: "auto",
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
                    <div className='d-flex mt-2 justify-content-between mt-3'>
                        <div className='d-flex align-items-center'>
                            {item.is_like === true ?
                                (
                                    <div onClick={() => onUnlikeThread(item.id)} className='cursor-pointer accent-color'>
                                        <i className="fas fa-thumbs-up mr-2"></i>
                                    </div>
                                )
                                :
                                (
                                    <div onClick={() => onLikeThread(item.id)} className='cursor-pointer color-6D6D6D'>
                                        <i className="fas fa-thumbs-up mr-2 "></i>
                                    </div>
                                )
                            }
                            <p className='small'>{item.total_like}</p>
                        </div>
                        <div className='d-flex'>
                            <i className="fas fa-comments mr-2 color-6D6D6D"></i>
                            <p className='small'>{item.total_comment}</p>
                        </div>
                        <div className='d-flex'>
                            <i className="fas fa-eye mr-2 color-6D6D6D"></i>
                            <p className='small'>{item.counter}</p>
                        </div>
                        {/* <div className='cursor-pointer' onClick={() => onDeleteThread(item?.id)}>
                            <i className="fas fa-trash color-6D6D6D" ></i>
                        </div> */}
                        <div class="dropdown mr-1 cursor-pointer btn-group dropleft">
                            <i className="fas fa-ellipsis-v color-6D6D6D" data-toggle="dropdown" aria-expanded="false" data-offset="10,20"></i>
                            <div class="dropdown-menu">
                                <div class="dropdown-item" onClick={() => handleModal(item.id)}>{t('forum_report')}</div>
                                <div class="dropdown-item" onClick={() => onChangeStatus(item.id)}>{t('forum_save')}</div>
                            </div>
                        </div>
                    </div>
                </div>
            ))
                :
                <center>
                    <div className="d-flex justify-content-center">
                        <img
                            src={`/images/empty_folder.png`}
                            className="empty-state"
                            onError={event => event.target.src = `/images/placeholder.gif`}
                            style={{ width: 250, height: "auto" }}
                        />
                    </div>
                    <h5 className='h5'>{t('forum_not_yet')}</h5>
                </center>
            }
            {
                (data && lastPage > 0) &&
                <div className="d-flex justify-content-end mt-3">
                    <Paginate
                        pageCount={lastPage}
                        onPageChange={selected => handlePage(selected)}
                        initialPage={page}
                    />
                </div>
            }
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
                        <h6 className='small' style={{ textAlign: "justify" }}>Hai, Zavira! Mohon maaf atas ketidaknyamanan Anda. Bantu Tokodapur untuk menyajikan konten yang berkualitas yuk. Laporkan pada kami jika menemukan konten yang mengganggu kenyamanan bersama.</h6>

                        <h6 className='small'>{t('forum_category')} Laporan</h6>
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

export default SelectCategories;

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