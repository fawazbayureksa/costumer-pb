import React, { useState, useEffect } from 'react';
import axios from "axios"
import Cookies from "js-cookie"
import { Tab, Tabs, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import Config from '../../../../../components/axios/Config';
import MyContext from '../../../../../components/MyContext';
import TicketCard from '../../../../general/webinar/components/TicketCard';
import TicketCardPending from '../../../../general/webinar/components/TicketCardPending';
import TicketDetail from './TicketDetail';
import ETicket from './ETicket';
import WebinarReview from '../../../../general/webinar/components/WebinarReview';
import MetaTrigger from '../../../../../components/MetaTrigger';
import SwalToast from '../../../../../components/helpers/SwalToast';

const TicketList = () => {
    const [tabKey, setTabKey] = useState('all');
    const [loading, setLoading] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [ticketsPending, setTicketsPending] = useState([]);
    const [detailModal, setDetailModal] = useState(false);
    const [eTicketModal, setETicketModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState();
    const [reviewModal, setReviewModal] = useState(false);
    const [confirmationModal, setConfirmationModal] = useState(false);
    const [selectedWebinarEventId, setSelectedWebinarEventId] = useState();
    const [selectedTransId, setSelectedTransId] = useState();

    const Style = (props) => {
        return (
            <style jsx="true">{`
                .nav-tabs .nav-link {
                    border: none;
                    margin-left : 2rem;
                    margin-right: 2rem;
                }
                .nav-tabs .nav-link.active {
                    border-bottom: 2px solid ${props.themes ? props.themes.accent_color.value : ''};
                }
                .nav-tabs .nav-item.show .nav-link, .nav-tabs .nav-link.active {
                    color: ${props.themes ? props.themes.accent_color.value : ''};
                    font-weight: 500;
                }
                .nav-tabs a:hover {
                    color: ${props.themes ? props.themes.accent_color.value : ''};
                }
            `}</style>
        )
    }

    useEffect(() => {
        getTicketList();
    }, [tabKey]);

    const getTicketList = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}webinar/my-orders/get`;
        let params = {
            status: tabKey
        }
        axios.get(url, Config({
            Authorization: 'Bearer ' + Cookies.get('token')
        }, params
        )).then(res => {
            if (tabKey === 'pending') {
                setTicketsPending(res.data.data.data);
            } else {
                setTickets(res.data.data.data);
            }
            // set_page_count(res.data.data.last_page)
            console.log(res.data.data.data);
        }).catch(error => {
            console.error('error ticket list: ', error);
        }).finally(() => setLoading(false))
    }

    const handleCancelOrder = () => {
        let params = {
            invoice_number: selectedInvoice
        }

        axios.post(`${process.env.REACT_APP_BASE_API_URL}webinar/my-orders/cancel-order`, params, Config({
            Authorization: `Bearer ${Cookies.get('token')}`
        })).then((response) => {
            SwalToast.fire({
                icon: "success",
                title: response.data.message
            });
            setConfirmationModal(false)
            getTicketList();
        }).catch((error) => {
            console.log(error);
            if (error.response) {
                SwalToast.fire({
                    icon: "error",
                    title: error.response.data.message
                })
            } else {
                SwalToast.fire({
                    icon: "error",
                    title: "Something went wrong",
                })
                // setSubmitting(false);
            }
        }).finally(
            // () =>
            // setSubmitting(false)
        );
    }

    const detailTicketModal = (invoice) => {
        setSelectedInvoice(invoice)
        setDetailModal(true)
        // console.log(selectedInvoice)
    }

    const eTicketModalOpen = (invoice) => {
        setSelectedInvoice(invoice)
        setETicketModal(true)
        // console.log(selectedInvoice)
    }

    const openReviewModal = (eventId, transId) => {
        setSelectedTransId(transId)
        setSelectedWebinarEventId(eventId)
        setReviewModal(true)
    }

    const openCancelModal = (invoice) => {
        // console.log("invoice ->",invoice);
        setSelectedInvoice(invoice)
        setConfirmationModal(true)
    }

    const { t } = useTranslation()
    return (
        <MyContext.Consumer>{context => (
            <div className="">
                <MetaTrigger
                    pageTitle={context.companyName ? `${t('account_setting.webinar')} - ${context.companyName} ` : ""}
                    pageDesc={t('account_setting.webinar')}
                />
                <Style themes={context.theme_settings} />
                {/* <button onClick={() => setDetailModal(true)} className="btn btn-block bgc-accent-color  mt-4">test modal</button> */}
                <Tabs id="controlled-tab" className="mb-3" activeKey={tabKey} onSelect={(k) => setTabKey(k)}>
                    <Tab tabClassName="mx-0 mx-sm-0 mx-md-3 mx-4" eventKey="pending" title='Pending' />
                    <Tab tabClassName="mx-0 mx-sm-0 mx-md-3 mx-4" eventKey="all" title='Semua' />
                    <Tab tabClassName="mx-0 mx-sm-0 mx-md-3 mx-4" eventKey="active" title='Aktif' />
                    <Tab tabClassName="mx-0 mx-sm-0 mx-md-3 mx-4" eventKey="done" title='Selesai' />
                </Tabs>
				<div className='row ml-2 mr-2'>
					{
						(tabKey === "pending") ?
							<>
								{ticketsPending?.map((ticket) => {
									return (<TicketCardPending 
                                        ticket={ticket} 
                                        funcDetailButton={() => detailTicketModal(ticket?.webinar_payment_transactions[0]?.webinar_transaction?.transaction_code)} 
                                        handleCancelOrder={() => openCancelModal(ticket?.webinar_payment_transactions[0]?.webinar_transaction?.transaction_code)}
                                        funcETicketButton={()=> eTicketModalOpen(ticket.transaction_code)}
                                         />)
								})}
							</>
							:
							<>
								{tickets?.map((ticket) => {
									return (<TicketCard ticket={ticket} funcDetailButton={() => detailTicketModal(ticket.transaction_code)} funcReviewButton={() => openReviewModal(ticket.webinar_event_id, ticket.id)} funcETicketButton={() => eTicketModalOpen(ticket.transaction_code)} />)
								})}
							</>
					}
				</div>
                {/* Detail Transaksi Modal */}
                <Modal size='xl' centered show={detailModal} onHide={() => setDetailModal(false)}>
                    <Modal.Header closeButton className="d-flex">
                        <Modal.Title className="font-weight-bold d-flex">E-Ticket Halochef</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <TicketDetail invoice={selectedInvoice} />
                    </Modal.Body>
                </Modal>

                {/* E-Ticket Modal */}
                <Modal size='xl' centered show={eTicketModal} onHide={() => setETicketModal(false)}>
                    <Modal.Header closeButton className="d-flex">
                        <Modal.Title className="font-weight-bold d-flex">E-Ticket Halochef</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <ETicket invoice={selectedInvoice} />
                    </Modal.Body>
                </Modal>

                {/* Review Modal */}
                <Modal size={"xl"} centered show={reviewModal} onHide={() => setReviewModal(false)}>
                    <WebinarReview webinarEventId={selectedWebinarEventId} webinarTransId={selectedTransId} funcCloseModal={() => setReviewModal(false)} />
                </Modal>

                {/* Cancel Confirmation Modal */}
                <Modal centered show={confirmationModal} onHide={() => setConfirmationModal(false)}>
                    <Modal.Header className="d-flex justify-content-center" closeButton>
                        <Modal.Title className="font-weight-bold small color-5F6C73">{t('my_orders.cancel_order')}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="align-items-center">
                        <p className='font-size-80-percent align-middle'>{t('my_orders.sure_you_want_to_cancel_this_order')}</p>
                        <button onClick={handleCancelOrder} className="mt-2 col-md-12" style={{ color: 'white', backgroundColor: '#F8931D', textAlign: 'center', width: '110%', height: 40, borderRadius: 5 }}>
                            <p>{t('my_orders.cancel_order')}</p>
                        </button>
                    </Modal.Body>
                </Modal>
            </div>
        )}</MyContext.Consumer>
    )
}

export default TicketList