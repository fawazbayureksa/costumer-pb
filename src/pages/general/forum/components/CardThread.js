import axios from 'axios'
import Cookies from 'js-cookie'
import moment from 'moment'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Config from '../../../../components/axios/Config'
import CustomImage, { PublicStorageFolderPath } from '../../../../components/helpers/CustomImage'
import TextTruncate from '../../../../components/helpers/TextTruncate'
import { TinyMceContent, TinyMcePreview } from '../../../../components/helpers/TinyMceEditor'
import EcommerceRoutePath from '../../../e-commerce/EcommerceRoutePath'
import GeneralRoutePath from '../../GeneralRoutePath'


export default function CardThread({
    item,
    name,
    getThread,
    onChangeStatus,
    onDeleteThread,
    onDeleteBookmark,
    onEditThread
}) {


    const onLikeThread = (id) => {
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
    const onUnlikeThread = (id) => {
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


    const { t } = useTranslation()

    return (
        <div>
            <div className="bg-white shadow-graph rounded p-3 mb-3" style={{ top: 0 }}>
                <Link to={EcommerceRoutePath.CUSTOMER.replace(":id", item.user_id)} className='text-decoration-none'>
                    {(name == "bookmark" || name == "liked") &&
                        <div className="d-flex justify-content-between">
                            <div className='d-flex align-items-center' >
                                <div>
                                    <CustomImage
                                        folder={PublicStorageFolderPath.customer}
                                        filename={item?.picture}
                                        style={{ width: 25, height: 25, borderRadius: 50 }}
                                        className="mr-2"
                                    />
                                </div>
                                <div>
                                    <p className='h6 font-weight-bold color-black'>{item.name}</p>
                                </div>
                                <div>
                                    <i className="fas fa-check-circle accent-color mx-1"></i>
                                </div>
                            </div>
                            <div>
                                <p className='small color-black'>{moment(new Date(item?.created_at)).fromNow()}</p>
                            </div>
                            {/* <div className='cursor-pointer' onClick={() => onDeleteBookmark()}>
                                    <i className="fas fa-bookmark h6"></i>
                                </div> */}
                            {/* <div>
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
                                        <i className="fas fa-store mr-1"></i>
                                        Seller
                                    </p>
                                </div> */}
                        </div>
                    }
                </Link>
                <Link to={GeneralRoutePath.FORUM_DETAIL_THREAD.replace(':id', item.id)} className='text-decoration-none'>
                    <div className='d-flex flex-column mt-3'>
                        <h4 className='h4 font-weight-bold '>
                            {item?.title}
                        </h4>
                        <TextTruncate className="color-black" lineClamp={5}>
                            <TinyMcePreview>{item.content}</TinyMcePreview>
                        </TextTruncate>
                        {/* <TinyMceContent className="body color-black">
                            {item?.content.slice(0, 500)}
                        </TinyMceContent> */}
                    </div>
                    <div className='d-flex mt-2 flex-wrap'>
                        {item?.categories.map((category) => (
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
                </Link>

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
                    {name !== "liked" &&
                        <div class="dropdown mr-1 cursor-pointer btn-group dropleft">
                            <i className="fas fa-ellipsis-v color-6D6D6D" data-toggle="dropdown" aria-expanded="false" data-offset="10,20"></i>
                            <div class="dropdown-menu">
                                {name == "bookmark" &&
                                    <div class="dropdown-item" onClick={() => onDeleteBookmark(item.id)}>{t('forum_delete')}</div>
                                }
                                {name == "archive" &&
                                    <>
                                        <div class="dropdown-item" onClick={() => onDeleteThread(item.id)}>{t('forum_delete')}</div>
                                        <div class="dropdown-item" onClick={() => onChangeStatus(item.id)}>{t('forum_published')}</div>

                                    </>
                                }
                                {name == "my_post" &&
                                    <>
                                        <div class="dropdown-item" onClick={() => onEditThread(item.id)}>{t('forum_edit')}</div>
                                        <div class="dropdown-item" onClick={() => onDeleteThread(item.id)}>{t('forum_delete')}</div>
                                        <div class="dropdown-item" onClick={() => onChangeStatus(item.id)}>{t('forum_save_as_archive')}</div>
                                    </>
                                }
                            </div>
                        </div>
                    }
                </div>
            </div >

        </div>
    )
}
