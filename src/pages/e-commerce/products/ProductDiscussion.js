import React, { PureComponent } from 'react';
import IsEmpty from "../../../components/helpers/IsEmpty";
import Cookie from "js-cookie";
import Paginate from "../../../components/helpers/Paginate";
import { withTranslation } from 'react-i18next';
import axios from "axios";
import Config from "../../../components/axios/Config";
import ErrorDiv from '../../../components/helpers/ErrorDiv';
import SwalToast from '../../../components/helpers/SwalToast';
import { Link } from 'react-router-dom';
import AuthRoutePath from '../../auth/AuthRoutePath';
import update from 'immutability-helper';
import CustomImage, { PublicStorageFolderPath } from '../../../components/helpers/CustomImage';
import { DateTimeFormat } from '../../../components/helpers/DateTimeFormat';

let Style = () => {
    return (
        <style>
            {`
                .active {
                    border: 2px solid #000000 !important;
                    color: #000000;
                    cursor: auto;
                }
            `}
        </style>
    )
}

class ProductDiscussion extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            page_count: 0,
            page: 1,
            records: [],
            reply: "",
            new_discussion: "",
            errors: {},
            showReplies: []
        };
    }

    componentDidMount = () => {
        this.getData()
    }

    onPageChange = (page) => {
        this.setState({
            page
        }, () => this.getData())
    }

    getData = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}discussion/getWithParams`
        let params = {
            page: this.state.page,
            per_page: 10,
            product_id: this.props.productDetail.id
        }
        axios.get(url, Config({

        }, params)).then(res => {
            console.log(res)
            this.setState({
                records: res.data.data.data,
                page_count: res.data.data.last_page
            })
        }).catch((error) => {
            console.log(error)
            if (error.response) console.log(error.response)
        })
    }

    reply = (id) => {
        let errors = {}
        this.setState({ submitting: false, error_new_discussion: "", errors })
        if (IsEmpty(this.state["reply_" + id])) {
            errors["reply_" + id] = "Your reply is required"
            this.setState({ errors })
        } else {
            let data = {
                reply: this.state["reply_" + id],
                product_discussion_id: id
            }

            let url = `${process.env.REACT_APP_BASE_API_URL}discussion/reply`
            axios.post(url, data, Config({
                Authorization: 'Bearer ' + Cookie.get('token'),
            })).then(res => {
                SwalToast.fire({ icon: "success", title: res.data.message })
                this.setState({ submitting: false, ["reply_" + id]: "", error_new_discussion: "", errors })
                this.getData()
            }).catch((error) => {
                this.setState({ submitting: false })
                if (error.response) {
                    console.log(error.response)
                    SwalToast.fire({ icon: 'error', title: error.response.data.message });
                } else {
                    SwalToast.fire({
                        icon: 'error',
                        title: 'Whoops, something went wrong!'
                    });
                }
            })
        }
    }

    send = () => {
        this.setState({ submitting: false, error_new_discussion: "", errors: {} })
        if (IsEmpty(this.state.new_discussion)) {
            this.setState({ error_new_discussion: "Your discussion is required" })
        } else {
            let data = {
                new_discussion: this.state.new_discussion,
                product_id: this.props.productDetail.id
            }

            let url = `${process.env.REACT_APP_BASE_API_URL}discussion/new_discussion`
            axios.post(url, data, Config({
                Authorization: 'Bearer ' + Cookie.get('token'),
            })).then(res => {
                SwalToast.fire({ icon: "success", title: res.data.message })
                this.setState({ submitting: false, new_discussion: "", error_new_discussion: "", errors: {} })
                this.getData()
            }).catch((error) => {
                this.setState({ submitting: false })
                if (error.response) {
                    console.log(error.response)
                    SwalToast.fire({ icon: 'error', title: error.response.data.message });
                } else {
                    SwalToast.fire({
                        icon: 'error',
                        title: 'Whoops, something went wrong!'
                    });
                }
            })
        }
    }

    more = index => {
        let newIndex = parseInt(this.state.showReplies[index] ? this.state.showReplies[index] : 1)
        newIndex += 3
        this.setState({
            showReplies: update(this.state.showReplies, {
                [index]: { $set: newIndex }
            })
        })
    }

    render() {
        const { t } = this.props;
        return (
            <div>
                <Style />
                {this.state.records.length > 0 ? <><div className="shadow-graph bg-white rounded">
                    {this.state.records.map((item, index) => (<div key={item.id} className="mb-4 p-3">
                        <div className={`${index < this.state.records.length - 1 && "border-bottom"}`}>
                            <div className="pb-3 d-flex">
                                <div className="col-3 col-sm-3 col-md-3 col-lg-1 col-xl-1">
                                    <CustomImage folder={PublicStorageFolderPath.customer} filename={item.mp_customer.profile_picture} alt={item.mp_customer.profile_picture} className="object-fit-cover rounded" style={{ width: 80, height: 80 }} />

                                </div>
                                <div className="col-9 col-sm-9 col-md-9 col-lg-11 col-xl-11 ml-3">
                                    <div className="d-flex">
                                        <div className="small   font-weight-bold">{item.mp_customer.name}</div>
                                        <div className="small  mt-1 ml-2">{DateTimeFormat(item.created_at, 5)}</div>
                                    </div>
                                    <div className="small   mt-2">{item.content}</div>
                                </div>
                            </div>
                            {item.mp_product_discussion_replies.length > 0 && item.mp_product_discussion_replies.length > parseInt(this.state.showReplies[index] ? this.state.showReplies[index] : 1) &&
                                <div className="p-3 d-flex">
                                    <div className="col-3 col-sm-3 col-md-3 col-lg-1 col-xl-1">
                                    </div>
                                    <div className="col-9 col-sm-9 col-md-9 col-lg-11 col-xl-11">
                                        <div className="small  font-weight-bold color-EC9700" onClick={() => this.more(index)}>{t("product_detail.view_more_replies")}</div>
                                    </div>
                                </div>}
                            {item.mp_product_discussion_replies.map((reply, replyIndex) => (
                                replyIndex > item.mp_product_discussion_replies.length - 1 - parseInt(this.state.showReplies[index] ? this.state.showReplies[index] : 1) &&
                                <div className="p-3 d-flex">
                                    <div className="col-1 col-sm-1 col-md-1 col-lg-1 col-xl-1">
                                    </div>
                                    <div className="col-3 col-sm-3 col-md-3 col-lg-1 col-xl-1 border-left">
                                        {
                                            reply.user_type == "seller" ?
                                                <CustomImage folder={PublicStorageFolderPath.seller} filename={reply.mp_seller.logo} alt={reply.mp_seller.logo} className="object-fit-cover rounded" style={{ width: 80, height: 80 }} /> :
                                                <CustomImage folder={PublicStorageFolderPath.customer} filename={reply.mp_customer.profile_picture} alt={reply.mp_customer.profile_picture} className="object-fit-cover rounded" style={{ width: 80, height: 80 }} />
                                        }
                                    </div>
                                    <div className="col-8 col-sm-8 col-md-8 col-lg-10 col-xl-10">
                                        <div className="d-flex">
                                            {
                                                reply.user_type == "seller" ?
                                                    <div className="small  font-weight-bold">{reply.mp_seller.name}</div> :
                                                    <div className="small  font-weight-bold">{reply.mp_customer.name}</div>
                                            }
                                            <div className="small  mt-1 ml-2">{DateTimeFormat(reply.created_at, 5)}</div>
                                        </div>
                                        <div className="small   mt-2">{reply.content}</div>
                                    </div>
                                </div>
                            ))}
                            {Cookie.get("token") &&
                                <div className="p-3 d-flex">
                                    <div className="col-1 col-sm-3 col-md-3 col-lg-1 col-xl-1">
                                    </div>
                                    <div className="col-9 col-sm-9 col-md-9 col-lg-11 col-xl-11">
                                        <textarea
                                            className="form-control"
                                            placeholder="Insert your reply.."
                                            onChange={e => this.setState({ ["reply_" + item.id]: e.target.value })}
                                            value={this.state["reply_" + item.id]}
                                        />
                                        <ErrorDiv error={this.state.errors["reply_" + item.id]} style="small " />
                                        <button className="btn text-white bgc-EC9700 shadow-graph font-weight-bold mt-2" disabled={this.state.submitting} onClick={() => this.reply(item.id)}>Send</button>
                                    </div>
                                </div>}
                        </div>
                    </div>))}
                </div>
                    <div className="mt-3">
                        <Paginate pageCount={this.state.page_count} onPageChange={this.onPageChange} initialPage={this.state.page} />
                    </div>
                </> :
                    <div className="shadow-graph p-3 mt-4">
                        <div className="small">{t("product_detail.no_discussion")}</div>
                    </div>}
                {Cookie.get("token") ?
                    <div className="mt-4">
                        <textarea
                            className="form-control"
                            placeholder={t("product_detail.make_new_discussion")}
                            onChange={e => this.setState({ new_discussion: e.target.value })}
                            value={this.state.new_discussion}
                        />
                        <ErrorDiv error={this.state.error_new_discussion} style="small " />
                        <div className="text-right">
                            <button className="btn text-white bgc-EC9700 shadow-graph font-weight-bold mt-2" disabled={this.state.submitting} onClick={this.send}>{t("general.send")}</button>
                        </div>
                    </div> :
                    <div className="shadow-graph d-flex justify-content-between p-3 mt-4">
                        <div className="small  mt-1">{t("product_detail.any_question")}</div>
                        <Link to={AuthRoutePath.LOGIN}><button className="btn text-white bgc-EC9700 shadow-graph font-weight-bold">{t("product_detail.make_new_discussion")}</button></Link>
                    </div>}
            </div>
        )
    }
}

/**
 * @param {object} productDetail product detail
 */
export default withTranslation()(ProductDiscussion)