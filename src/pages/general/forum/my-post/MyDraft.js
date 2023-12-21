import React, { useEffect, useState } from 'react';
import CardThread from '../components/CardThread';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Link, NavLink, useHistory } from 'react-router-dom';
import Config from '../../../../components/axios/Config';
import CustomImage from '../../../../components/helpers/CustomImage';
import SwalToast from '../../../../components/helpers/SwalToast';
import GeneralRoutePath from '../../GeneralRoutePath';
import PaginateThread from '../components/PaginateThread';
import { useTranslation } from 'react-i18next';
import CardDraft from '../components/CardDraft';


const MyDraft = ({ config }) => {
    const history = useHistory()
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
            status: "draft"
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

    const onChangeStatus = (id_thread) => {
        let url = `${process.env.REACT_APP_BASE_API_URL}forum/thread/changeStatus`;

        let data = {
            forum_thread_id: id_thread,
            status: "published"
        }
        axios.post(url, data, Config({
            Authorization: `Bearer ${Cookies.get('token')}`
        })).then(response => {
            SwalToast.fire({ icon: "success", title: response.data.message })
            history.push({
                pathname: GeneralRoutePath.FORUM_MY_LIST
            })
        }).catch(error => {
            console.log(error);
            if (error.response) {
                console.log(error.response);
                SwalToast.fire({ icon: "error", title: error.response.data.message })
            }
        })
    }

    const { t } = useTranslation()

    const handlePage = (selected) => {
        setPage(selected)
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
                <CardDraft item={item} onChangeStatus={onChangeStatus} />
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

export default MyDraft;
