import React from 'react';
import Template from '../../../components/Template';
import Cookie from 'js-cookie'
import TextTruncate from '../../../components/helpers/TextTruncate';
import update from 'immutability-helper'
import ChatMessage from './ChatMessage';
import { DetectContext, ProfilePicture } from './Helper';
import { WebsocketContext, WebsocketPayloadType } from '../../../components/websocket/WebsocketHelper';
import InfiniteScroll from 'react-infinite-scroll-component';
import Responsive from '../../../components/helpers/Responsive';
import { Link } from 'react-router-dom';
import AuthRoutePath from '../../auth/AuthRoutePath';
import { DateTimeFormat } from '../../../components/helpers/DateTimeFormat';
import { ImageGetPublicUrl, PublicStorageFolderPath } from '../../../components/helpers/CustomImage';
import { useTranslation, withTranslation } from "react-i18next";
import MyContext from '../../../components/MyContext';
import MetaTrigger from '../../../components/MetaTrigger';
const Style = props => {
    if (props.themes) {
        return (
            <style>{`
                #container-settings {
                    max-width: ${props.themes.site_width.width};
                    margin: 0 auto;
                }
            `}</style>
        );
    } else return null;
};

class Chat extends React.Component {
    constructor(props) {
        super(props);

        // state variables
        this.state = {
            chatrooms: [],
            chatrooms_find: [],
            chatrooms_shown: [],
            current_chatroom_id: null,
            hasMore: true,
            firstGet: false,
            needRetry: false,

            chatTo: this.props.location.state || null, // e.g. {user_id: 1, user_type: "seller", product: {product data or null}}
        }
        let currentUser = Cookie.get('user') ? JSON.parse(Cookie.get('user')) : {}
        this.currentUserType = "customer"
        this.currentUserID = currentUser.id

        if (!Cookie.get('token')) {
            this.props.history.push({
                pathname: AuthRoutePath.LOGIN,
                search: `from=${this.props.location.pathname}`
            });
        }
    }
    componentDidMount() {
        // this.getMasterData2()
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevState.chatrooms !== this.state.chatrooms) {
            this.setState({
                chatrooms_shown: [].concat(this.state.chatrooms).sort((a, b) => {
                    if (a.messages.length > 0) {
                        if (b.messages.length > 0) {
                            const a_last_message = a.messages[0];
                            const b_last_message = b.messages[0];
                            if (a_last_message.created_at > b_last_message.created_at) {
                                return -1
                            }
                            else if (a_last_message.created_at < b_last_message.created_at) {
                                return 1
                            }
                        }
                        else return -1
                    }
                    else if (b.messages.length > 0) {
                        return 1
                    }
                })
            })
        }
    }

    initializeSingleChatroom = async (item) => {
        let userThanSelf = item.users.filter(user => !(user.user_type === this.currentUserType && user.user_id === this.currentUserID))
        let recipient = {
            name: userThanSelf.map((user) => user.name).join(", "),
            picture: userThanSelf.length > 0 && userThanSelf[0].picture ?
                userThanSelf[0].user_type === "seller" ? await ImageGetPublicUrl(PublicStorageFolderPath.seller, userThanSelf[0].picture)
                    : userThanSelf[0].user_type === "customer" ? `${userThanSelf[0].picture}`
                        : userThanSelf[0].user_type === "company" ? `${userThanSelf[0].picture}`
                            : ''
                : '',
        }

        let messages = item.messages
        if (this.state.chatrooms.length > 0) {
            let chatroom = this.state.chatrooms.find(x => x.id === item.id)

            if (chatroom) messages = messages.concat(chatroom.messages.slice(20))
        }
        return {
            ...item, messages: messages, recipient: recipient, hasMore: true, error: '', last_message_id: null,
        }
    }

    getChatrooms = () => {
        let param = {
            type: WebsocketPayloadType.MessageGetChatrooms,
            data: {
                already_exist: this.state.chatrooms.map((item) => (item.id)),
            }
        }
        this.sendMessage(param)
    }

    onPayloadChange = async (data) => {
        if (data.type === WebsocketPayloadType.MessageData) {
            let chatroomIndex = this.state.chatrooms.findIndex(x => x.id === data.data.mp_chatroom_id)
            if (chatroomIndex < 0) {
                let params = {
                    type: WebsocketPayloadType.MessageGetChatroom,
                    data: {
                        mp_chatroom_id: data.data.mp_chatroom_id,
                    }
                }
                this.sendMessage(params)
            }
            else {
                let chatrooms;
                if (data.data.user_type === this.currentUserType && data.data.user_id === this.currentUserID) {
                    chatrooms = update(this.state.chatrooms, {
                        [chatroomIndex]: {
                            messages: { $unshift: [data.data] },
                            last_message_id: { $set: data.data.id }
                        }
                    })
                } else {
                    chatrooms = update(this.state.chatrooms, {
                        [chatroomIndex]: {
                            messages: { $unshift: [data.data] },
                            unread: { $apply: (original) => original + 1 }
                        }
                    })
                }
                this.setState({
                    chatrooms
                })
            }

        } else if (data.type === WebsocketPayloadType.MessageGetMore) {
            let chatroomIndex = this.state.chatrooms.findIndex(x => x.id === data.data.mp_chatroom_id)
            if (chatroomIndex < 0) {
                console.log("error no chatroom data");
                return;
            }

            let chatrooms;
            if (data.data.messages.length > 0) {

                chatrooms = update(this.state.chatrooms, {
                    [chatroomIndex]: { messages: { $push: data.data.messages } }
                })
            } else {
                chatrooms = update(this.state.chatrooms, {
                    [chatroomIndex]: { hasMore: { $set: false } }
                })
            }
            this.setState({
                chatrooms
            })

        } else if (data.type === WebsocketPayloadType.MessageError) {
            let chatroomIndex = this.state.chatrooms.findIndex(x => x.id === data.data.mp_chatroom_id)
            if (chatroomIndex < 0) {
                console.log("error no chatroom data");
                return;
            }
            let chatrooms = update(this.state.chatrooms, {
                [chatroomIndex]: { error: { $set: [data.data.message] } }
            })
            this.setState({
                chatrooms
            })
        } else if (data.type === WebsocketPayloadType.MessageRead) {
            let chatroomIndex = this.state.chatrooms.findIndex(x => x.id === data.data.mp_chatroom_id)
            if (chatroomIndex < 0) {
                console.log("error no chatroom data");
                return;
            }
            let chatrooms = update(this.state.chatrooms, {
                [chatroomIndex]: { unread: { $set: 0 } }
            })
            this.setState({
                chatrooms
            })
        } else if (data.type === WebsocketPayloadType.MessageNewChatroom) {
            let chatroomIndex = this.state.chatrooms.findIndex(x => x.id === data.data.mp_chatroom.id)

            if (chatroomIndex < 0) {
                this.setState({
                    chatrooms: update(this.state.chatrooms, {
                        $push: [await this.initializeSingleChatroom(data.data.mp_chatroom)]
                    }),
                    current_chatroom_id: data.data.mp_chatroom.id
                })
            } else {
                this.setState({
                    current_chatroom_id: data.data.mp_chatroom.id
                })
            }
        } else if (data.type === WebsocketPayloadType.MessageGetChatrooms) {
            if (data.data.mp_chatrooms && data.data.mp_chatrooms.length > 0) {
                this.setState({
                    chatrooms: update(this.state.chatrooms, {
                        $push: await Promise.all(data.data.mp_chatrooms.map(async (item) => {
                            return await this.initializeSingleChatroom(item)
                        }))
                    }),
                })
            } else {
                this.setState({
                    hasMore: false,
                })
            }
        } else if (data.type === WebsocketPayloadType.MessageGetChatroom) {
            let chatroomIndex = this.state.chatrooms.findIndex(x => x.id === data.data.mp_chatroom.id)

            if (chatroomIndex < 0) {
                this.setState({
                    chatrooms: update(this.state.chatrooms, {
                        $push: [await this.initializeSingleChatroom(data.data.mp_chatroom)]
                    }),
                    current_chatroom_id: data.data.mp_chatroom.id
                })
            } else {
                this.setState({
                    current_chatroom_id: data.data.mp_chatroom.id
                })
            }
        }

    }

    clickChatroom = (e) => {
        e.preventDefault()

        let chatroomID = parseInt(e.currentTarget.getAttribute('chatroomid'))
        let chatroomIndex = this.state.chatrooms.findIndex(x => x.id === chatroomID)
        if (chatroomIndex < 0) {
            console.log("error no chatroom data");
            return;
        }
        this.setState({
            current_chatroom_id: chatroomID,
        })

        let chatroom = this.state.chatrooms[chatroomIndex]

        if (chatroom.unread > 0) {
            let param = {
                type: WebsocketPayloadType.MessageRead,
                data: {
                    mp_chatroom_id: chatroomID
                }
            }
            this.sendMessage(param);
            this.context.changeContext("unread", this.context.unread - chatroom.unread)
        }
    }
    sendMessage = (param) => {
        if (!Cookie.get('token')) this.context.ws.close();
        if (!this.context.ws) return;

        try {
            if (this.context.ws.readyState === WebSocket.OPEN) {
                this.context.ws.send(JSON.stringify(param));
            } else {
                this.setState({
                    needRetry: true
                })
            }
        } catch (ex) {
            this.setState({
                needRetry: true
            })
            throw ex;
        }
    }
    closeChat = () => {
        this.setState({
            current_chatroom_id: null
        })
    }

    addNewChatroom = (user_id, user_type) => {
        let param = {
            type: WebsocketPayloadType.MessageNewChatroom,
            data: {
                user_id,
                user_type,
            }
        }
        this.sendMessage(param)
    }
    onCurrentChatroomIDChange = (current_chatroom_id) => {
        this.setState({
            current_chatroom_id
        })
    }
    onWsChange = () => {
        if (this.state.firstGet) {
            this.setState({
                needRetry: true
            })
        } else {
            this.getChatrooms()
            if (this.state.chatTo) {
                this.addNewChatroom(this.state.chatTo.user_id, this.state.chatTo.user_type)
            }
            this.setState({
                firstGet: true
            })
        }
    }
    retryGetChatrooms = () => {
        this.setState({
            chatrooms: [],
            needRetry: false,
        }, () => {
            this.getChatrooms()
        })
    }

    onSearch = (e) => {
        let x = this.state.chatrooms.filter((i) => i.recipient.name.toLowerCase() === e.toLowerCase())
        console.log(x.length)
        if (x.length > 0) {
            this.setState({
                chatrooms_shown: update(this.state.chatrooms, {
                    $set: x
                })
            })
        }
        else {
            // this.getChatrooms()
            this.setState({
                chatrooms_shown: this.state.chatrooms
            })
        }
    }

    // renderType = mobile / desktop
    chatContainerContacts = (renderType) => (<>
        {this.state.needRetry && <div className="alert alert-danger p-2 m-0" role="alert">
            <span>Network error occured. </span>
            <span className="link" onClick={this.retryGetChatrooms}>Click here to get latest message.</span>
        </div>}
        <div className="p-2 border-bottom">
            <div className=" d-flex align-items-center">
                {renderType === "mobile" && <Link to="/" className="mr-2" ><i className="fas fa-arrow-left color-374650 fa-lg" /></Link>}
                {this.context.status && <div className="py-3">
                    <span style={{ color: this.context.status.color }}><i className="fas fa-circle small"></i></span>
                    <span className="ml-1 small">{this.context.status.name}</span>
                    {/* <p>pesan</p> */}
                </div>
                }
            </div>
            <div className="rounded d-flex align-items-center justify-content-between" style={{ border: '2px solid #F1F3F4' }}>
                <div class="input-group w-100">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Cari nama pengguna..."
                        onChange={(e) => this.onSearch(e.target.value)}
                    />
                    <div class="input-group-append">
                        <button className='btn bgc-accent-color'>
                            <i className="fa fa-search" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div id="chatScrollDiv" className="overflow-auto">
            <InfiniteScroll
                dataLength={this.state.chatrooms_shown.length}
                next={this.getChatrooms}
                hasMore={this.state.hasMore}
                loader={<div className="text-center">Loading...</div>}
                scrollableTarget="chatScrollDiv"
            >
                {this.state.chatrooms_shown && this.state.chatrooms_shown.map((item) => {
                    return (
                        <div className="py-3 px-2 border-bottom recipient d-flex"
                            onClick={this.clickChatroom}
                            key={item.id}
                            chatroomid={item.id}
                            style={{ backgroundColor: this.state.current_chatroom_id === item.id ? "#D3D3D3" : "unset" }}
                        >
                            <ProfilePicture source={item.recipient.picture} name={item.recipient.name} />
                            <div className="ml-2 w-100">
                                <div className="d-flex align-items-center">
                                    <img src='/images/seller-icon.png' style={{ width: 20, height: 20 }} className='mr-2' />
                                    <h6 className='mt-2'>{item.recipient.name}</h6>
                                    {/* <div className="text-right"></div> */}
                                </div>
                                <TextTruncate className="small" lineClamp={1}>{item.messages.length > 0 ? item.messages[0].message : ""}</TextTruncate>
                                <div className="d-flex justify-content-between">
                                    <div className="small text-nowrap ">{item.messages.length > 0 ? DateTimeFormat(item.messages[0].created_at, 2) : ""}</div>
                                    {/* <div className="small text-nowrap ">{item.messages.length > 0 ? moment(item.messages[0].created_at).format('DD MMM') : ""}</div> */}
                                    <i className="fa fa-ellipsis-v text-dark" />
                                </div>
                            </div>

                            {item.unread > 0 && <div className={`unread bgc-accent-color ml-2`}>
                                <div className={`small text-white`}>{item.unread}</div>
                            </div>}
                        </div>
                    )
                })}
            </InfiniteScroll>
        </div>
    </>)

    chatMessage = () => (<>
        {this.state.chatrooms && this.state.chatrooms.map((item) => (
            <div className="h-100" key={item.id} hidden={this.state.current_chatroom_id !== item.id}>
                <ChatMessage
                    data={item}
                    send={this.sendMessage}
                    close={this.closeChat}
                    active={this.state.current_chatroom_id === item.id}
                    product={this.state.chatTo && this.state.chatTo.product}
                />
            </div>
        ))}
    </>)

    // renderType = mobile / desktop
    mainRender = (renderType) => (
        <div className="chat-container">
            {renderType === "desktop" && <>
                <div className="border" style={{ display: 'grid', gridTemplateRows: 'auto auto 1fr', height: '90vh' }}>
                    {this.chatContainerContacts(renderType)}
                </div>
                <div className="overflow-hidden border">
                    {this.chatMessage()}
                </div>
            </>}
            {renderType === "mobile" && <>
                <div className="border" style={{ display: 'grid', gridTemplateRows: 'auto auto 1fr' }} hidden={this.state.current_chatroom_id !== null}>
                    {this.chatContainerContacts(renderType)}
                </div>
                <div className="overflow-hidden border" hidden={this.state.current_chatroom_id === null}>
                    {this.chatMessage()}
                </div>
            </>}
        </div>
    )
    render() {
        const { t } = this.props;
        return (<>
            <style>{`   
                @media only screen and (max-width: 767.98px) {
                    .chat-container{
                        display: grid;
                        height: 100vh;
                    }
                }
                @media only screen and (min-width: 768px) {
                    .chat-container{
                        display: grid;
                        grid-template-columns: 1fr 2fr;
                        height: 90vh;
                        margin-top: 1rem;
                    }
                }
                .recipient {
                    color: #374650;
                }
                .recipient:hover {
                    color: #0056B3;
                    cursor: pointer;
                }
                .unread{
                    border-radius: 50%;
                    display: flex;
                    justify-content:center;
                    align-self:center;
                    align-items:center;
                    width: 2rem;
                    height: 1.4rem;
                }
            `}</style>
            <DetectContext context={this.context} onPayloadChange={this.onPayloadChange} onWsChange={this.onWsChange} />
            <Responsive desktop={
                <Template>
                    <MyContext.Consumer>{context => (
                        <div id='container-settings' className='pb-3'>
                            <MetaTrigger
                                pageTitle={context.companyName ? `${context.companyName} - ${t('account_setting.personal_chat')}` : ""}
                                pageDesc={t('account_setting.personal_chat')}
                            />
                            <h3 className='font-weight-bold text-dark'>
                                <div>
                                    {t('account_setting.personal_chat')}
                                    {/* Pesan Pribadi */}
                                </div>
                            </h3>
                            <Style themes={context.theme_settings} />
                            {this.mainRender("desktop")}
                        </div>
                    )}</MyContext.Consumer>
                </Template>
            } mobile={<>
                {this.mainRender("mobile")}
            </>} />

        </>)
    }
}

Chat.contextType = WebsocketContext

export default withTranslation()(Chat);
