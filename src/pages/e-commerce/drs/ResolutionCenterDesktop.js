import React, { Component } from 'react';
import { Link } from "react-router-dom";
import $ from "jquery";
import TextTruncate from '../../../components/helpers/TextTruncate';
import { TinyMceContent } from '../../../components/helpers/TinyMceEditor';
import { withTranslation } from "react-i18next";
import Template from '../../../components/Template';
import MyContext from '../../../components/MyContext';
import { TicketAttachment, TicketAttachmentForUpload } from './helper';
import { DateTimeFormat } from '../../../components/helpers/DateTimeFormat';
import MetaTrigger from '../../../components/MetaTrigger';

class ResolutionCenterDesktop extends Component {

    inputMessageKeyPress = (event) => {
        if (event.key === 'Enter') {
            this.props.parent.handleSubmit();
        }
    }

    render() {
        const { t } = this.props;
        return (
            <Template>

                <MyContext.Consumer>{(context) => (<>
                    <MetaTrigger
                        pageTitle={context.companyName ? `${context.companyName} - ${t('drs.resolution_center')}` : ""}
                        pageDesc={t('drs.resolution_center')}
                    />
                    <style jsx="true">{`
                    .user-list::-webkit-scrollbar, #user-content::-webkit-scrollbar {
                        width: 4px;
                    }
                    .user-list::-webkit-scrollbar-thumb, #user-content::-webkit-scrollbar-thumb {
                        background-color: #0F74BD;
                        border-radius: 4px;
                    }
                    .message-navigation {
                        font-size: 80%;
                        width: 175px;
                        position: fixed;
                    }
                    .chat-room .active {
                       background-color: #EBEBEB;
                       border-left:5px solid #F8931D;
                    }
                        
                    .link-attachment {
                        color: #5F6C73;
                    }
                    .link-attachment:hover {
                        color: #007BFF;
                        cursor: pointer;
                        text-decoration: underline;
                    }
                `}</style>
                    <div className="container-xsdcn">
                        <div className="my-3">
                            {
                                window.safari &&
                                <div className="alert alert-danger">For better experience please use Chrome or Firefox browser instead</div>
                            }
                            <h3 className="m-0 color-22262A font-weight-bold mb-2 ">{t('drs.resolution_center')} ({context.ticket_is_being_process})</h3>
                            <div className="row no-gutters bg-white shadow-graph" style={{ height: 'calc(100vh - (1.5em + .75rem + 2px) - 12rem)' }}>
                                <div className="w-100" style={{ flex: '0 0 30%', maxWidth: '0 0 30%' }}>
                                    <div className="p-3">
                                        <div class="input-group w-100">
                                            <input
                                                type="text"
                                                class="form-control"
                                                placeholder="Cari nama pengguna..."
                                                onChange={this.props.parent.handleSearch}
                                                value={this.props.parent.state.search}
                                            />
                                            <div class="input-group-append">
                                                <button className='btn bgc-accent-color'>
                                                    <i className="fa fa-search" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="user-list" style={{ height: 'calc(100vh - (1.5em + .75rem + 2px) - 19rem)', overflow: 'auto' }}>
                                        {this.props.parent.state.data.map((value, index, array) => (
                                            <a className="w-100 chat-room text-decoration-none" href="javascript:void(0)" onClick={event => this.props.parent.setSelectedTicket(value)}>
                                                <div className={this.props.parent.state.selected_ticket && this.props.parent.state.selected_ticket.id === value.id && 'active'}>
                                                    <div className="px-3 pt-2">
                                                        <table className="w-100">
                                                            <tbody>
                                                                <tr>
                                                                    <td valign="middle" width="80%" className="px-2">
                                                                        <div className='d-flex justify-content-between align-items-end'>
                                                                            <div>
                                                                                <TextTruncate lineClamp={1} className="mb-1 color-5F6C73 font-weight-bold ">
                                                                                    {value.title}
                                                                                    {this.props.parent.getStatusName(value)}
                                                                                </TextTruncate>
                                                                                <TextTruncate lineClamp={1} className="m-0 color-5F6C73 small">ID: {value.ticket_number}</TextTruncate>
                                                                                <p className="mb-1 color-374650 small">{DateTimeFormat(value.ticket_responses[value.ticket_responses.length - 1].created_at, 2)}</p>
                                                                            </div>
                                                                            <i className="fa fa-ellipsis-v text-dark" />
                                                                        </div>
                                                                    </td>
                                                                    {/* <td align="right" valign="middle" width="20%">
                                                                        <p className="m-0 color-374650 ">({value.ticket_responses.length})</p>
                                                                    </td> */}
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    <div className="border-top mt-2"></div>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                                <div className="h-100 w-100 border-left" style={{ flex: '0 0 70%', maxWidth: '0 0 70%' }}>
                                    <div className="h-100">
                                        {this.props.parent.state.selected_ticket &&
                                            <div className="d-none d-sm-none d-md-block d-lg-block d-xl-block h-100">
                                                <div className="position-relative h-100" style={{ display: 'grid', gridTemplateRows: 'auto 1fr auto' }}>
                                                    <div className="bg-white shadow-graph chat-content-header-info d-flex align-items-center justify-content-between w-100" style={{ padding: '0.7rem' }}>
                                                        <div className="">
                                                            <TextTruncate lineClamp={1} className="mb-1 color-5F6C73 font-weight-bold small">
                                                                {this.props.parent.state.selected_ticket.title}
                                                                {this.props.parent.getStatusName(this.props.parent.state.selected_ticket)}
                                                            </TextTruncate>
                                                            <TextTruncate lineClamp={1} className="m-0 color-5F6C73 ">{this.props.parent.state.selected_ticket.ticket_number}</TextTruncate>
                                                        </div>
                                                        <div className="text-right">
                                                            <this.props.parent.ViewOrderButton t={t} />
                                                            <this.props.parent.ResolveButton t={t} />
                                                        </div>
                                                    </div>
                                                    <div className="" id="user-content" style={{ overflow: 'auto' }}>
                                                        <div className="w-100">
                                                            {this.props.parent.state.selected_ticket.ticket_responses.map((value, index, array) => (
                                                                <div className="border-bottom p-3">
                                                                    <p className="mb-2 color-5F6C73 font-weight-bold small">{value.user && value.user.name}</p>
                                                                    <TinyMceContent className="m-0 color-5F6C73 ">{value.response}</TinyMceContent>
                                                                    <div className="row mt-2">
                                                                        <div className="col-8">
                                                                            <div className="row align-items-end">
                                                                                {value.ticket_response_media.map((value1, index1, array1) => (
                                                                                    <div className="col-3" key={value1.id}>
                                                                                        <TicketAttachment id={value1.id} type={value1.type} media={value1.media} />
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="box-input-message w-100" style={{ bottom: 2, left: 0, right: 0 }}>
                                                        {this.props.parent.state.attachments.length > 0 &&
                                                            <div className="attachments bg-white p-2">
                                                                <div className="text-right">
                                                                    <a href="javascript:void(0)" className="text-decoration-none" onClick={this.props.parent.removeAllAttachments}>
                                                                        <h6 className="m-0">&times;</h6>
                                                                    </a>
                                                                </div>
                                                                <style jsx="true">{`
                                                        .temp-attachment {
                                                            min-height: 6rem;
                                                        }
                                                    `}</style>
                                                                <div className="row no-gutters mt-2 align-items-end">
                                                                    {this.props.parent.state.attachments.map((value, index, array) => (
                                                                        <div className="col-2 px-2" key={value.filename}>
                                                                            <TicketAttachmentForUpload filename={value.filename} src={value.src} index={index} removeAttachment={this.props.parent.removeAttachment} />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>}
                                                        {this.props.parent.state.selected_ticket.ticket_statuses[this.props.parent.state.selected_ticket.ticket_statuses.length - 1].status === 'in_process' &&
                                                            <div className="shadow-graph px-3 " style={{ borderTop: '1px solid #C1C8CE' }}>
                                                                <div className="row no-gutters mt-2">
                                                                    <div className="" style={{ flex: '1 0 auto' }}>
                                                                        <style jsx="true">
                                                                            {`
                                                                                .box-input-message #input-message::placeholder {
                                                                                    color: #95A4AF;
                                                                                }
                                                                        `}
                                                                        </style>
                                                                        <input type="text" className="form-control typing-message" id="input-message" placeholder={t('drs.type_something')}
                                                                            value={this.props.parent.state.input_message} onChange={this.props.parent.handleInputMessage}
                                                                            onKeyPress={this.inputMessageKeyPress} ref={this.props.parent.inputMessageRef}
                                                                        />
                                                                    </div>
                                                                    <div className="d-flex justify-content-end align-items-center ml-2" style={{ flex: '0 0 auto' }}>
                                                                        <button className="btn bgc-accent-color text-white" style={{ borderRadius: "50%" }} onClick={this.props.parent.handleSubmit}>
                                                                            <i className="far fa-paper-plane color-1576BD"></i>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <div className='d-flex align-items-center'>
                                                                    <i class="far fa-image mr-2 color-8D8D8D"></i>
                                                                    <i class="fab fa-youtube color-8D8D8D"></i>
                                                                    <div>
                                                                        <label
                                                                            className="btn m-0"
                                                                            htmlFor={"upload-attachments"}
                                                                        ><i className="fas fa-file color-8D8D8D"></i></label>
                                                                        <input
                                                                            type="file"
                                                                            id={"upload-attachments"}
                                                                            className="d-none"
                                                                            onChange={event => this.props.parent.uploadAttachment(event, () => {
                                                                                $('.upload-attachments').val('');
                                                                            })}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>}
                                                    </div>
                                                </div>
                                            </div>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>)}</MyContext.Consumer>
            </Template>
        );
    }
}

export default withTranslation()(ResolutionCenterDesktop);