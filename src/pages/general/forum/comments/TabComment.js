import React, { useState } from 'react'
import MyContext from '../../../../components/MyContext'
import { Tabs, Tab, Modal } from "react-bootstrap";
import Comment from "./Comment"
import { useTranslation } from 'react-i18next';

export default function TabComment({ id_thread, saveComment, modalComment, setModalComment, setModalReplyComment, modalReplyComment, error }) {
    const [key, setKey] = useState('all');

    const Style = props => {
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
                    .nav-tabs a:hover {
                        color: ${props.themes ? props.themes.accent_color.value : ''};
                    }
                `}</style>
            );
        } else return null;
    };

    const { t } = useTranslation()

    return (
        <>
            <MyContext.Consumer>{context => (
                <div>
                    <Style themes={context.theme_settings} />
                    <Tabs id="controlled-tab" className="mb-3" activeKey={key} onSelect={(k) => setKey(k)}>
                        <Tab tabClassName="mx-0 mx-sm-0 mx-md-3 mx-4" eventKey="all" title={t('forum_all')}>
                            <Comment
                                id_thread={id_thread}
                                saveComment={saveComment}
                                modalComment={modalComment}
                                setModalComment={setModalComment}
                                modalReplyComment={modalReplyComment}
                                setModalReplyComment={setModalReplyComment}
                                error={error}
                            />
                        </Tab>
                        <Tab tabClassName="mx-0 mx-sm-0 mx-md-3 mx-4 " eventKey="new" title={t('forum_latest')}>
                            {/* <Comment
                                id_thread={id_thread}
                                saveComment={saveComment}
                                modalComment={modalComment}
                                setModalComment={setModalComment}
                                modalReplyComment={modalReplyComment}
                                setModalReplyComment={setModalReplyComment}
                                error={error}
                                order={"new"}
                            /> */}
                        </Tab>
                        <Tab tabClassName="mx-0 mx-sm-0 mx-md-3 mx-4 " eventKey="popular" title={t('forum_popular')}>
                            {/* <Comment
                                id_thread={id_thread}
                                saveComment={saveComment}
                                modalComment={modalComment}
                                setModalComment={setModalComment}
                                modalReplyComment={modalReplyComment}
                                setModalReplyComment={setModalReplyComment}
                                error={error}
                                order={"popular"}
                            /> */}
                        </Tab>
                    </Tabs>
                </div>
            )}</MyContext.Consumer>
        </>
    )
}

