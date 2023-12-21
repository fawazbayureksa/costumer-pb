import React, { useState, useEffect } from 'react';
import CustomImage from '../../../components/helpers/CustomImage';
import MyContext from '../../../components/MyContext';
import Template from '../../../components/Template';
import { Tabs, Tab, Modal } from "react-bootstrap";
import TinyMceEditor from '../../../components/helpers/TinyMceEditor';
import ReactSelect from 'react-select';
import axios from 'axios';
import Config from '../../../components/axios/Config';
import SwalToast from '../../../components/helpers/SwalToast';
import Cookies from 'js-cookie';
import { useHistory, useParams } from 'react-router-dom';
import GeneralRoutePath from '../GeneralRoutePath';
import IsEmpty from '../../../components/helpers/IsEmpty';
import ErrorDiv from '../../../components/helpers/ErrorDiv';
import { useTranslation } from 'react-i18next';
import CardThread from './components/CardThread';
import CardDraft from './components/CardDraft';
import MetaTrigger from '../../../components/MetaTrigger';

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
            `}</style>
        );
    } else return null;
};

const CreateForum = () => {
    const { id } = useParams()
    const [title, setTitle] = useState()
    const [selected, setSelected] = useState([])
    const [initialDesc, setInitialDesc] = useState(null)
    const [description, setDescription] = useState()
    const [errors, setErrors] = useState({})
    const history = useHistory();
    const [listCategories, setListCategories] = useState([])
    const [data, setData] = useState([])

    useEffect(() => {
        if (id) {
            getDetailThread(id)
        } else {
            setInitialDesc('')
        }
    }, []);
    const { t } = useTranslation()

    const onDescriptionChange = (value) => {
        setDescription(value)
    }

    useEffect(() => {
        getCategories()
    }, [])

    const getDetailThread = (id) => {
        let url = `${process.env.REACT_APP_BASE_API_URL}forum/thread/detailForumThread/${id}`

        let body = {
            mp_customer_id: JSON.parse(Cookies.get('user')).id
        }
        axios.get(url, Config({
            Authorization: `Bearer ${Cookies.get("token")}`,
        }, body)).then(response => {
            let data = response.data.data;
            setDescription(data.content)
            setInitialDesc(data.content)
            setTitle(data.title)
            setSelected(
                data.categories.map((i) => ({
                    value: i.forum_category_id, label: i.name
                }))
            )
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


    const getCategories = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}forum/categories/get`;

        axios.get(url, Config({
            Authorization: `Bearer ${Cookies.get("token")}`,
        })).then(response => {
            let data = response.data.data;
            setListCategories(
                data.map((i) => ({
                    value: i.id, label: i.name
                }))
            )
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

    const onSaveThread = (status) => {

        if (!validation()) return

        let url = `${process.env.REACT_APP_BASE_API_URL}forum/thread/save`;

        let category = []
        selected.forEach(i => category.push(i.value))

        let data = {
            title: title,
            content: description,
            user_type: "customer",
            status: status,
            category_id: category,
            id: id ? parseInt(id) : 0
        }
        axios.post(url, data, Config({
            Authorization: `Bearer ${Cookies.get('token')}`
        })).then(response => {
            SwalToast.fire({ icon: "success", title: response.data.message })
            history.push({
                pathname: GeneralRoutePath.FORUM_MY
            })
        }).catch(error => {
            console.log(error);
            if (error.response) {
                console.log(error.response.data);
                SwalToast.fire({ icon: "error", title: error.response.data.message })
            }
        })
    }

    const validation = () => {
        let error = []
        let validate = true

        if (IsEmpty(title)) {
            error.title = t('forum_title_required')
            validate = false
        }
        else if (IsEmpty(description)) {
            error.content = t('forum_content_required')
            validate = false
        }
        else if (selected.length < 1) {
            error.category = t('forum_category_required')
            validate = false
        }

        setErrors(error)
        return validate
    }



    useEffect(() => {
        getThreadDraft()
    }, [])
    const getThreadDraft = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}forum/thread/getListThreadSelf`

        let params = {
            page: 1,
            per_page: 10,
            status: "draft"
        }
        axios.get(url, Config({
            Authorization: `Bearer ${Cookies.get("token")}`,
        }, params)).then(response => {
            let data = response.data.data;
            setData(data.data);
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
                <MyContext.Consumer>{context => (
                    <div id="body" className="my-4">
                        <MetaTrigger
                            pageTitle={context.companyName ? `${context.companyName} - Forum ${id ? t('forum_edit_thread') : t('forum_create_thread')}` : ""}
                            pageDesc={'Forum'}
                        />
                        <Styles themes={context.theme_settings} />
                        <div className="row">
                            <div className='col-md-9'>
                                <div className="bg-white shadow-graph rounded p-3 " style={{ top: 0 }}>
                                    <p className='h5 font-weight-bold mb-3'>{id ? t('forum_edit_thread') : t('forum_create_thread')}</p>
                                    <div className='w-50 mb-5' style={{ zIndex: 3, position: "relative" }}>
                                        <label className="text mobile-label color-374650" htmlFor="kategori">{t('forum_category')}</label>
                                        <ReactSelect
                                            options={listCategories}
                                            onChange={(c) => onSelectedCategory(c)}
                                            isMulti
                                            value={selected}
                                        />
                                        <ErrorDiv error={errors.category} />
                                    </div>
                                    <div className='mb-5' >
                                        <label className="text mobile-label color-374650" htmlFor="thread_title">{t('forum_title_thread')}</label>
                                        <input id="thread_title"
                                            type="text"
                                            className="border-D3D3D3 form-control mobile-input"
                                            name="thread_title"
                                            required
                                            onChange={(e) => setTitle(e.target.value)}
                                            value={title}
                                        />
                                        <ErrorDiv error={errors.title} />
                                    </div>
                                    <div>
                                        {(initialDesc != null) &&
                                            <TinyMceEditor
                                                onEditorChange={(content) => onDescriptionChange(content)}
                                                initialValue={initialDesc}
                                            />
                                        }
                                        <ErrorDiv error={errors.content} />
                                    </div>
                                    <div className='d-flex mt-3'>
                                        <button onClick={() => onSaveThread("draft")} className="btn btn-sm button-nowrap border-CED4DA rounded p-2 font-weight-bold mr-3 w-50" style={{ width: 200 }}>
                                            {t('forum_save_as_draft')}
                                        </button>
                                        <button onClick={() => onSaveThread("published")} className="btn btn-sm text-white bgc-accent-color button-nowrap rounded p-2 font-weight-bold w-50" style={{ width: 200 }}>
                                            {t('forum_send')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className='col-md-3 mt-3'>
                                <div>
                                    <h5 className='h5 font-weight-bold'>{t('forum_your_draft')}</h5>
                                </div>
                                {data && data.map((item, index) => (
                                    <CardDraft item={item} name="draft_list" />
                                ))}
                            </div>
                        </div>
                    </div>
                )}</MyContext.Consumer>
            </Template>
        </>
    );
}

export default CreateForum;
