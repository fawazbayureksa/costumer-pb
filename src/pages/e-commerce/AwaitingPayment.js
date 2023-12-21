import { PureComponent } from "react";
import { withTranslation } from "react-i18next";
import Template from "../../components/Template";
import axios from "axios";
import Config from "../../components/axios/Config";
import Cookie from "js-cookie";
import IsEmpty from "../../components/helpers/IsEmpty"
import AuthRoutePath from "../auth/AuthRoutePath";
import MyContext from "../../components/MyContext";
import { CurrencyFormat2 } from "../../components/helpers/CurrencyFormat";
import CustomerRoutePath from "./customer/CustomerRoutePath";
import { Modal } from 'react-bootstrap'
import { Link } from "react-router-dom";
import UploadPaymentProof from "./customer/account-settings/my-orders/UploadPaymentProof";
import CustomImage, { PublicStorageFolderPath } from "../../components/helpers/CustomImage";

const Style = props => {
    if (props.themes) {
        return (
            <style>{`
                #checkout {
                    max-width: ${props.themes.site_width.width};
                    min-height: 70vh;
                    margin: 0 auto;
                }
                
            `}</style>
        );
    } else return null;
};

class AwaitingPayment extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            id: this.props.match.params.id,
            data: null,
        };

        if (IsEmpty(Cookie.get('token'))) {
            this.props.history.push({
                pathname: AuthRoutePath.LOGIN,
                search: `from=${this.props.location.pathname}`
            });
        }
    }

    componentDidMount() {
        this.getManualTransferDestination()
    }
    getManualTransferDestination = () => {
        let params = {
            mp_payment_destination_id: this.state.id
        }
        axios.get(`${process.env.REACT_APP_BASE_API_URL}checkout-pay/getManualTransferDestination`, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        }, params)).then(response => {
            this.setState({
                data: response.data.data
            })
        }).catch(error => {
            console.log(error);
            if (error.response) {
                console.log(error.response)
                if (error.response.status === 403) this.props.history.push(CustomerRoutePath.ACCOUNT_SETTINGS_MY_ORDERS)
            }
        }).finally(() => {
            //
        });
    }

    openUploadModal = () => {
        this.setState({
            upload_modal_open: true
        })
    }

    closeUploadModal = () => {
        this.setState({
            upload_modal_open: false
        })
    }

    render() {
        console.log(this.state)
        const { t } = this.props
        return (
            <Template>
                <MyContext.Consumer>{context => (
                    //     <>
                    //     {this.state.data && <div id="checkout" className="my-4">
                    //         <Style themes={context.theme_settings} />
                    //         <div className="shadow-graph margin-auto p-5 text-center">
                    //             <h3 className="font-weight-bold">{t('awaiting_payment.awaiting_your_payment')}</h3>
                    //             {/* <div className="mt-4">
                    //                 <img src="logo.png" />
                    //             </div> */}
                    //             <div className="mt-4">
                    //                 <div className="">{t('awaiting_payment.bank')}</div>
                    //                 <img src={this.state.data.bank_logo} alt={this.state.data.bank_name} />
                    //             </div>
                    //             <div className="mt-4">
                    //                 <div className="">{t('awaiting_payment.account_number')}</div>
                    //                 <div className="font-weight-bold">{this.state.data.account_number}</div>
                    //             </div>
                    //             <div className="mt-3">
                    //                 <div className="">{t('awaiting_payment.account_holder_name')}</div>
                    //                 <div className="font-weight-bold">{this.state.data.account_name}</div>
                    //             </div>
                    //             <div className="mt-5 small">
                    //                 <div>{t('awaiting_payment.please_complete')}</div>
                    //                 <Link to={CustomerRoutePath.ACCOUNT_SETTINGS_MY_PAYMENT_DETAIL.replace(':invoice_number', this.state.data.payment_invoice_number)} className="color-EC9700">{t('awaiting_payment.go_to_order')}</Link>
                    //             </div>
                    //         </div>
                    //     </div>}
                    // </>
                    <>
                        {this.state.data && <div id="checkout" className="my-4">
                            <Style themes={context.theme_settings} />
                            <h3 className="font-weight-bold">{t('awaiting_payment.awaiting_your_payment')}</h3>
                            {/* <div className="mt-4">
                    <p className="font-weight-semi-bold  justify-content-center d-flex">Selesaikan pembayaran dan upload bukti transfer dalam </p>
                    <p className="font-weight-semi-bold  justify-content-center d-flex accent-color">13:59:59</p>
                    <p className=" justify-content-center d-flex">Batas akhir pembayaran:<b>Jumat...</b></p>
                </div> */}
                            <div className="shadow-graph mt-4 p-3">
                                <p className="">Total Pembayaran</p>
                                <div className="d-flex mt-2">
                                    <p className="font-weight-semi-bold ">Rp {CurrencyFormat2(this.state.data.payment_total)}</p>
                                    {/* <p className="ml-auto accent-color font-weight-semi-bold ">Lihat Detail</p> */}
                                </div>
                                <div className="row mt-2">
                                    <div className="col-6">
                                        <Link to={CustomerRoutePath.ACCOUNT_SETTINGS_MY_PAYMENT_DETAIL.replace(':invoice_number', this.state.data.payment_invoice_number)} className="btn border-707070 font-weight-semi-bold  w-100">Cek Status Pemesanan</Link>
                                    </div>
                                    <div className="col-6">
                                        <div className="btn bgc-accent-color font-weight-semi-bold  w-100" onClick={this.openUploadModal}>{t('my_orders.upload_proof')}</div>
                                    </div>
                                </div>
                                <div className="d-flex mt-2">
                                    <img src={`/images/banks/${this.state.data.bank_logo}`} alt={this.state.data.bank_logo} style={{ width: 160 }} onError={(e) => { e.target.src = "/images/placeholder.png" }} />
                                    <div className="ml-4 d-flex align-items-center">
                                        <div>
                                            <p className="">{this.state.data.bank_name}</p>
                                            <p className="font-weight-semi-bold ">{this.state.data.account_number} - {this.state.data.account_name}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <p className="">Petunjuk Pembayaran:</p>
                                </div>
                            </div>
                            <Modal centered show={this.state.upload_modal_open} onHide={this.closeUploadModal}>
                                <Modal.Header closeButton>
                                    <Modal.Title className="font-weight-bold">{t('my_orders.upload_proof')} {this.state.data.payment_invoice_number}</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <UploadPaymentProof mpPaymentID={this.state.data.payment_id} closeModal={this.closeUploadModal} refreshData={() => this.props.history.push(CustomerRoutePath.ACCOUNT_SETTINGS_MY_PAYMENT_DETAIL.replace(':invoice_number', this.state.data.payment_invoice_number))} t={t} />
                                </Modal.Body>
                            </Modal>
                        </div>}
                    </>
                )}
                </MyContext.Consumer>
            </Template>
        )
    }
}

export default withTranslation()(AwaitingPayment);