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


class ResolutionCenterMobile extends Component {

    inputMessageKeyPress = (event) => {
        if (event.key === 'Enter') {
            this.props.parent.handleSubmit();
        }
    }

    render() {
        const { t } = this.props;
        return (<>
            <div hidden={!this.props.parent.state.selected_ticket}>
                {this.props.parent.state.selected_ticket && <div className="position-relative" style={{ height: '100vh', display: 'grid', gridTemplateRows: 'auto 1fr auto' }}>
                    <div style={{ cursor: 'pointer' }} className="text-decoration-none sticky-top bg-white p-3 mobile-header-chat-content">
                        <div className="row no-gutters">
                            <div className="w-100 d-flex align-items-center" style={{ flex: '0 0 7%', maxWidth: '0 0 7%' }} onClick={event => this.props.parent.setSelectedTicket('')}>
                                <i className="fas fa-long-arrow-alt-left color-404040 fa-lg"></i>
                            </div>
                            <div className="w-100 d-flex align-items-center px-2" style={{ flex: '0 0 93%', maxWidth: '0 0 93%' }}>
                                <div className="bg-white chat-content-header-info d-flex align-items-center justify-content-between w-100">
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
                            </div>
                        </div>
                    </div>
                    <div className="" id="user-content" style={{ overflow: 'auto' }}>
                        <div className="w-100 mt-3" >
                            {this.props.parent.state.selected_ticket.ticket_responses.map((value, index, array) => (
                                <div className="border-bottom p-3" key={value.id}>
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
                                <div className="row no-gutters mt-2 align-items-end">
                                    {this.props.parent.state.attachments.map((value, index, array) => (
                                        <div className="col-2 px-2" key={value.filename}>
                                            <TicketAttachmentForUpload filename={value.filename} src={value.src} index={index} removeAttachment={this.props.parent.removeAttachment} />
                                        </div>
                                    ))}
                                </div>
                            </div>}
                        {this.props.parent.state.selected_ticket.ticket_statuses[this.props.parent.state.selected_ticket.ticket_statuses.length - 1].status === 'in_process' &&
                            <div className="" style={{ borderTop: '1px solid #C1C8CE' }}>
                                <style jsx="true">{`
                                .box-input-message #input-message::placeholder {
                                    color: #95A4AF;
                                }
                                @media (max-width: 290px) {
                                    .flex-input {
                                        flex: 0 0 60%;
                                        max-width: 0 0 60%;
                                    }
                                    .flex-button {
                                        flex: 0 0 40%;
                                        max-width: 0 0 40%;
                                    }
                                }
                                @media (max-width: 374.98px) {
                                    .flex-input {
                                        flex: 0 0 70%;
                                        max-width: 0 0 70%;
                                    }
                                    .flex-button {
                                        flex: 0 0 30%;
                                        max-width: 0 0 30%;
                                    }
                                }
                                @media (min-width: 375px) {
                                    .flex-input {
                                        flex: 0 0 78%;
                                        max-width: 0 0 78%;
                                    }
                                    .flex-button {
                                        flex: 0 0 22%;
                                        max-width: 0 0 22%;
                                    }
                                }
                                @media (min-width: 768px) {
                                    .flex-input {
                                        flex: 0 0 80%;
                                        max-width: 0 0 80%;
                                    }
                                    .flex-button {
                                        flex: 0 0 20%;
                                        max-width: 0 0 20%;
                                    }
                                }
                            `}</style>
                                <div className="row no-gutters">
                                    <div className="w-100 flex-input">
                                        <input type="text" className="form-control typing-message border-0" id="input-message" placeholder={t('drs.type_something')}
                                            value={this.props.parent.state.input_message} onChange={this.props.parent.handleInputMessage}
                                            onKeyPress={this.inputMessageKeyPress} ref={this.props.parent.inputMessageRef}
                                        />
                                    </div>
                                    <div className="w-100 d-flex justify-content-end align-items-center flex-button">
                                        <label
                                            className="btn m-0"
                                            htmlFor={"upload-attachments"}
                                        ><i className="fas fa-paperclip color-3C454B"></i></label>
                                        <input
                                            type="file"
                                            id={"upload-attachments"}
                                            className="d-none"
                                            onChange={event => this.props.parent.uploadAttachment(event, () => {
                                                $('.upload-attachments').val('');
                                            })}
                                        />
                                        <button className="btn" onClick={this.props.parent.handleSubmit}>
                                            <i className="far fa-paper-plane color-1576BD"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>}
                    </div>
                </div>}
            </div>

            <div hidden={this.props.parent.state.selected_ticket}>
                <Template>
                    <MyContext.Consumer>{(context) => (<>
                        <div className="mt-3">
                            <div className="bg-white mt-3" style={{ height: '100vh' }}>
                                <h6 className="m-0 color-22262A font-weight-bold px-3 mb-2">{t('drs.resolution_center')} ({context.ticket_is_being_process})</h6>
                                {this.props.parent.state.data.map((value, index, array) => (
                                    <a className="w-100 chat-room text-decoration-none" href="javascript:void(0)" onClick={event => this.props.parent.setSelectedTicket(value)} key={value.id}>
                                        <div className={this.props.parent.state.selected_ticket && this.props.parent.state.selected_ticket.id === value.id && 'active'}>
                                            <div className="px-3 pt-2">
                                                <table className="w-100">
                                                    <tbody>
                                                        <tr>
                                                            <td valign="middle" width="80%" className="px-2">
                                                                <TextTruncate lineClamp={1} className="mb-1 color-5F6C73 font-weight-bold small">
                                                                    {value.title}
                                                                    {this.props.parent.getStatusName(value)}
                                                                </TextTruncate>
                                                                <TextTruncate lineClamp={1} className="m-0 color-5F6C73 ">ID: {value.ticket_number}</TextTruncate>
                                                            </td>
                                                            <td align="right" valign="middle" width="20%">
                                                                <p className="mb-1 color-374650 ">{DateTimeFormat(value.ticket_responses[value.ticket_responses.length - 1].created_at, 2)}</p>
                                                                <p className="m-0 color-374650 ">({value.ticket_responses.length})</p>
                                                            </td>
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
                    </>)}</MyContext.Consumer>
                </Template>
            </div>
        </>);
    }
}

export default withTranslation()(ResolutionCenterMobile);