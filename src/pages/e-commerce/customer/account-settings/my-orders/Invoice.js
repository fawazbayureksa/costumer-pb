import axios from 'axios';
import Cookie from 'js-cookie';
import React, { PureComponent } from 'react';
import { Helmet } from 'react-helmet';
import { withTranslation } from "react-i18next";
import Config from '../../../../../components/axios/Config';
import CurrencyFormat from '../../../../../components/helpers/CurrencyFormat';
import ManualSwitchLanguage from '../../../../../components/helpers/ManualSwitchLanguage';
import GlobalStyle from '../../../../../styles/GlobalStyle';

class Invoice extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
            theme_settings: null,
            logo: '',
            companyName: '',
            favicon: '',
        }
    }

    componentDidMount() {
        this.getTemplateMasterData()
        this.getDetailTransaction()
    }

    getDetailTransaction = () => {
        axios.get(`${process.env.REACT_APP_BASE_API_URL}my-orders/get-detail?order_code=${this.props.match.params.id}`, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        })).then(response => {
            let data = response.data.data
            data.mp_transaction_details.forEach(detail => {
                if (detail.mp_transaction_product.type === "bundling") {
                    detail.bundlings.forEach(bundling => {
                        bundling.sku = JSON.parse(bundling.sku)
                    })
                }
            });
            this.setState({
                data: data,
            });
        }).catch(error => {
            console.log(error);
        }).finally(() => {
            //
        });
    }

    getThemeSettings = (theme_settings_from_database) => {
        let data = {}
        for (let i = 0; i < theme_settings_from_database.length; i++) {
            let theme_setting = theme_settings_from_database[i]
            data[theme_setting.key] = JSON.parse(theme_setting.value)
        }
        return data
    }
    getTemplateMasterData = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}template/getTemplateMasterData`

        axios.get(url, Config({})).then(response => {
            let theme_settings = this.getThemeSettings(response.data.data.theme_settings)

            this.setState({
                theme_settings: theme_settings,
                favicon: response.data.data.favicon,
                logo: response.data.data.logo,
                companyName: response.data.data.companyName,
            })
        }).catch((error) => {
            console.log(error)
            if (error.response) console.log(error.response)
        })
    }
    render() {
        const { t } = this.props;
        return (
            <>
                {(this.state.favicon && this.state.data) &&
                    <Helmet>
                        <title>{this.state.companyName} - {this.state.data.order_code}</title>
                        <link rel="icon" href={this.state.favicon} />
                        <link rel="apple-touch-icon" href={this.state.favicon} />
                    </Helmet>
                }
                {this.state.theme_settings && <GlobalStyle themes={this.state.theme_settings} />}
                <style>{`
                    .invoice-container {
                        margin: 20px 160px;
                    }
                    @media print { 
                        .print  { display: none;}
                    }
                `}</style>
                {this.state.data && <div className="invoice-container">
                    <div className="text-right print">
                        <button className="btn bgc-accent-color  font-weight-bold" onClick={() => window.print()}>Print</button>
                    </div>
                    <div className="row mt-5">
                        <div className="col-6">
                            <img src={this.state.logo} style={{ height: 60 }} />
                        </div>
                        <div className="col-6 text-right">
                            <h6>Invoice</h6>
                            <div>{t("invoice.number")}: <label className="font-weight-bold">{this.state.data.order_code}</label></div>
                            {/* <div>Tanggal Terbit: </div>
                        <div>Berlaku Sampai: </div> */}
                        </div>
                    </div>
                    <hr />
                    <div className="row">
                        <div className="col-6">
                            <div>{t("invoice.published_to")}:</div>
                            <div>{this.state.data.mp_customer.name}</div>
                            <div>{this.state.data.mp_customer.phone_number}</div>
                            <div>{this.state.data.mp_transaction_address.address}</div>
                            <div>{this.state.data.mp_transaction_address.subdistrict}, {this.state.data.mp_transaction_address.city}, {this.state.data.mp_transaction_address.province}</div>

                            <div className="mt-4">
                                <div>{t("invoice.payment_method")}:</div>
                                <div>{this.state.data.mp_payment_transaction.mp_payment.last_status.payment_type.replace(/_/g, ' ').toLowerCase().replace(/\b[a-z]/g, letter => letter.toUpperCase())}</div>
                            </div>
                        </div>
                        <div className="col-6">
                            <div>{t("invoice.published_from")}:</div>
                            <div>{this.state.data.mp_seller.name}</div>
                            {/* <div>No Hp</div>
                        <div>Alamat</div> */}
                        </div>
                    </div>
                    <table className="w-100 mt-4">
                        <tr className="bgc-accent-color justify-content-between font-weight-bold">
                            <td className="p-2">{t("invoice.product_name")}</td>
                            <td className="p-2">{t("invoice.quantity")}</td>
                            <td className="p-2">{t("invoice.price")}</td>
                            <td className="text-right p-2">{t("invoice.subtotal")}</td>
                        </tr>
                        {this.state.data.mp_transaction_details.map((detail, index) =>
                            <tr className="">
                                <td className="p-2">
                                    <ManualSwitchLanguage data={detail.mp_transaction_product.mp_transaction_product_informations} langAttr={"language_code"} valueAttr={"name"} />
                                    {detail.mp_transaction_product.mp_transaction_product_sku_variants.map((variant) => (
                                        <div key={variant.id}>
                                            <span className="small">{variant.name}</span>
                                            <span>:</span>
                                            <span>{variant.mp_transaction_product_sku_variant_option.name}</span>
                                        </div>)
                                    )}
                                </td>
                                <td className="p-2">{detail.quantity}</td>
                                <td className="p-2">Rp {CurrencyFormat(detail.unit_price.toString())}</td>
                                <td className="text-right p-2">Rp {CurrencyFormat(detail.total_price.toString())}</td>
                            </tr>)}
                        <tr className="">
                            <td className="p-2"></td>
                            <td className="p-2"></td>
                            <td className="p-2">{t("invoice.subtotal")}</td>
                            <td className="text-right font-weight-bold p-2">Rp {CurrencyFormat(this.state.data.price.toString())}</td>
                        </tr>
                        <tr className="">
                            <td className="p-2"></td>
                            <td className="p-2"></td>
                            <td className="p-2">{t("invoice.shipping_fee")} ({this.state.data.courier.mp_courier_type.name} - {this.state.data.courier.mp_courier_type.key})</td>
                            <td className="text-right font-weight-bold p-2">Rp {CurrencyFormat(this.state.data.shipping_fee.toString())}</td>
                        </tr>
                        <tr className="">
                            <td className="p-2"></td>
                            <td className="p-2"></td>
                            <td className="p-2">{t("invoice.discount")}</td>
                            <td className="text-right font-weight-bold p-2">- Rp{CurrencyFormat(this.state.data.discount.toString())}</td>
                        </tr>
                        <tr className="bgc-accent-color">
                            <td className="bg-white" colSpan="2"></td>
                            <td className="p-2">{t("invoice.grand_total")}</td>
                            <td className="text-right font-weight-bold p-2">Rp {CurrencyFormat(this.state.data.grand_total.toString())}</td>
                        </tr>
                    </table>
                </div>}
            </>
        )
    }
}

export default withTranslation()(Invoice)