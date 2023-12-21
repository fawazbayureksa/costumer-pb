import { PureComponent } from "react";
import { WebsocketContext, WebsocketPayloadType } from "./WebsocketHelper";
import Cookie from 'js-cookie'
import axios from 'axios';
import update from 'immutability-helper'
import Config from "../axios/Config";

export default class Websocket extends PureComponent {

    constructor(props) {
        super(props);

        // state variables
        this.state = {
            contextData: {
                status: {
                    name: 'OFFLINE',
                    color: '#374650'
                },
                payload: null,
                ws: null,
                unread: 0,
                changeContext: () => { },
            },
        }

        this.ws = ""

        this.refreshMasterDataTimeout = null;

        let currentUser = Cookie.get('user') ? JSON.parse(Cookie.get('user')) : {}
        this.currentUserType = "customer"
        this.currentUserID = currentUser.id

    }
    componentDidMount() {
        this.getMasterData()
    }
    componentWillUnmount() {
        if (this.ws) this.ws.close()
        if (this.refreshMasterDataTimeout) clearTimeout(this.refreshMasterDataTimeout)
        if (this.recurringPingTimeout) clearTimeout(this.recurringPingTimeout)
    }

    getMasterData = () => {
        if (!Cookie.get('token')) return;
        if (!JSON.parse(process.env.REACT_APP_FEATURE_MARKETPLACE)) return;

        let url = `${process.env.REACT_APP_BASE_API_URL}chat/getMasterData`
        axios.post(url, null, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        })).then(res => {
            this.setState({
                contextData: update(this.state.contextData, {
                    unread: { $set: res.data.data.unread },
                    changeContext: { $set: this.changeContext }
                })
            })

            this.openWebsocket(res.data.data.websocketToken)
        }).catch((error) => {
            console.log(error)
            if (error.response) {
                console.log(error.response)
            }
            this.refreshMasterData()
        }).finally(() => {

        })
    }

    changeContext = (column, value) => {
        this.setState({
            contextData: update(this.state.contextData, {
                [column]: { $set: value }
            })
        })
    }
    openWebsocket = (token) => {
        // establish websocket connection to backend server.
        this.ws = new WebSocket(`${process.env.REACT_APP_BASE_API_URL_WS}chat/openWebsocket/${token}`);

        this.setState({
            contextData: update(this.state.contextData, {
                status: {
                    $set: {
                        name: "CONNECTING...",
                        color: "#0F74BD",
                    }
                }
            })
        })
        this.ws.onopen = (event) => this.onOpen(event)
        this.ws.onerror = (event) => this.onError(event)
        this.ws.onclose = (event) => this.onClose(event)
        this.ws.onmessage = (event) => this.onMessage(event)
    }

    onOpen = (event) => {
        // console.log("websocket is opened", event)

        this.setState({
            contextData: update(this.state.contextData, {
                ws: { $set: this.ws },
                status: {
                    $set: {
                        name: "CONNECTED",
                        color: "#8CC73F",
                    }
                },
            })
        })
        if (this.refreshMasterDataTimeout) clearTimeout(this.refreshMasterDataTimeout)

        if (this.recurringPingTimeout) clearTimeout(this.recurringPingTimeout)
        this.recurringPingTimeout = setInterval(() => {
            this.ws.send("ping!")
        }, 30 * 1000);
    }

    onError = (event) => {
        // console.log("websocket is error", event)
        this.setState({
            contextData: update(this.state.contextData, {
                status: {
                    $set: {
                        name: "ERROR",
                        color: "#EB2424",
                    }
                }
            })
        })
        this.refreshMasterData()
    }

    onClose = (event) => {
        // console.log("websocket is closed", event)

        this.setState({
            contextData: update(this.state.contextData, {
                status: {
                    $set: {
                        name: "DISCONNECTED",
                        color: "#EB2424",
                    }
                }
            })
        })
        this.refreshMasterData()
    }

    onMessage = (event) => {
        if (!Cookie.get('token')) this.ws.close();

        let payload = JSON.parse(event.data)
        console.log('websocket message:', payload);

        this.setState({
            contextData: update(this.state.contextData, {
                payload: { $set: payload }
            })
        })

        if (payload.type === WebsocketPayloadType.MessageData) {
            if (payload.data.user_type === this.currentUserType && payload.data.user_id === this.currentUserID) {
                // do nothing         
            } else {
                this.setState({
                    contextData: update(this.state.contextData, {
                        unread: { $apply: (original) => original + 1 }
                    })
                })
            }

        }
    }

    refreshMasterData = () => {
        if (this.refreshMasterDataTimeout) clearTimeout(this.refreshMasterDataTimeout)
        this.refreshMasterDataTimeout = setTimeout(() => {
            this.getMasterData()
        }, process.env.REACT_APP_WEBSOCKET_TIMEOUT);

        if (this.recurringPingTimeout) clearTimeout(this.recurringPingTimeout)
    }

    render() {
        return (
            <WebsocketContext.Provider value={this.state.contextData}>
                {this.props.children}
            </WebsocketContext.Provider>
        )
    }
}