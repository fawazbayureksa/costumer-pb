import React, { PureComponent } from 'react';
import axios from "axios";
import Cookie from "js-cookie";
import Config, { ErrorHandler } from '../../../components/axios/Config';
import SwalToast from '../../../components/helpers/SwalToast';
import ExceedUploadLimit from '../../../components/helpers/ExceedUploadLimit';
import { withTranslation } from "react-i18next";
import Responsive from '../../../components/helpers/Responsive';
import ResolutionCenterDesktop from './ResolutionCenterDesktop';
import ResolutionCenterMobile from './ResolutionCenterMobile';
import { Link } from 'react-router-dom';
import CustomerRoutePath from '../customer/CustomerRoutePath';
import { Modal } from 'react-bootstrap';

class ResolutionCenterResponsive extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            attachments: [],
            selected_ticket: null,
            input_message: '',
            search: '',
            current_image_preview: '',
            
            submitting: false, 

            show_resolve_modal: false,
        };
        this.updateChatContent = this.updateChatContent.bind(this);
        this.getTickets = this.getTickets.bind(this);
        this.setSelectedTicket = this.setSelectedTicket.bind(this);
        this.handleInputMessage = this.handleInputMessage.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleResolve = this.handleResolve.bind(this);
        this.uploadAttachment = this.uploadAttachment.bind(this);
        this.removeAttachment = this.removeAttachment.bind(this);
        this.removeAllAttachments = this.removeAllAttachments.bind(this);
        this.showImagePreview = this.showImagePreview.bind(this);
        
        this.inputMessageRef = React.createRef()
    }

    showImagePreview(filename, callback = null) {
        this.setState({
            current_image_preview: filename
        }, () => {
            if (callback) callback();
        });
    }

    componentDidMount() {
        this.getTickets();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.search !== this.state.search) {
            clearTimeout(this.timeoutSearch)
            this.timeoutSearch = setTimeout(() => {
                this.getTickets()
            }, 500);
        }
    }

    updateChatContent() {
        let userContent = document.getElementById("user-content");
        if(userContent){
            let userContentChildren = userContent.getElementsByTagName("div");
            if(userContentChildren.length > 0) {
                let scrollHeight = userContent.scrollHeight
                userContent.scrollTop = scrollHeight
            }
        }        
    }

    handleSearch(event) {
        this.setState({
            search: event.target.value
        });
    }

    getTickets() {
        axios.get(`${process.env.REACT_APP_BASE_API_URL}drs/ticket/get?search=${this.state.search}`, Config({
            Authorization: 'Bearer ' + Cookie.get('token')
        })).then(response => {
            if (response.data.success) {
                console.log("data ticket ->", response.data.data)
                this.setState({
                    data: response.data.data
                }, () => {
                    this.updateChatContent();
                    if (
                        typeof this.state.selected_ticket !== 'undefined' &&
                        this.state.selected_ticket !== undefined &&
                        this.state.selected_ticket !== null &&
                        this.state.selected_ticket !== ''
                    ) {
                        this.setSelectedTicket(response.data.data.find((value, index, obj) => value.id === this.state.selected_ticket.id));
                    }
                    let ticket_id = this.props.location.ticket_id;
                    if (
                        typeof ticket_id !== 'undefined' &&
                        ticket_id !== undefined &&
                        ticket_id !== null &&
                        ticket_id !== ''
                    ) {
                        this.setSelectedTicket(response.data.data.find((value, index, obj) => value.id === ticket_id));
                    }
                });
            } else this.getTickets();
        }).catch(error => {
            ErrorHandler(error);
            console.error(error);
        });
    }

    setSelectedTicket(value) {
        this.setState({
            selected_ticket: value
        }, () => this.updateChatContent());
    }

    handleInputMessage(event) {
        this.setState({
            input_message: event.target.value
        });
    }

    handleSubmit() {
        let input = this.state.input_message;
        if (typeof input !== 'undefined' && input !== undefined && input !== null && input !== '' && input.replace(/\s/g, '').length > 0) {
            axios.post(`${process.env.REACT_APP_BASE_API_URL}drs/ticket/send-response`, {
                ticket_id: this.state.selected_ticket.id,
                response: input,
                attachments: this.state.attachments.map((item) => (item.filename)),
            }, Config({
                Authorization: 'Bearer ' + Cookie.get('token')
            })).then(response => {
                this.setState({
                    input_message: '',
                    attachments: [],
                }, () => {
                    this.getTickets();
                });
            }).catch(error => {
                ErrorHandler(error);
                this.setState({
                    input_message: '',
                    attachments: [],
                }, () => {
                    SwalToast.fire({
                        icon: 'error',
                        title: 'Failed to Submit.'
                    });
                });
            });
        } else{
            if(this.inputMessageRef.current) this.inputMessageRef.current.focus()
            SwalToast.fire({
                icon: 'error',
                title: 'Message is empty.'
            });
        }
    }

    handleResolve() {
        this.setState({submitting: true})
        axios.post(`${process.env.REACT_APP_BASE_API_URL}drs/ticket/resolve`, {
            ticket_id: this.state.selected_ticket.id,
        }, Config({
            Authorization: 'Bearer ' + Cookie.get('token')
        })).then(response => {
            this.getTickets();
        }).catch(error => {
            ErrorHandler(error);
            SwalToast.fire({
                icon: 'error',
                title: 'Failed to resolve.'
            });
        }).finally(()=>{
            this.setState({submitting: false})
        })
    }

    uploadAttachment(event, callback = null) {
        let file = event.target.files[0];
        if (file) {
            let exceed = ExceedUploadLimit(file)
            if (exceed.value) {
                SwalToast.fire({
                    icon: 'error',
                    title: `Limit upload size is ${exceed.max_size / 1024} Kb`
                });
                return;
            }

            this.setState({
                button_disabled: true,
            }, () => {
                let form = new FormData();
                form.append('file', file);
                axios.post(`${process.env.REACT_APP_BASE_API_URL}drs/ticket/save-file`, form, Config({
                    Authorization: `Bearer ${Cookie.get('token')}`,
                    'Content-Type': 'multipart/form-data'
                })).then(response => {
                    let fileUrl = URL.createObjectURL(file)

                    let temp_attachments = [...this.state.attachments];
                    temp_attachments.push({
                        filename: response.data.data,
                        src: fileUrl,
                    });
                    this.setState({
                        button_disabled: false,
                        attachments: [...temp_attachments]
                    });
                }).catch(error => {
                    ErrorHandler(error);
                    console.log('ererr', error.response);
                    this.setState({
                        button_disabled: false,
                    }, () => {
                        if (error.response) {
                            SwalToast.fire({
                                icon: 'error',
                                title: error.response.data.message
                            });
                        }
                        else SwalToast.fire({
                            icon: 'error',
                            title: 'Whoops, something went wrong!'
                        });
                    });
                }).finally(() => {
                    if (callback) callback();
                });
            });
        }
    }

    removeAttachment(index) {
        let temp_attachments = [...this.state.attachments];
        temp_attachments.splice(index, 1);
        this.setState({
            attachments: [...temp_attachments]
        });
    }

    removeAllAttachments() {
        this.setState({
            attachments: []
        });
    }

    inputMessageKeyPress = (event) => {
        if (event.key === 'Enter') {
            this.handleSubmit();
        }
    }

    ResolveButton=({t})=>{
        if(this.state.selected_ticket && this.state.selected_ticket.ticket_statuses[this.state.selected_ticket.ticket_statuses.length - 1].status === 'in_process') return(<>
            <button type="button" className="ml-2 btn btn-sm btn-success" onClick={()=>{this.setState({show_resolve_modal: true})}}>{t('drs.resolve')}</button>
            <Modal centered show={this.state.show_resolve_modal} onHide={()=>{this.setState({show_resolve_modal: false})}}>
                <Modal.Header>
                    <Modal.Title>{t('drs.resolve')}?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="d-flex">
                        <button type="button" onClick={()=>{this.setState({show_resolve_modal: false})}} className="btn border-707070 color-374650 mr-1 flex-grow-1" style={{fontWeight: 500}}>
                            {t('drs.no')}
                        </button>
                        <button type="submit" onClick={this.handleResolve} disabled={this.state.submitting} className="btn bgc-00896A text-white font-weight-bold flex-grow-1">
                            {t('drs.yes')}
                        </button>
                    </div>
                </Modal.Body>
            </Modal>
        </>)
        else return null
    }

    ViewOrderButton=({t})=>{
        let transaction_information = this.state.selected_ticket.ticket_customer_details.find(value => value.key === 'transaction_information')
        if(transaction_information) {
            let transaction_information_value = JSON.parse(transaction_information.value)
            let transaction_code = transaction_information_value.find(x=>x.key === "transaction_code")
            
            return(
                <Link to={CustomerRoutePath.ACCOUNT_SETTINGS_MY_ORDERS_DETAIL.replace(':order_code', transaction_code.value)} className="btn btn-sm border-0F74BD color-0F74BD">{t('drs.view_order')}</Link>
            )
        }
        else return null                                            
    }

    getStatusName=(currentTicket)=>{
        if(currentTicket){
            let currentStatus = currentTicket.ticket_statuses[currentTicket.ticket_statuses.length - 1].status
            if(currentStatus === 'pending') return '[Pending]'
            else if(currentStatus === 'resolved') return '[Closed]'
        }

        return ''
    }

    render() {
        const { t } = this.props;
        return <>
            <Responsive desktop={<ResolutionCenterDesktop parent={this} />} mobile={<ResolutionCenterMobile parent={this} />} />
        </>;
    }
}

export default withTranslation()(ResolutionCenterResponsive);;