import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Cookie from 'js-cookie'
import { ProfilePicture, ChatAttachment, ChatAttachment2, ChatMessageType } from "../../pages/e-commerce/chat/Helper";
import InfiniteScroll from "react-infinite-scroll-component";
import { WebsocketPayloadType } from '../../components/websocket/WebsocketHelper';
import ExceedUploadLimit from "../../components/helpers/ExceedUploadLimit";
import SwalToast from "../../components/helpers/SwalToast";
import update from 'immutability-helper'
import Config from "../../components/axios/Config";
import axios from 'axios'
import ManualSwitchLanguage from "../../components/helpers/ManualSwitchLanguage";
import { Link } from "react-router-dom";
import EcommerceRoutePath from "../../pages/e-commerce/EcommerceRoutePath";
import { useTranslation } from "react-i18next";
import CustomImage, { PublicStorageFolderPath } from "../../components/helpers/CustomImage";
import { DateTimeFormat } from "../../components/helpers/DateTimeFormat";
import EmojiPicker from '@emoji-mart/react'

/**
 * 
 * @param {function} send 
 * @param {int} success 
 * @param {string} error 
 * @param {bool} active whether chat is active
 * @param {int} id
 * @param {object} product product object if exists
 * @param {function} removeProduct remove product object if exists
 * @returns 
 */
const InputChatMessage = (props) => {
    const [message, set_message] = useState('')
    const [attachments, set_attachments] = useState([])
    const [submitting, set_submitting] = useState(false)
    const [showPicker, setShowPicker] = useState(false);

    const [t] = useTranslation()

    const messageRef = useRef()

    useEffect(() => {
        set_message('')
        set_attachments([])
        set_submitting(false)
    }, [props.success])

    useEffect(() => {
        set_submitting(false)
    }, [props.error])

    useEffect(() => {
        if (submitting) {
            focusToInput()
        }
    }, [submitting])

    useEffect(() => {
        if (props.active) {
            focusToInput()
        }
    }, [props.active])

    const focusToInput = () => {
        setTimeout(() => {
            messageRef.current?.focus()
        }, 300)
    }

    const setMessage = useCallback((e) => {
        set_message(e.target.value)
    }, [])

    const setEmoji = (e) => {
        set_message(message + e.native);
        setShowPicker(false);
    }

    const funcShowEmoji = () => {
        setShowPicker(!showPicker);
    }

    const send = (e) => {
        e.preventDefault()

        if (props.product || attachments.length > 0 || message.trim()) {
            set_submitting(true)
            try {
                if (props.product) {
                    props.send(props.product.id.toString(), ChatMessageType.Product)
                }
                if (attachments.length > 0) {
                    for (const attachment of attachments) {
                        props.send(attachment.filename, ChatMessageType.Attachment)
                    }
                }
                if (message.trim()) {
                    props.send(message, ChatMessageType.Text)
                }
            } catch (ex) {
                console.log(ex)
                set_submitting(false)
            }
        } else {
            focusToInput()
        }
    }
    const uploadAttachment = (e) => {
        let file = e.target.files[0];
        if (file) {
            let exceed = ExceedUploadLimit(file)
            if (exceed.value) {
                SwalToast.fire({
                    icon: 'error',
                    title: `Limit upload size is ${exceed.max_size / 1024} Kb`
                });
                return;
            }

            let form = new FormData();
            form.append('file', file);

            set_submitting(true)
            axios.post(`${process.env.REACT_APP_BASE_API_URL}chat/uploadAttachment`, form, Config({
                Authorization: `Bearer ${Cookie.get('token')}`,
                'Content-Type': 'multipart/form-data'
            })).then(response => {

                set_attachments(update(attachments, {
                    $push: [{
                        filename: response.data.data,
                        src: URL.createObjectURL(file)
                    }]
                }))
            }).catch(error => {
                if (error.response) {
                    console.log(error.response);
                    SwalToast.fire({
                        icon: 'error',
                        title: error.response.data.message
                    });
                }
                else {
                    console.log(error)
                    SwalToast.fire({
                        icon: 'error',
                        title: 'Whoops, something went wrong!'
                    });
                }
            }).finally(() => {
                set_submitting(false)
            });
        }
    }

    const removeAttachment = (index) => {
        set_attachments(update(attachments, {
            $splice: [[index, 1]]
        }))
    }

    const removeProduct = () => {
        props.removeProduct()
    }

    return (<>
        {props.product && <div className="d-flex bg-white p-2">
            <CustomImage folder={PublicStorageFolderPath.products} filename={props.product.mp_product_images[0].filename} alt={props.product.mp_product_images[0].filename} style={{ width: 80 }} />
            <div className="ml-4 flex-grow-1">
                <div className="font-weight-semi-bold">
                    <ManualSwitchLanguage data={props.product.mp_product_informations} langAttr={"language_code"} valueAttr={"name"} />
                </div>
                <div>{props.product.mp_seller.name}</div>
                {props.product.rating ? <div><i className="fas fa-star color-FFB200 mr-1" />{parseFloat(props.product.rating)}</div> : ""}
            </div>
            <div className="ml-4 flex-grow-0 text-right">
                <div className="link" onClick={removeProduct}><i className="fas fa-times color-EB2424" /></div>
                <Link to={EcommerceRoutePath.PRODUCT_DETAIL.replace(":seller_slug", props.product.mp_seller.slug).replace(":product_slug", props.product.slug)}
                    className="text-decoration-none" >
                    <button className="btn border-EC9700">{t('product_detail.view_product_page')}</button>
                </Link>
            </div>
        </div>}
        {attachments.length > 0 && <div className="attachments bg-white p-2">
            <style jsx="true">{`
                .temp-attachment {
                    height: 6rem;
                }
            `}</style>
            <div className="row no-gutters mt-2 align-items-end">
                {attachments.map((attachment, index) => (
                    <div className="col-2 px-2" key={attachment.filename}>
                        <ChatAttachment filename={attachment.filename} src={attachment.src} index={index} removeAttachment={removeAttachment} />
                    </div>
                ))}
            </div>
        </div>
        }
        <form className="d-flex p-3" onSubmit={send}>
            <input ref={messageRef} className="form-control" autoComplete="off" type="text" value={message} name="message" onChange={setMessage} disabled={submitting} />
            <button className="btn bgc-accent-color ml-2 text-white" style={{ borderRadius: "50%" }} disabled={submitting}>
                <i className="far fa-paper-plane color-1576BD" />
            </button>
        </form>
        <div className="d-flex align-items-center mx-3">
            {/* Show emoji picker */}
            <div onClick={funcShowEmoji}>
                <i className="fas fa-smile color-8D8D8D "></i>
            </div>
            <i className="fas fa-shopping-bag color-8D8D8D ml-2"></i>
            {/* Upload Image */}
            <div>
                <label htmlFor={`upload-image-attachments-${props.id}`} className="btn m-0 p-0">
                    <i className="far fa-image color-8D8D8D ml-2"></i>
                </label>
                <input
                    type="file"
                    accept="image/*"
                    id={`upload-image-attachments-${props.id}`}
                    disabled={submitting}
                    className="d-none"
                    onChange={uploadAttachment}
                />
            </div>
            {/* Upload Video */}
            <div>
                <label htmlFor={`upload-video-attachments-${props.id}`} className="btn m-0 p-0">
                    <i className="fab fa-youtube color-8D8D8D ml-2"></i>
                </label>
                <input
                    type="file"
                    accept="video/*"
                    id={`upload-video-attachments-${props.id}`}
                    disabled={submitting}
                    className="d-none"
                    onChange={uploadAttachment}
                />
            </div>
            {/* Upload All Type of Files */}
            <div>
                <label htmlFor={`upload-attachments-${props.id}`} className="btn m-0 p-0">
                    <i className="fas fa-file color-8D8D8D ml-2"></i>
                </label>
                <input
                    type="file"
                    id={`upload-attachments-${props.id}`}
                    disabled={submitting}
                    className="d-none"
                    onChange={uploadAttachment}
                />
            </div>
        </div>
        {
            (showPicker) &&
            <div>
                <EmojiPicker  style={{maxHeight: '20vh'}} onEmojiSelect={(data) => setEmoji(data)} />
            </div>
        }
    </>)
}

/**
 * 
 * @param {object} data current chatroom
 * @param {function} send send message
 * @param {function} close close chat
 * @param {bool} active whether chat is active
 * @param {object} product product object if exists
 * @returns 
 */
const FloatingChatMessage = (props) => {
    const [product, set_product] = useState(null)
    const [success, set_success] = useState(null)
    const [error, set_error] = useState('')
    // const [messages_style, set_messages_style] = useState([])
    // const [messages_style2, set_messages_style2] = useState([])
    let previous_date = null
    let currentUserType = useMemo(() => ("customer"), [])
    let currentUserID = useMemo(() => {
        let currentUser = JSON.parse(Cookie.get("user"))
        return currentUser.id
    }, [])

    useEffect(() => {
        if (!props.data) return;
        if (!props.product) return;

        if (props.data.users.length > 2) return; // not applicable for group chat
        let seller = props.data.users.find(x => x.user_type === "seller" && x.user_id === props.product.mp_seller_id)
        if (!seller) return; // if no matching seller then return

        set_product(props.product)
    }, [props.product])

    useEffect(() => {
        set_success(props.data.last_message_id)
    }, [props.data.last_message_id])

    useEffect(() => {
        set_error(props.data.error)
    }, [props.data.error])

    const close = () => {
        props.close()
    }

    const getMoreMessages = () => {
        try {
            let chatroom = props.data
            if (!chatroom.id) return

            let param = {
                type: WebsocketPayloadType.MessageGetMore,
                data: {
                    mp_chatroom_id: parseInt(chatroom.id),
                    last_message_id: parseInt(chatroom.messages[chatroom.messages.length - 1].id)
                }
            }
            props.send(param)
        } catch (ex) {
            set_error(ex.message)
            throw ex;
        }
    }

    const send = (message, type) => {
        try {
            let chatroom = props.data
            if (!chatroom.id || !message) return

            if (type === ChatMessageType.Product) removeProduct();

            let param = {
                type: WebsocketPayloadType.MessageData,
                data: {
                    mp_chatroom_id: parseInt(chatroom.id),
                    message: message,
                    type: type
                }
            }
            props.send(param)
        } catch (ex) {
            set_error(ex.message)
            throw ex;
        }
    }

    const removeProduct = () => {
        set_product(null)
    }

    const renderMessage = (user, message, backgroundColor) => (<>
        {message.type === ChatMessageType.Text ? <div className="p-3 rounded" style={{ backgroundColor: backgroundColor }}>
            <div className="small">{user.name}</div>
            <div style={{ overflowWrap: 'anywhere' }} className="mt-1">{message.message}</div>
            <div className="small text-right mt-1">
                {DateTimeFormat(message.created_at, -1)}
            </div>
        </div>
            // normal page chat => minWidth: 500
            : message.type === ChatMessageType.Product ? <div className="p-3 rounded" style={{ backgroundColor: backgroundColor, minWidth: 400 }}> 
                {message.data ? <Link to={EcommerceRoutePath.PRODUCT_DETAIL.replace(":seller_slug", message.data.mp_seller.slug).replace(":product_slug", message.data.slug)}
                    className="d-flex bg-white p-2">
                    <CustomImage folder={PublicStorageFolderPath.products} filename={message.data.mp_product_images[0].filename} alt={message.data.mp_product_images[0].filename} style={{ width: 80 }} />
                    <div className="ml-4">
                        <div className="font-weight-semi-bold">
                            <ManualSwitchLanguage data={message.data.mp_product_informations} langAttr={"language_code"} valueAttr={"name"} />
                        </div>
                        <div>{message.data.mp_seller.name}</div>
                        {message.data.rating ? <div><i className="fas fa-star color-FFB200 mr-1" />{parseFloat(message.data.rating)}</div> : ""}
                    </div>
                </Link> : "Invalid product"}
                <div className="small text-right mt-1">
                    {DateTimeFormat(message.created_at, -1)}
                </div>
            </div>
                : message.type === ChatMessageType.Attachment ? <div className="p-3 rounded" style={{ backgroundColor: backgroundColor }}>
                    <div className="">
                        <ChatAttachment2 message={message} />
                    </div>
                    <div className="small text-right mt-1">
                        {DateTimeFormat(message.created_at, -1)}
                    </div>
                </div>
                    : null}
    </>)


    return (
        <div className="h-100 font-size-80-percent" style={{ display: 'grid', gridTemplateRows: 'auto 1fr auto' }}>
            <div className="p-3 border-bottom ">
                <div className="d-flex justify-content-between">
                    <div className="d-flex align-items-center">
                        <ProfilePicture source={props.data.recipient.picture} name={props.data.recipient.name} />
                        <div className="d-flex flex-column">
                            <div className="d-flex">
                                <img src='/images/seller-icon.png' style={{ width: 25, height: 25 }} className='ml-2' />
                                <div className="ml-2">{props.data.recipient.name}</div>
                            </div>
                            <small className="ml-2">online</small>
                        </div>
                    </div>
                    <div className="align-self-center link" onClick={close}>
                        <i className="fas fa-times color-EB2424 " />
                    </div>
                </div>
            </div>
            <div className="p-3 border-bottom overflow-auto"
                id={"chatMessageScrollDiv" + props.data.id}
                style={{ display: 'flex', flexDirection: 'column-reverse', overflowAnchor: 'none' }}
            >
                <InfiniteScroll
                    dataLength={props.data.messages.length}
                    next={getMoreMessages}
                    style={{ display: 'flex', flexDirection: 'column-reverse' }} //To put endMessage and loader to the top.
                    inverse={true} //
                    hasMore={props.data.hasMore}
                    loader={<div className="text-center">Loading...</div>}
                    scrollableTarget={"chatMessageScrollDiv" + props.data.id}
                >
                    {props.data.messages.map((message, index) => {
                        let current_date = DateTimeFormat(message.created_at, 0)
                        let show_date;
                        if (previous_date) {
                            if (previous_date === current_date) {
                                show_date = false
                            } else {
                                show_date = previous_date;
                                previous_date = current_date
                            }
                        }
                        else {
                            show_date = false;
                            previous_date = current_date
                        }

                        let user = props.data.users.find(x => x.user_id === message.user_id && x.user_type === message.user_type)

                        return (
                            <div key={message.id} className="mt-3 ">

                                {(message.user_id === currentUserID && message.user_type === currentUserType) ? <div className="d-flex" style={{ justifyContent: "flex-end", paddingLeft: 70, }}>
                                    {renderMessage(user, message, "#D3D3D3")}
                                </div> : <div className="d-flex" style={{ justifyContent: "flex-start", paddingRight: 70, }}>
                                    {renderMessage(user, message, "#EBECF0")}
                                </div>}

                                <div className="d-flex justify-content-center ">
                                    {show_date && <div className="px-3 py-1 small rounded-pill color-95A4AF border-95A4AF">
                                        {show_date}
                                    </div>}
                                </div>
                            </div>
                        )
                    })}
                    <div className="mt-3 ">
                        <div className="d-flex justify-content-center ">
                            {previous_date && <div className="px-3 py-1 small rounded-pill color-95A4AF border-95A4AF">
                                {previous_date}
                            </div>}
                        </div>
                    </div>
                </InfiniteScroll>
            </div>
            <div className="">
                {error && <div className="">
                    <div className="alert alert-danger p-2 m-0 d-flex justify-content-between" role="alert">
                        <div>{error}</div>
                        <div className="align-self-center link" onClick={() => set_error('')}>
                            <i className="fas fa-times color-EB2424 " />
                        </div>
                    </div>
                </div>}
                <InputChatMessage send={send} success={success} error={error} active={props.active} id={props.data.id} product={product} removeProduct={removeProduct} />
            </div>

        </div>
    )
}

export default FloatingChatMessage