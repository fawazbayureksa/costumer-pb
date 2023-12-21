import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import TextTruncate from '../../../../components/helpers/TextTruncate'
import { TinyMceContent, TinyMcePreview } from '../../../../components/helpers/TinyMceEditor'
import GeneralRoutePath from '../../GeneralRoutePath'

export default function CardDraft({ item, onChangeStatus, name }) {

    const { t } = useTranslation()

    return (
        <div className="bg-white shadow-graph rounded p-3 mb-3" style={{ top: 0 }}>
            <Link to={GeneralRoutePath.FORUM_EDIT.replace(':id', item.id)} className='text-decoration-none'>
                <div className='d-flex flex-column mt-3'>
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
            {name !== "draft_list" &&
                <div className='d-flex mt-3 justify-content-center'>
                    <Link className="btn btn-sm border-CED4DA button-nowrap w-50 mx-4 rounded p-2 font-weight-bold " to={GeneralRoutePath.FORUM_EDIT.replace(':id', item?.id)}>
                        {t('forum_edit')}
                    </Link>
                    <button onClick={() => onChangeStatus(item?.id)} className="btn btn-sm text-white bgc-accent-color button-nowrap w-50 mx-4 rounded p-2 font-weight-bold">
                        {t('forum_published')}
                    </button>
                </div>
            }
        </div >
    )
}


