import React, { PureComponent } from 'react';
import Select from "react-select";
import $ from "jquery";
import axios from "axios";
import Cookie from "js-cookie";
import { withTranslation } from "react-i18next";
import { TinyMceContent, TinyMcePreview } from '../../../components/helpers/TinyMceEditor';
import TextTruncate from '../../../components/helpers/TextTruncate';
import Template from '../../../components/Template';
import EcommerceRoutePath from '../EcommerceRoutePath';
import Config from '../../../components/axios/Config';
import SwalToast from '../../../components/helpers/SwalToast';
import TreeView from '../../../components/helpers/tree-view/TreeView';
import { TransactionOrderRow } from './helper';
import MyContext from '../../../components/MyContext';
import MetaTrigger from '../../../components/MetaTrigger';

class Faq extends PureComponent {
    constructor(props) {
        super(props);
        this.faq_responses = {
            first: 'helpful',
            second: 'not_helpful',
        };

        this.state = {
            data: [],
            search_result: [],
            most_view_faqs: [],
            ticket_categories: [],
            current_faq: {
                id: 0,
                parent_id: null,
                code: '',
                title: '',
                description: '',
                have_response_submitted: false
            },
            search: '',
            faq_id_selected: 0,
            faq_response: '',
            faq_response_message: '',
            button_disabled: false,
            show_create_ticket_view: false,
            create_ticket: {
                category_id: '',
                title: '',
                description: '',
                attachments: [''],
            },
            create_ticket_errors: {
                category_id: '',
                title: '',
                description: '',
                attachments: [''],
            },

            transaction: this.props.location.state
        };
        this.getMostViewFaqs = this.getMostViewFaqs.bind(this);
        this.getFaqs = this.getFaqs.bind(this);
        this.searchFaqs = this.searchFaqs.bind(this);
        this.setFaqIdSelected = this.setFaqIdSelected.bind(this);
        this.getFaqDetail = this.getFaqDetail.bind(this);
        this.submitResponse = this.submitResponse.bind(this);
        this.submitTicket = this.submitTicket.bind(this);
        this.saveAttachment = this.saveAttachment.bind(this);
        this.addAttachmentRow = this.addAttachmentRow.bind(this);
        this.deleteAttachmentRow = this.deleteAttachmentRow.bind(this);

        console.log('transaction', this.state.transaction)
    }

    componentDidMount() {
        this.getMostViewFaqs();
        this.getFaqs();
        this.getTicketCategories();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.search !== this.state.search) {
            clearTimeout(this.timeoutSearch)
            this.timeoutSearch = setTimeout(() => {
                this.searchFaqs()
            }, 500);
        }
    }

    getMostViewFaqs() {
        axios.get(`${process.env.REACT_APP_BASE_API_URL}drs/faq/most-view/get`, Config({
            Authorization: 'Bearer ' + Cookie.get('token')
        })).then(response => {
            if (response.data.success) {
                this.setState({
                    most_view_faqs: response.data.data
                });
            }
        }).catch(error => {
            console.error(error);
        });
    }

    getTicketCategories() {
        axios.get(`${process.env.REACT_APP_BASE_API_URL}drs/ticket/categories/get`, Config({
            Authorization: 'Bearer ' + Cookie.get('token')
        })).then(response => {
            if (response.data.success) {
                this.setState({
                    ticket_categories: response.data.data
                });
            }
        }).catch(error => {
            console.error(error);
        });
    }

    getFaqs() {
        axios.get(`${process.env.REACT_APP_BASE_API_URL}drs/faq/get`, Config({
            Authorization: 'Bearer ' + Cookie.get('token')
        })).then(response => {
            if (response.data.success) {
                this.setState({
                    data: response.data.data
                });
            }
        }).catch(error => {
            console.error(error);
        });
    }

    searchFaqs() {
        let search = this.state.search;
        if (typeof search !== 'undefined' && search !== undefined && search !== null && search !== '' && search.replace(/\s/g, '').length > 0) {
            axios.get(`${process.env.REACT_APP_BASE_API_URL}drs/faq/search?search=${search}`, Config({
                Authorization: 'Bearer ' + Cookie.get('token')
            })).then(response => {
                this.setState({
                    search_result: response.data.data
                });
            }).catch(error => {
                console.error(error);
            });
        } else {
            this.setState({
                search_result: []
            });
        }
    }

    setFaqIdSelected(event, value) {
        this.setState({
            faq_id_selected: value.id,
            search: '',
            search_result: []
        }, () => {
            this.getFaqDetail();
        });
    }

    getFaqDetail() {
        let url = ""
        if (Cookie.get('token')) {
            url = `${process.env.REACT_APP_BASE_API_URL}drs/faq/detail`
        } else {
            url = `${process.env.REACT_APP_BASE_API_URL}drs/faq/detail/public`
        }
        axios.post(url, {
            faq_id: this.state.faq_id_selected
        }, Config({
            Authorization: 'Bearer ' + Cookie.get('token')
        })).then(response => {
            this.setState({
                current_faq: response.data.data,
                button_disabled: false
            });
        }).catch(error => {
            console.error(error);
        });
    }

    submitResponse() {
        this.setState({
            button_disabled: true,
        }, () => {
            axios.post(`${process.env.REACT_APP_BASE_API_URL}drs/faq/submit-response`, {
                faq_id: this.state.current_faq.id,
                response: this.state.faq_response,
                message: this.state.faq_response_message,
            }, Config({
                Authorization: 'Bearer ' + Cookie.get('token')
            })).then(response => {
                this.setState({
                    faq_response: '',
                    faq_response_message: ''
                }, () => {
                    if (response.data.success) {
                        SwalToast.fire({
                            icon: 'success',
                            title: 'Submitted.'
                        });
                        this.getFaqDetail();
                    } else {
                        this.setState({
                            button_disabled: false
                        }, () => {
                            SwalToast.fire({
                                icon: 'error',
                                title: 'Failed to Submit.'
                            });
                        });
                    }
                });
            }).catch(error => {
                this.setState({
                    button_disabled: false,
                    faq_response: '',
                    faq_response_message: ''
                }, () => {
                    SwalToast.fire({
                        icon: 'error',
                        title: 'Failed to Submit.'
                    });
                });
            });
        });
    }

    submitTicket() {
        let ticket_errors = { ...this.state.create_ticket_errors };
        this.setState({
            create_ticket_errors: {
                category_id: '',
                title: '',
                description: '',
                attachments: ticket_errors.attachments,
            },
        }, () => {
            let ticket = { ...this.state.create_ticket };
            let ticket_errors = { ...this.state.create_ticket_errors };
            if (
                typeof ticket.category_id === 'undefined' ||
                ticket.category_id === undefined ||
                ticket.category_id === null ||
                ticket.category_id === ''
            ) {
                ticket_errors.category_id = 'Category Field is required.';
                this.setState({
                    create_ticket_errors: ticket_errors
                }, () => $('#create-ticket-category').focus());
            } else if (
                typeof ticket.title === 'undefined' ||
                ticket.title === undefined ||
                ticket.title === null ||
                ticket.title === '' ||
                ticket.title.replace(/\s/g, '').length === 0
            ) {
                ticket_errors.title = 'Title Field is required.';
                this.setState({
                    create_ticket_errors: ticket_errors
                }, () => $('#create-ticket-title').focus());
            } else if (
                typeof ticket.description === 'undefined' ||
                ticket.description === undefined ||
                ticket.description === null ||
                ticket.description === '' ||
                ticket.description.replace(/\s/g, '').length === 0
            ) {
                ticket_errors.description = 'Description Field is required.';
                this.setState({
                    create_ticket_errors: ticket_errors
                }, () => $('#create-ticket-detail').focus());
            } else if (ticket.description.replace(/\s/g, '').length < 30) {
                ticket_errors.description = 'Min 30 characters.';
                this.setState({
                    create_ticket_errors: ticket_errors
                }, () => $('#create-ticket-detail').focus());
            } else {
                let attachments_is_ok = true;
                ticket_errors.attachments.map((value, index, array) => {
                    if (value !== '') {
                        $(`#create-ticket-attachment-${index}`).focus();
                        attachments_is_ok = false;
                    }
                });
                if (attachments_is_ok) {
                    this.setState({
                        button_disabled: true,
                    }, () => {
                        axios.post(`${process.env.REACT_APP_BASE_API_URL}drs/ticket/submit`, {
                            category_id: this.state.create_ticket.category_id.value,
                            title: this.state.create_ticket.title,
                            description: this.state.create_ticket.description,
                            attachments: this.state.create_ticket.attachments,
                            transaction_id: this.state.transaction ? this.state.transaction.id : null,
                        }, Config({
                            Authorization: 'Bearer ' + Cookie.get('token')
                        })).then(response => {
                            $("input[type=file]").val('');
                            this.setState({
                                button_disabled: false,
                                create_ticket: {
                                    category_id: '',
                                    title: '',
                                    description: '',
                                    attachments: [''],
                                },
                                create_ticket_errors: {
                                    category_id: '',
                                    title: '',
                                    description: '',
                                    attachments: [''],
                                },
                            }, () => {
                                SwalToast.fire({
                                    icon: 'success',
                                    title: 'Submitted.'
                                });
                                setTimeout(() => {
                                    this.props.history.push({
                                        pathname: EcommerceRoutePath.RESOLUTION_CENTER
                                    });
                                }, 1000);
                            });
                        }).catch(error => {
                            $("input[type=file]").val('');
                            this.setState({
                                button_disabled: false,
                                create_ticket: {
                                    category_id: '',
                                    title: '',
                                    description: '',
                                    attachments: [''],
                                },
                                create_ticket_errors: {
                                    category_id: '',
                                    title: '',
                                    description: '',
                                    attachments: [''],
                                },
                            }, () => {
                                if (
                                    typeof error.response !== 'undefined' &&
                                    error.response !== undefined &&
                                    error.response !== null &&
                                    error.response !== ''
                                ) {
                                    if (typeof error.response.data.message === 'string') SwalToast.fire({
                                        icon: 'error',
                                        title: error.response.data.message
                                    });
                                    else SwalToast.fire({
                                        icon: 'error',
                                        title: 'Failed to Submit.'
                                    });
                                } else SwalToast.fire({
                                    icon: 'error',
                                    title: 'Failed to Submit.'
                                });
                            });
                        });
                    });
                }
            }
        });
    }

    saveAttachment(event, index) {
        let file = event.target.files[0];
        let temp_errors = { ...this.state.create_ticket_errors };
        temp_errors.attachments[index] = '';
        this.setState({
            button_disabled: true,
            create_ticket_errors: { ...temp_errors },
        }, () => {
            let form = new FormData();
            form.append('file', file);
            axios.post(`${process.env.REACT_APP_BASE_API_URL}drs/ticket/save-file`, form, Config({
                Authorization: `Bearer ${Cookie.get('token')}`,
                'Content-Type': 'multipart/form-data'
            })).then(response => {
                let ticket = { ...this.state.create_ticket };
                ticket.attachments[index] = response.data.data;
                this.setState({
                    button_disabled: false,
                    create_ticket: { ...ticket }
                });
            }).catch(error => {
                this.setState({
                    button_disabled: false,
                }, () => {
                    if (error.response) {
                        let temp_errors = { ...this.state.create_ticket_errors };
                        temp_errors.attachments[index] = error.response.data.message;
                        this.setState({
                            create_ticket_errors: { ...temp_errors },
                        });
                    }
                    else SwalToast.fire({
                        icon: 'error',
                        title: 'Whoops, lost connection!'
                    });
                });
            });
        });
    }

    addAttachmentRow() {
        let temp = { ...this.state.create_ticket };
        let temp_errors = { ...this.state.create_ticket_errors };
        temp.attachments.push('');
        temp_errors.attachments.push('');
        this.setState({
            create_ticket: { ...temp },
            create_ticket_errors: { ...temp_errors },
        });
    }

    deleteAttachmentRow() {
        let temp = { ...this.state.create_ticket };
        let temp_errors = { ...this.state.create_ticket_errors };
        temp.attachments.splice(temp.attachments.length - 1, 1);
        temp_errors.attachments.splice(temp.attachments.length - 1, 1);
        this.setState({
            create_ticket: { ...temp },
            create_ticket_errors: { ...temp_errors },
        });
    }

    searchFaqsInput = event => {
        this.setState({
            search: event.target.value
        })
    }

    closeTransaction = () => {
        this.setState({ transaction: null })
    }

    render() {
        const { t } = this.props;
        return (
            <Template>
                <MyContext.Consumer>{context => (<>
                    <MetaTrigger
                        pageTitle={context.companyName ? `${context.companyName} - FAQ` : ""}
                        pageDesc={`Frequently Asked Questions`}
                    />
                    <div className="py-4">
                        <div className="container-xsdcn">
                            <div className="row no-gutters">
                                <div className="col-12 col-md-8">
                                    <div className="w-100 pt-4">
                                        <h4 className="mt-5 mb-0 color-0D2840 font-weight-bold">{t('drs.what_can_we_help_you')}</h4>
                                        <input
                                            type="text"
                                            className="form-control w-100 shadow-graph mt-3"
                                            placeholder={t('drs.search_help_topic')}
                                            value={this.state.search}
                                            onChange={this.searchFaqsInput}
                                        />
                                        <p className="mt-2 mb-0 color-0D2840 ">{t('drs.faq_example')}</p>
                                        <div className="search-result mt-4">
                                            {this.state.search_result.length > 0 &&
                                                <div className="text-right">
                                                    <a href="javascript:void(0)" onClick={event => this.setState({
                                                        search: '',
                                                        search_result: []
                                                    })} className="m-0 color-0D2840 ">{t('drs.close_result')}</a>
                                                </div>}
                                            {this.state.search_result.map((value, index, array) => (
                                                <div className="border-bottom py-2" key={value.id}>
                                                    <a href="javascript:void(0)" onClick={event => this.setFaqIdSelected(event, value)} className="text-decoration-none color-333333">{value.title}</a>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-md-4">
                                    <div className="shimmer text-right" style={{ minHeight: '5rem' }}>
                                        <img
                                            src={`/images/help-banner.png`}
                                            alt="" style={{ maxWidth: '100%' }}
                                            onLoad={event => $(event.target).parent('.shimmer').removeClass('shimmer')}
                                        />
                                    </div>
                                </div>
                            </div>
                            {this.state.transaction &&
                                <div className="row no-gutters mt-4">
                                    <div className="col-12">
                                        <div className="d-flex justify-content-between">
                                            <h5 className="mb-0 color-0D2840 font-weight-normal">{t('drs.order_with_issue')}</h5>
                                            <div className="color-EB2424 link" onClick={this.closeTransaction}>{t('drs.close_transaction')}</div>
                                        </div>
                                        <TransactionOrderRow t={t} transaction={this.state.transaction} />
                                    </div>
                                </div>
                            }
                            {this.state.show_create_ticket_view ?
                                <>
                                    <h5 className="mt-4 mb-0 color-0D2840 font-weight-normal">{t('drs.contact_support')}</h5>
                                    <p className="m-0 color-0D2840 small">{t('drs.please_tell_us_the_problem')}</p>
                                    <div className="row mt-3">
                                        <div className="col-12 col-md-6">
                                            <div className="bg-white shadow-graph rounded p-3">
                                                <div className="form-group">
                                                    <label htmlFor="create-ticket-category" className="m-0 color-646464 font-weight-bold small">{t('drs.problem_category')}</label>
                                                    <Select
                                                        isClearable
                                                        id="create-ticket-category"
                                                        options={this.state.ticket_categories}
                                                        className="w-100"
                                                        value={this.state.create_ticket.category_id}
                                                        onChange={event => {
                                                            let ticket = { ...this.state.create_ticket };
                                                            ticket.category_id = event;
                                                            this.setState({
                                                                create_ticket: ticket
                                                            });
                                                        }}
                                                        placeholder={t('drs.placeholder_select')}
                                                    />
                                                    {this.state.create_ticket_errors.category_id !== '' &&
                                                        <div className="alert alert-danger small mt-2" role="alert">
                                                            {this.state.create_ticket_errors.category_id}
                                                        </div>}
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="create-ticket-title" className="m-0 color-646464 font-weight-bold small">{t('drs.problem_title')}</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="create-ticket-title"
                                                        placeholder={t('drs.problem_title')}
                                                        value={this.state.create_ticket.title}
                                                        onChange={event => {
                                                            let ticket = { ...this.state.create_ticket };
                                                            ticket.title = event.target.value;
                                                            this.setState({
                                                                create_ticket: ticket
                                                            });
                                                        }}
                                                    />
                                                    {this.state.create_ticket_errors.title !== '' &&
                                                        <div className="alert alert-danger small mt-2" role="alert">
                                                            {this.state.create_ticket_errors.title}
                                                        </div>}
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="create-ticket-detail" className="m-0 color-646464 font-weight-bold small">{t('drs.problem_detail')}</label>
                                                    <textarea
                                                        id="create-ticket-detail"
                                                        rows="5"
                                                        className="form-control"
                                                        placeholder={t('drs.please_tell_us_the_detail')}
                                                        value={this.state.create_ticket.description}
                                                        onChange={event => {
                                                            let ticket = { ...this.state.create_ticket };
                                                            ticket.description = event.target.value;
                                                            this.setState({
                                                                create_ticket: ticket
                                                            });
                                                        }}
                                                    />
                                                    <p className="m-0 color-646464 ">Min. 30 Character</p>
                                                    {this.state.create_ticket_errors.description !== '' &&
                                                        <div className="alert alert-danger small mt-2" role="alert">
                                                            {this.state.create_ticket_errors.description}
                                                        </div>}
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="create-ticket-attachment" className="m-0 color-646464 font-weight-bold small">{t('drs.attachment')} <span className="font-weight-normal">({t('drs.optional')})</span></label>
                                                    <p className="mt-2 mb-0 color-646464 ">{t('drs.attachment_info')} .jpeg .jpg .png .mp4 .mkv .mov {/*( max 15mb )*/}</p>
                                                    {this.state.create_ticket.attachments.map((value, index, array) => (
                                                        <div key={index}>
                                                            <input
                                                                type="file"
                                                                className="mt-2"
                                                                id={`create-ticket-attachment-${index}`}
                                                                onChange={event => this.saveAttachment(event, index)}
                                                            />
                                                            {this.state.create_ticket_errors.attachments[index] !== '' &&
                                                                <div className="alert alert-danger small mt-2" role="alert">
                                                                    {this.state.create_ticket_errors.attachments[index]}
                                                                </div>}
                                                        </div>
                                                    ))}
                                                    <div className="mt-3">
                                                        <a
                                                            href="javascript:void(0)"
                                                            className="text-decoration-none color-0F74BD font-weight-bold small"
                                                            onClick={this.addAttachmentRow}
                                                        >{t('drs.add_more')}</a>
                                                        {this.state.create_ticket.attachments.length > 1 &&
                                                            <a
                                                                href="javascript:void(0)"
                                                                className="text-decoration-none color-EB2424 font-weight-bold small ml-3"
                                                                onClick={this.deleteAttachmentRow}
                                                            >{t('drs.delete')}</a>}
                                                    </div>
                                                </div>
                                                <div className="">
                                                    <button className="btn border-6A6A6A color-6A6A6A font-weight-semi-bold px-3 py-2" onClick={event => this.setState({
                                                        show_create_ticket_view: false
                                                    })}>{t('drs.back_to_faq')}</button>
                                                    <button
                                                        className="btn bgc-8ABB2A text-white font-weight-semi-bold px-3 py-2 ml-2"
                                                        disabled={this.state.button_disabled}
                                                        onClick={this.submitTicket}
                                                    >{t('drs.submit')}</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </> :
                                <>
                                    <h5 className="mt-4 mb-4 color-0D2840 font-weight-normal">{t('drs.frequently_asked_question')}</h5>
                                    <div className="row">
                                        {this.state.most_view_faqs.length > 0 ?
                                            <>
                                                {this.state.most_view_faqs.map((value, index, array) => (
                                                    <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 mt-3 mt-sm-3 mt-md-0 mt-lg-0 mt-xl-0" key={value.id}>
                                                        <a href="javascript:void(0)" onClick={event => this.setFaqIdSelected(event, value)} className="text-decoration-none">
                                                            <div className="bg-white shadow-graph rounded p-3">
                                                                <p className="mb-3 color-374650 font-weight-bold">{value.title}</p>
                                                                <TextTruncate lineClamp={3} className="m-0 color-374650 small">
                                                                    <TinyMcePreview>{value.description}</TinyMcePreview>
                                                                </TextTruncate>
                                                            </div>
                                                        </a>
                                                    </div>
                                                ))}
                                            </> :
                                            <>
                                                {Array.from(Array(4).keys()).map((value, index, array) => (
                                                    <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 mt-3 mt-sm-3 mt-md-0 mt-lg-0 mt-xl-0" key={value}>
                                                        <div className="bg-white shadow-graph rounded shimmer" style={{ height: '7.5rem' }}></div>
                                                    </div>
                                                ))}
                                            </>}
                                    </div>
                                    <h5 className="mt-5 mb-0 color-0D2840 font-weight-normal">{t('drs.all_help_topics')}</h5>
                                    <div className="row">
                                        <div className="col-3">
                                            <TreeView
                                                data={this.state.data}
                                                childAttr={"child"}
                                                nameAttr={"title"}
                                                className="color-333333"
                                                onClick={this.setFaqIdSelected}
                                                onClickNested={this.setFaqIdSelected}
                                            />
                                        </div>
                                        <div className="col-9">
                                            {this.state.current_faq.id !== 0 &&
                                                <>
                                                    <div className="bg-white p-3">
                                                        <h6 className="m-0 color-374650 font-weight-bold">{this.state.current_faq.title}</h6>
                                                        <TinyMceContent className="mt-3">{this.state.current_faq.description}</TinyMceContent>
                                                    </div>
                                                    {(Cookie.get('token')) &&
                                                        <>
                                                            {!this.state.current_faq.have_response_submitted &&
                                                                <div className="bgc-EFEFEF p-3 mt-3">
                                                                    <p className="m-0 color-6A6A6A small">{t('drs.does_this_article_helps')} <button onClick={event => this.setState({
                                                                        faq_response: this.faq_responses.first
                                                                    })} disabled={this.state.button_disabled} className="border-0 color-0F74BD font-weight-bold">{t('drs.yes')}</button> {t('drs.or')} <button onClick={event => this.setState({
                                                                        faq_response: this.faq_responses.second
                                                                    })} disabled={this.state.button_disabled} className="border-0 color-0F74BD font-weight-bold">{t('drs.no')}</button></p>
                                                                    {(this.state.faq_response) &&
                                                                        <>
                                                                            <textarea
                                                                                className="form-control mt-2"
                                                                                rows="4"
                                                                                placeholder={`${t('drs.your_response')} (${t('drs.optional')})`}
                                                                                value={this.state.faq_response_message}
                                                                                onChange={event => this.setState({
                                                                                    faq_response_message: event.target.value
                                                                                })}
                                                                            />
                                                                            <button className="btn btn-sm bgc-0F74BD text-white mt-2" onClick={this.submitResponse}>{t('drs.submit')}</button>
                                                                        </>}
                                                                </div>}
                                                        </>}
                                                    {!(Cookie.get('token')) ?
                                                        <div className="bgc-EFEFEF p-3 mt-3">
                                                            <p className="m-0 color-6A6A6A small">{t('drs.still_need_helps')} {t('drs.do_login_first')}</p>
                                                        </div> :
                                                        <div className="bgc-EFEFEF p-3 mt-3">
                                                            <p className="m-0 color-6A6A6A small">{t('drs.still_need_helps')} <button onClick={event => this.setState({
                                                                show_create_ticket_view: true
                                                            })} className="border-0 color-0F74BD font-weight-bold">{t('drs.contact_support')}</button></p>
                                                        </div>
                                                    }
                                                </>}
                                        </div>
                                    </div>
                                </>}
                        </div>
                    </div>
                </>)}</MyContext.Consumer>
            </Template>
        );
    }
}

export default withTranslation()(Faq);