import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Config from '../../../../components/axios/Config';
import CustomImage from '../../../../components/helpers/CustomImage';
import SwalToast from '../../../../components/helpers/SwalToast';
import CardThread from '../components/CardThread';
import PaginateThread from '../components/PaginateThread';

const Saved = () => {
    const [data, setData] = useState([])
    const [lastPage, setLastPage] = useState()
    const [page, setPage] = useState(1)
    useEffect(() => {
        getThread()
    }, [])

    const getThread = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}forum/thread/bookmark/list`
        let params = {
            page: page,
            per_page: 10
        }
        axios.get(url, Config({
            Authorization: `Bearer ${Cookies.get("token")}`,
        }, params)).then(response => {
            let data = response.data.data;
            setData(data.data);
            setLastPage(data.last_page);
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
    const onDeleteBookmark = (id) => {
        // console.log("delete bookmark")

        let url = `${process.env.REACT_APP_BASE_API_URL}forum/thread/bookmark/delete/${id}`

        axios.delete(url, Config({
            Authorization: `Bearer ${Cookies.get("token")}`,
        })).then(response => {
            console.log(response.data.message);
            SwalToast.fire({
                icon: "success",
                title: response.data.message
            })
            getThread()
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
    const onChangeStatus = () => {
        console.log("change status")
    }

    const handlePage = (selected) => {
        setPage(selected)
        getThread()
    }
    const { t } = useTranslation()
    return (
        <div>
            <h4 className='font-weight-bold'>{t('forum_saved')}</h4>
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
                <CardThread item={item} type={"my_post"} name={"bookmark"} getThread={getThread} onDeleteBookmark={onDeleteBookmark} onChangeStatus={onChangeStatus} />
            ))}
            <PaginateThread
                data={data}
                lastPage={lastPage}
                handlePage={handlePage}
                page={page}
            />
        </div>
    );
}

export default Saved;
