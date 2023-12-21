import React, { useEffect, useState } from 'react';
import CardThread from '../components/CardThread';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Link, NavLink } from 'react-router-dom';
import Config from '../../../../components/axios/Config';
import CustomImage from '../../../../components/helpers/CustomImage';
import SwalToast from '../../../../components/helpers/SwalToast';
import Paginate from '../../../../components/helpers/Paginate';
import { useTranslation } from 'react-i18next';


const MyArsip = () => {
    const [data, setData] = useState([])
    const [lastPage, setLastPage] = useState()
    const [page, setPage] = useState(1)

    useEffect(() => {
        getThread()
    }, [page])

    const getThread = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}forum/thread/getListThreadSelf`
        let params = {
            page: page,
            per_page: 10,
            status: "archive"
        }
        axios.get(url, Config({
            Authorization: `Bearer ${Cookies.get("token")}`,
        }, params)).then(response => {
            let data = response.data.data;
            setData(data.data);
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
    const onChangeStatus = (id) => {
        let url = `${process.env.REACT_APP_BASE_API_URL}forum/thread/changeStatus`;

        let data = {
            forum_thread_id: id,
            status: "published"
        }
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

    const handlePage = (selected) => {
        setPage(selected)
    }

    const { t } = useTranslation()


    const onDeleteThread = (id_thread) => {
        let url = `${process.env.REACT_APP_BASE_API_URL}forum/thread/delete`

        let body = {
            forum_thread_id: parseInt(id_thread),
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
            getThread()
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
        <div>
            {data.length < 1 &&
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
            {data && data.map((item, index) => (
                <CardThread
                    item={item}
                    getThread={getThread}
                    name="archive"
                    onChangeStatus={onChangeStatus}
                    onDeleteThread={onDeleteThread}
                />
            ))}
            {(data && lastPage > 0) &&
                <div className="d-flex justify-content-end mt-3">
                    <Paginate
                        pageCount={data ? lastPage : 1}
                        onPageChange={selected => handlePage(selected)}
                        initialPage={page}
                    />
                </div>
            }
        </div>
    );
}

export default MyArsip;

