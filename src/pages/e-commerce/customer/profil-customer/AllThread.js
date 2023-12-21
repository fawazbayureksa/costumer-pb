import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Link, NavLink, useParams } from 'react-router-dom';
import CardThread from '../../../general/forum/components/CardThread';
import PaginateThread from '../../../general/forum/components/PaginateThread';
import SwalToast from '../../../../components/helpers/SwalToast';
import Config from '../../../../components/axios/Config';
import { isLogin } from '../../../general/forum/components/IsLogin';
import { useTranslation } from 'react-i18next';


export default function AllThread({ order, type, seller }) {
    const [data, setData] = useState([])
    const [lastPage, setLastPage] = useState()
    const [page, setPage] = useState(1)
    const { id, seller_slug } = useParams()

    useEffect(() => {
        getThread()
    }, [page, order])

    const getThread = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}forum/thread/getListThreadUser`;

        let params = {
            page: page,
            per_page: 10,
            user_type: type,
            user_id: seller ? seller.id : id,
            order_by: order

        }
        let axiosInstance = axios.get(url, Config({}, params))

        if (isLogin()) {
            axiosInstance = axios.get(url, Config({
                Authorization: `Bearer ${Cookies.get("token")}`,
            }, params))
        }

        axiosInstance.then(response => {
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
            status: "archive"
        }
        axios.post(url, data, Config({
            Authorization: `Bearer ${Cookies.get('token')}`
        })).then(response => {
            SwalToast.fire({ icon: "success", title: response.data.message })
            // history.push({
            //     pathname: GeneralRoutePath.FORUM_MY
            // })
            getThread()
        }).catch(error => {
            console.log(error);
            if (error.response) {
                console.log(error.response.data);
                SwalToast.fire({ icon: "error", title: error.response.data.message })
            }
        })
    }

    const onDeleteThread = (id_thread) => {
        let url = `${process.env.REACT_APP_BASE_API_URL}forum/thread/delete`

        let body = {
            forum_thread_id: parseInt(id_thread),
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


    const handlePage = (selected) => {
        setPage(selected)
    }
    const { t } = useTranslation()
    return (
        <div>
            {data.length > 0 ? data.map((item, index) => (
                <CardThread
                    item={item}
                    type="my_post"
                    getThread={getThread}
                    onChangeStatus={onChangeStatus}
                    onDeleteThread={onDeleteThread}
                    lastPage={lastPage}
                    handlePage={handlePage}
                    page={page}
                />
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
            <PaginateThread
                data={data}
                lastPage={lastPage}
                handlePage={handlePage}
                page={page}
            />
        </div>
    )
}

