import React, { createRef, PureComponent } from 'react';
import { withTranslation } from "react-i18next";
import Template from "../../components/Template";
import MyContext from "../../components/MyContext";
import axios from "axios";
import Config from "../../components/axios/Config";
import Cookie from "js-cookie";
import ManualSwitchLanguage from "../../components/helpers/ManualSwitchLanguage";
import CurrencyFormat, { CurrencyFormat2 } from "../../components/helpers/CurrencyFormat";
import update from "immutability-helper";
import SwalToast from "../../components/helpers/SwalToast";
import { Modal } from "react-bootstrap";
import IsEmpty from "../../components/helpers/IsEmpty";
import { Link } from "react-router-dom";
import EcommerceRoutePath from "./EcommerceRoutePath";
import AuthRoutePath from "../auth/AuthRoutePath";
import Select from "react-select";
import AddCustomerAddress from "../../components/helpers/customer-address/AddCustomerAddress";
import SetDefaultAddress from "../../components/helpers/customer-address/SetDefaultAddress";
import EditCustomerAddress from "../../components/helpers/customer-address/EditCustomerAddress";
import ErrorDiv from '../../components/helpers/ErrorDiv';
import { cartCheckoutGetDataShown, cartCheckoutGetDataShown2, CartCheckoutOuterDiv } from './HelperCartCheckout';
import PriceRatio from '../../components/helpers/PriceRatio';
import ChooseCustomerAddress from '../../components/helpers/customer-address/ChooseCustomerAddress';
import CustomImage, { PublicStorageFolderPath } from '../../components/helpers/CustomImage';
import VoucherSelection from '../../components/voucher/VoucherSelection';
import { VoucherRowSelected } from '../../components/voucher/VoucherRow';
import { TinyMceContent } from '../../components/helpers/TinyMceEditor';
import MetaTrigger from '../../components/MetaTrigger';
import CheckoutAuction from './CheckoutAuction';

const Style = props => {
    if (props.themes) {
        return (
            <style>{`
                #cart {
                    max-width: ${props.themes.site_width.width};
                    margin: 0 auto;
                }
                .price-right {
                    display: none;
                }
                @media (max-width: 767.98px) {
                    #cart {
                        padding-right: 18px;
                        padding-left: 18px;
                    }
                    .price-center {
                        display: none;
                    }
                    .total-price {
                        display: none;
                    }
                    .price-right {
                        display: flex;
                    }
                }
            `}</style>
        );
    } else return null;
};

class CheckoutOrder extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isShowingDeleteConfirm: false,
            modal_change_address: false,
            isUpdatingCart: false,
            isEmptyCart: false,
            config: null,
            data: [],
            customer_addresses: [],
            address_selected: null,
            errors: {},
            submitting: false,

            shipping_fee: 0,
            price_without_shipping: 0,
            total_discount: 0,
            total_quantity: 0,

            selected_ids: [],
            selected_vouchers: [],
            selected_voucher_ids: {},
        };

        if (IsEmpty(Cookie.get('token'))) {
            this.props.history.push({
                pathname: AuthRoutePath.LOGIN,
                search: `from=${this.props.location.pathname}`
            });
        }

        this.addressSelectedRef = createRef()
        this.sellerRef = []
    }

    componentDidMount() {
        this.getMasterData();
        this.getCustomerAddresses();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.address_selected !== this.state.address_selected) {
            let newdata = this.state.data
            for (let i = 0; i < this.state.data.length; i++) {
                newdata = update(newdata, {
                    [i]: {
                        courier_selected: { $set: null },
                        courier_type_selected: { $set: null },
                        courier_types: { $set: [] },
                        courier_error: { $set: "" },
                    }
                })
            }
            this.setState({
                data: newdata
            })
        }
        if (prevState.data !== this.state.data) {
            console.log("update total price")
            this.calculateTotalPrice()
        }
    }

    getMasterData = () => {
        axios.get(`${process.env.REACT_APP_BASE_API_URL}checkout/getMasterData`, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        })).then(response => {
            if (!IsEmpty(response.data.data.data)) {
                let selected_ids = []
                let sumQty = 0

                response.data.data.data.forEach(value => {
                    let couriers = []
                    let courierTypes = []
                    let sumWeight = 0

                    for (const cart of value.carts) {
                        selected_ids.push(cart.id)
                        sumQty += cart.quantity
                        let weight = 0
                        if (cart.mp_product.weight_unit === "kg") weight = cart.mp_product.weight
                        else if (cart.mp_product.weight_unit === "g") weight = cart.mp_product.weight / 1000
                        sumWeight += weight

                        let flag = false
                        let tmp = []
                        if (cart.mp_product.delivery_option === "custom") {
                            cart.mp_product.mp_product_courier_types.forEach(data => {
                                couriers.forEach(data2 => {
                                    if (data.mp_courier_key === data2.value && !tmp.find(item => item.value === data.mp_courier_key)) {
                                        flag = true
                                        if (data.mp_courier_key === "gosend" && sumWeight > response.data.data.gosendMaxWeightInKg) {
                                            tmp = update(tmp, {
                                                $push: [
                                                    { value: data.mp_courier_key, label: `${data.mp_courier_key === "internal" ? "Internal Courier" : data.mp_courier.name} - Maximum weight: ${response.data.data.gosendMaxWeightInKg}kg`, isDisabled: true }
                                                ]
                                            })
                                        } else {
                                            tmp = update(tmp, {
                                                $push: [
                                                    { value: data.mp_courier_key, label: `${data.mp_courier_key === "internal" ? "Internal Courier" : data.mp_courier.name}` }
                                                ]
                                            })
                                        }
                                    }
                                })
                            });
                            if (!flag) {
                                cart.mp_product.mp_product_courier_types.forEach(data => {
                                    if (!couriers.find(item => item.value === data.mp_courier_key)) {
                                        if (data.mp_courier_key === "gosend" && sumWeight > response.data.data.gosendMaxWeightInKg) {
                                            couriers = update(couriers, {
                                                $push: [
                                                    { value: data.mp_courier_key, label: `${data.mp_courier_key === "internal" ? "Internal Courier" : data.mp_courier.name} - Maximum weight: ${response.data.data.gosendMaxWeightInKg}kg`, isDisabled: true }
                                                ]
                                            })
                                        } else {
                                            couriers = update(couriers, {
                                                $push: [
                                                    { value: data.mp_courier_key, label: `${data.mp_courier_key === "internal" ? "Internal Courier" : data.mp_courier.name}` }
                                                ]
                                            })
                                        }
                                    }
                                });
                            } else couriers = tmp
                        } else {
                            value.couriers.forEach(data => {
                                couriers.forEach(data2 => {
                                    if (data.key === data2.value) {
                                        flag = true
                                        if (data.key === "gosend" && sumWeight > response.data.data.gosendMaxWeightInKg) {
                                            tmp = update(tmp, {
                                                $push: [
                                                    { value: data.key, label: `${data.name} - Maximum weight: ${response.data.data.gosendMaxWeightInKg}kg`, isDisabled: true }
                                                ]
                                            })
                                        } else {
                                            tmp = update(tmp, {
                                                $push: [
                                                    { value: data.key, label: `${data.name}` }
                                                ]
                                            })
                                        }
                                    }
                                })
                            });
                            if (!flag) {
                                value.couriers.forEach(data => {
                                    if (data.key === "gosend" && sumWeight > response.data.data.gosendMaxWeightInKg) {
                                        couriers = update(couriers, {
                                            $push: [
                                                { value: data.key, label: `${data.name} - Maximum weight: ${response.data.data.gosendMaxWeightInKg}kg`, isDisabled: true }
                                            ]
                                        })
                                    } else {
                                        couriers = update(couriers, {
                                            $push: [
                                                { value: data.key, label: data.name }
                                            ]
                                        })
                                    }
                                });
                            } else couriers = tmp
                        }
                    }
                    // value.couriers.forEach(item => {
                    //     if(item.key === "gosend" && sumWeight > response.data.data.gosendMaxWeightInKg) {
                    //         couriers = update(couriers, {
                    //             $push: [
                    //                 { value: item.key, label: `${item.name} - Maximum weight: ${response.data.data.gosendMaxWeightInKg}kg`, isDisabled: true }
                    //             ]
                    //         })
                    //     } else {
                    //         couriers = update(couriers, {
                    //             $push: [
                    //                 { value: item.key, label: item.name }
                    //             ]
                    //         })
                    //     }
                    // });
                    value.couriers = couriers
                    value.courier_types = [];

                    value.courier_selected = null;
                    value.courier_type_selected = null;

                    this.sellerRef.push(createRef())
                });

                let data = cartCheckoutGetDataShown2(cartCheckoutGetDataShown(response.data.data.data), selected_ids, []);

                let gosend_sameday_start_hour = parseInt(response.data.data.gosendSamedayStartHour.split(":")[0])
                let gosend_sameday_start_minute = parseInt(response.data.data.gosendSamedayStartHour.split(":")[1])
                let gosend_sameday_end_hour = parseInt(response.data.data.gosendSamedayEndHour.split(":")[0])
                let gosend_sameday_end_minute = parseInt(response.data.data.gosendSamedayEndHour.split(":")[1])
                let gosendSamedayStartHour = new Date(new Date().setHours(gosend_sameday_start_hour, gosend_sameday_start_minute))
                let gosendSamedayEndHour = new Date(new Date().setHours(gosend_sameday_end_hour, gosend_sameday_end_minute))

                this.setState({
                    isEmptyCart: false,
                    carts: response.data.data.data,
                    data: data,
                    total_quantity: sumQty,
                    selected_ids: selected_ids,
                    termsAndConditions: response.data.data.termsAndConditions,
                    gosendSamedayStartHour: gosendSamedayStartHour,
                    gosendSamedayEndHour: gosendSamedayEndHour,
                    gosendMaxWeightInKg: response.data.data.gosendMaxWeightInKg,
                    gosendSamedayStartHourText: response.data.data.gosendSamedayStartHour,
                    gosendSamedayEndHourText: response.data.data.gosendSamedayEndHour
                });
            } else {
                this.setState({
                    isEmptyCart: true,
                    data: [],
                });
            }

            response.data.data.config = JSON.parse(response.data.data.config) || {};
            this.setState({
                config: response.data.data.config,
            })
        }).catch(error => {
            console.log(error);
        }).finally(() => {
            //
        });
    }

    getCustomerAddresses = () => {
        axios.get(`${process.env.REACT_APP_BASE_API_URL}profile/address/get`, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        })).then(response => {
            let address_selected = null;
            response.data.data.forEach(value => {
                if (value.is_main === true) address_selected = value;
            });
            this.setState({
                customer_addresses: response.data.data,
                address_selected: address_selected,
            });
        }).catch(error => {
            console.log(error);
        }).finally(() => {
            //
        });
    }

    getCourierTypeOptions = (mp_seller_id, mp_courier_key, index) => {
        if (!this.state.address_selected) return;
        let params = {
            mp_seller_id: mp_seller_id,
            mp_courier_key: mp_courier_key,
            mp_customer_address_id: this.state.address_selected.id
        }
        axios.get(`${process.env.REACT_APP_BASE_API_URL}checkout/getCourierTypes`, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        }, params)).then(response => {
            let courierTypes = []
            let types = []
            let error = ""
            if (!response.data.data.error) {
                response.data.data.costs.forEach(item => {
                    if (mp_courier_key === "internal" && item.cost[0].note) {
                        types = update(types, {
                            $push: [{
                                value: item.service,
                                label: `${item.description} - ${item.cost[0].note}`,
                                cost: null,
                                isDisabled: true
                            }]
                        })
                    } else if (mp_courier_key === "gosend" && item.service === "SameDay" && (new Date() < this.state.gosendSamedayStartHour || new Date() > this.state.gosendSamedayEndHour)) {
                        types = update(types, {
                            $push: [{
                                value: item.service,
                                label: `${item.description} (Rp${CurrencyFormat2(item.cost[0].value)}) Operational hours: ${this.state.gosendSamedayStartHourText} - ${this.state.gosendSamedayEndHourText}`,
                                cost: item.cost[0],
                                isDisabled: true
                            }]
                        })
                    } else {
                        types = update(types, {
                            $push: [{
                                value: item.service,
                                label: `${item.description} (Rp${CurrencyFormat2(item.cost[0].value)})`,
                                cost: item.cost[0]
                            }]
                        })
                    }
                })

                // console.log(this.state.carts[index].carts)

                for (const cart of this.state.carts[index].carts) {
                    let flag = false
                    let tmp = []
                    if (cart.mp_product.delivery_option === "custom") {
                        cart.mp_product.mp_product_courier_types.forEach(data => {
                            courierTypes.forEach(data2 => {
                                if (data.mp_courier_type_key === data2.value) {
                                    flag = true
                                    tmp = update(tmp, {
                                        $push: [
                                            types.find(item => item.value === data.mp_courier_type_key)
                                        ]
                                    })
                                }
                            })
                        })
                        if (!flag) {
                            cart.mp_product.mp_product_courier_types.forEach(data => {
                                types.forEach(data2 => {
                                    if (data.mp_courier_type_key === data2.value) {
                                        courierTypes = update(courierTypes, {
                                            $push: [
                                                types.find(item => item.value === data.mp_courier_type_key)
                                            ]
                                        })
                                    }
                                })
                            })
                        }
                        else courierTypes = tmp
                    } else {
                        types.forEach(data => {
                            courierTypes.forEach(data2 => {
                                if (data.value === data2.value) {
                                    flag = true
                                    tmp = update(tmp, {
                                        $push: [
                                            types.find(item => item.value === data.value)
                                        ]
                                    })
                                }
                            })
                        })
                        if (!flag) courierTypes = types
                        else courierTypes = tmp
                    }
                }
            } else {
                error = response.data.data.error
            }
            this.setState({
                data: update(this.state.data, {
                    [index]: {
                        courier_types: {
                            $set: courierTypes
                        },
                        courier_error: {
                            $set: error
                        }
                    }
                })
            })
        }).catch(error => {
            console.log(error);
        }).finally(() => {
            //
        });
    }

    changeModal = (name, value) => {
        this.setState({
            [name]: value
        });
    }

    onCourierChange = (option, index) => {
        let error = ""
        if (!this.state.address_selected.lat && !this.state.address_selected.lng && option.value === "gosend") error = "Please fill pinpoint address first"
        this.setState({
            data: update(this.state.data, {
                [index]: {
                    courier_selected: { $set: option },
                    courier_type_selected: { $set: null },
                    courier_types: { $set: [] },
                    courier_error: { $set: error }
                }
            })
        }, () => {
            let currentData = this.state.data[index]
            console.log(currentData.seller)
            if (!error) this.getCourierTypeOptions(currentData.seller.id, currentData.courier_selected.value, index)
        });
    }

    onCourierTypeChange = (option, index) => {
        let data = update(this.state.data, {
            [index]: {
                courier_type_selected: { $set: option },
            }
        })
        data = cartCheckoutGetDataShown2(data, this.state.selected_ids, this.state.selected_vouchers)

        this.setState({
            data: data
        });
    }

    focusRef = (errors) => {
        if (errors.address_selected) this.addressSelectedRef.current.focus();
        else {
            for (let i = 0; i < this.state.data.length; i++) {
                if (errors[i]) {
                    this.sellerRef[i].current.focus();
                    break;
                }
            }
        }
    }
    validateCheckout = () => {
        let validate = true;
        let errors = {};

        if (!this.state.address_selected) {
            validate = false;
            errors.address_selected = this.props.t('checkout.address_selected_empty')
        }
        for (let i = 0; i < this.state.data.length; i++) {
            let datum = this.state.data[i];

            if (!datum.courier_selected) {
                validate = false;
                errors[i] = this.props.t('checkout.courier_selected_empty')
            }
            else if (!datum.courier_type_selected) {
                validate = false;
                errors[i] = this.props.t('checkout.courier_selected_empty')
            }
        }

        this.focusRef(errors)
        this.setState({ errors })
        return validate;
    }

    checkout = (e) => {
        e.preventDefault();

        if (!this.validateCheckout()) return;

        const getCartIds = (item) => {
            let ids = [];
            for (const cart of item.carts) {
                for (const item2 of cart.items) {
                    ids.push(item2.id)
                }
            }
            for (const cart of item.cartForAuction) {
                ids.push(cart.id)
            }
            return ids
        }

        let voucher_customer_ids = []
        for (const selected_voucher of this.state.selected_vouchers) {
            voucher_customer_ids.push(selected_voucher.id)
        }

        let params = {
            mp_customer_address_id: this.state.address_selected.id,
            voucher_customer_ids: voucher_customer_ids,
            transactions: this.state.data.map((item) => (
                {
                    cart_ids: getCartIds(item),
                    mp_courier_key: item.courier_selected.value,
                    mp_courier_type_key: item.courier_type_selected.value,
                    mp_seller_id: item.seller.id,
                    shipping_fee: item.courier_type_selected.cost.value,
                }
            ))
        }

        this.setState({ submitting: true })
        axios.post(`${process.env.REACT_APP_BASE_API_URL}checkout/save`, params, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        })).then(response => {
            SwalToast.fire({ icon: "success", title: response.data.message })
            this.props.history.push(EcommerceRoutePath.CHECKOUT_PAY.replace(":invoice_number", response.data.data))
        }).catch(error => {
            console.log(error);
            if (error.response) {
                console.log(error.response);
                SwalToast.fire({ icon: "error", title: error.response.data.message })
            }
        }).finally(() => {
            this.setState({ submitting: false })
        });
    }

    needUnit = (courier_type) => {
        if (!courier_type) return "";

        courier_type = courier_type.value;
        if (["tiki", "jne", "sicepat", "sap", "rpx", "rex", "lion", "anteraja", "internal"].includes(courier_type)) {
            return this.props.t('checkout.day_unit')
        }
        else return ""
    }

    calculateTotalPrice = () => {
        let price_without_shipping = 0
        let total_discount = 0
        let shipping_fee = 0;

        for (const datum of this.state.data) {
            if (datum.courier_type_selected) {
                shipping_fee += datum.courier_type_selected.cost.value
            }
            for (const cart of datum.carts) {
                if (cart.total_discount) total_discount += cart.total_discount
                for (const item of cart.items) {
                    price_without_shipping += parseInt(item.mp_product_sku.price * item.quantity);
                    total_discount += (parseInt(item.mp_product_sku.price) - parseInt(item.mp_product_sku.price)) * item.quantity;
                }
            }
            for (const cart of datum.cartForAuction) {
                if (cart.total_discount) {
                    total_discount += cart.total_discount
                }
                price_without_shipping += parseInt(cart.mp_product_sku.price * cart.quantity);
                total_discount += (parseInt(cart.mp_product_sku.price) - parseInt(cart.mp_product_sku.price)) * cart.quantity;
            }
        }

        this.setState({
            price_without_shipping,
            total_discount,
            shipping_fee,
        })
    }

    onVoucherSelection = (vouchers, voucher_ids) => {
        let data = cartCheckoutGetDataShown2(this.state.data, this.state.selected_ids, vouchers)

        this.setState({
            selected_vouchers: vouchers,
            selected_voucher_ids: voucher_ids,
            data: data,
        })
    }

    render() {
        const { t } = this.props;
        return (
            <Template>
                <MyContext.Consumer>{context => (<>
                    <MetaTrigger
                        pageTitle={context.companyName ? `${context.companyName} - Checkout` : ""}
                        pageDesc={`Manage Checkout`}
                    />
                    <Style themes={context.theme_settings} />
                    {!IsEmpty(this.state.config) &&
                        <>
                            {this.state.config.type === 'type_1' &&
                                <div id="cart" className="my-2 my-sm-2 my-md-3 my-lg-4 my-xl-4">
                                    {this.state.data.length > 0 &&
                                        <>
                                            <p className="m-0 font-weight-bold color-292929">{t('checkout.checkout')}</p>
                                            <div className="row mt-3">
                                                <div className="col-12 col-sm-12 col-md-8 col-lg-8 col-xl-8">
                                                    <div ref={this.addressSelectedRef} tabIndex="-1" className="bg-white shadow-graph rounded p-3">
                                                        <div className="row">
                                                            <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3">
                                                                <p className="m-0 color-646464 ">{t('checkout.shipping_address')}:</p>
                                                            </div>
                                                            <div className="col-12 col-sm-12 col-md-9 col-lg-9 col-xl-9">
                                                                {!IsEmpty(this.state.address_selected) &&
                                                                    <>
                                                                        <p className="m-0 color-646464 "><b>{this.state.address_selected.receiver_name}</b> {this.state.address_selected.receiver_phone} <b>({this.state.address_selected.address_name})</b></p>
                                                                        <p className="m-0 color-646464 ">{this.state.address_selected.address}</p>
                                                                        <p className="m-0 color-646464 ">{this.state.address_selected.subdistrict}, {this.state.address_selected.city}, {this.state.address_selected.postal_code}</p>
                                                                    </>}
                                                                <div className="mt-2">
                                                                    <a href="#" onClick={event => this.changeModal('modal_change_address', true)} className="text-decoration-none font-weight-semi-bold accent-color ">{t('checkout.change')}</a>
                                                                    <a href="#" className="text-decoration-none font-weight-semi-bold accent-color ml-3" onClick={() => this.changeModal("modal_add_address", true)}>{t('checkout.add_an_address')}</a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <ErrorDiv style="" error={this.state.errors.address_selected} />

                                                    {this.state.address_selected && <>
                                                        {this.state.data.map((value, index) => (<>
                                                            <div ref={this.sellerRef[index]} tabIndex="-1" className="bg-white shadow-graph rounded p-3 mt-4" key={value.id}>
                                                                <p className="m-0 font-weight-bold color-333333 ">{value.seller.name}</p>
                                                                <p className="m-0 font-weight-bold color-858585 ">{value.seller.city}</p>
                                                                <div className="mt-3">
                                                                    {value.cartForAuction.length > 0 && (
                                                                        <CheckoutAuction
                                                                            data={value}
                                                                        />
                                                                    )}
                                                                    {value.carts.length > 0 && value.carts.map((outerCart, outerCartIndex) => (<CartCheckoutOuterDiv key={outerCart.id} data={outerCart}>
                                                                        {outerCart.items.map((value1, index1) => {
                                                                            return (
                                                                                <div className="d-flex align-items-center mt-3" key={value1.id}>
                                                                                    {value1.mp_product_sku.mp_product_sku_images && value1.mp_product_sku.mp_product_sku_images.length > 0 ?
                                                                                        <CustomImage folder={PublicStorageFolderPath.products} filename={value1.mp_product_sku.mp_product_sku_images[0].filename} alt={value1.mp_product_sku.mp_product_sku_images[0].filename} className="object-fit-cover rounded" style={{ width: 50, height: 50 }} /> :
                                                                                        <CustomImage folder={PublicStorageFolderPath.products} filename={value1.mp_product.mp_product_images[0].filename} alt={value1.mp_product.mp_product_images[0].filename} className="object-fit-cover rounded" style={{ width: 50, height: 50 }} />}
                                                                                    <div className="pl-3">
                                                                                        <div className="m-0 color-333333 ">
                                                                                            <ManualSwitchLanguage data={value1.mp_product.mp_product_informations} langAttr={"language_code"} valueAttr={"name"} />
                                                                                            <span> ({value1.quantity} pcs)</span>
                                                                                        </div>
                                                                                        <div>{value1.mp_product_sku.mp_product_sku_variant_options.map((option) => option.name).join(", ")}</div>
                                                                                        <div className="d-flex align-items-center">
                                                                                            {value.is_sale_price &&
                                                                                                <>
                                                                                                    <span className="bgc-accent-color  rounded px-1">{PriceRatio(value1.mp_product_sku.normal_price, value1.mp_product_sku.price)}</span>
                                                                                                    <span className="color-858585 px-2"><del>Rp {CurrencyFormat(value1.mp_product_sku.normal_price * value1.quantity)}</del></span>
                                                                                                </>}
                                                                                            <span className=" color-292929 font-weight-bold px-1">Rp {CurrencyFormat(value1.mp_product_sku.price * value1.quantity)}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </CartCheckoutOuterDiv>))}
                                                                </div>
                                                                <div className="mt-2 mt-sm-2 mt-md-3 mt-lg-4 mt-xl-4">
                                                                    <div className="pl-3" style={{ marginLeft: 50 }}>
                                                                        <p className="m-0 font-weight-semi-bold color-858585 small">{t('checkout.choose_delivery_method')}</p>
                                                                        <div className="row mt-2">
                                                                            <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                                                                                <div className="">
                                                                                    <Select
                                                                                        className="form-control-sm h-100 p-0"
                                                                                        options={value.couriers}
                                                                                        value={value.courier_selected}
                                                                                        onChange={(option) => this.onCourierChange(option, index)}
                                                                                    />
                                                                                    <div className="small color-EB2424">{value.courier_error}</div>
                                                                                </div>
                                                                                <div className="mt-2">
                                                                                    <Select
                                                                                        className="form-control-sm h-100 p-0"
                                                                                        options={value.courier_types}
                                                                                        value={value.courier_type_selected}
                                                                                        onChange={(option) => this.onCourierTypeChange(option, index)}
                                                                                    />
                                                                                </div>
                                                                                {value.courier_type_selected && <div className="mt-2">
                                                                                    <div>Rp{CurrencyFormat2(value.courier_type_selected.cost.value)}</div>
                                                                                    {value.courier_type_selected.cost.etd && <div>
                                                                                        <span>ETD: </span>
                                                                                        <span>{value.courier_type_selected.cost.etd} </span>
                                                                                        <span>{this.needUnit(value.courier_selected)}</span>
                                                                                    </div>}
                                                                                </div>}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <ErrorDiv style="" error={this.state.errors[index]} />
                                                        </>))}
                                                    </>}
                                                </div>
                                                <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4 mt-3 mt-md-0">
                                                    <div className="bg-white shadow-graph rounded p-3 position-sticky" style={{ top: context.sticky_top_px }}>
                                                        <p className="m-0 font-weight-bold color-333333 ">{t('cart.voucher_discount')}</p>
                                                        {this.state.selected_vouchers.map(selected_voucher => (
                                                            <VoucherRowSelected item={selected_voucher} />
                                                        ))}
                                                        <div className="py-2 text-center"
                                                            onClick={() => this.changeModal('modal_voucher', true)}>
                                                            <label className="accent-color font-weight-bold ">{t('cart.all_voucher')}?</label>
                                                        </div>
                                                        <p className="m-0 font-weight-bold color-333333 ">{t('cart.checkout_summary')}</p>
                                                        <div className="d-flex justify-content-between mt-3">
                                                            <p className="m-0 color-333333 ">{t('cart.price')}</p>
                                                            <p className="m-0 color-333333 ">Rp {CurrencyFormat(this.state.price_without_shipping)}</p>
                                                        </div>
                                                        <div className="d-flex justify-content-between mt-3">
                                                            <p className="m-0 color-333333 ">{t('checkout.shipping_fee')}</p>
                                                            <p className="m-0 color-333333 ">Rp {CurrencyFormat(this.state.shipping_fee)}</p>
                                                        </div>
                                                        <div className="d-flex justify-content-between">
                                                            <p className="m-0 color-333333 ">{t('cart.total_discount')}</p>
                                                            <p className="m-0 color-333333 ">{this.state.total_discount > 0 && "-"} Rp {CurrencyFormat(this.state.total_discount)}</p>
                                                        </div>
                                                        <div className="d-flex justify-content-between">
                                                            <p className="m-0 color-333333 ">{t('cart.total_price')}</p>
                                                            <p className="m-0 font-weight-semi-bold color-333333 ">Rp {CurrencyFormat(this.state.price_without_shipping + this.state.shipping_fee - this.state.total_discount)}</p>
                                                        </div>
                                                        <button onClick={this.checkout} disabled={this.state.submitting} className="btn btn-block bgc-accent-color  mt-4">{t('checkout.proceed_to_buy')}</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </>}

                                    {this.state.isEmptyCart &&
                                        <div className="empty-cart mt-3 mt-sm-3 mt-md-0 mt-lg-0 mt-xl-0">
                                            <div className="row">
                                                <div className="col-8 offset-2">
                                                    <div className="row">
                                                        <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 d-flex align-items-center">
                                                            <div className="shimmer">
                                                                <img
                                                                    src={`/images/empty-cart.png`}
                                                                    className="w-100"
                                                                    onError={event => event.target.src = `/images/placeholder.gif`}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 mt-4 mt-sm-4 mt-md-0 mt-lg-0 mt-xl-0 d-flex align-items-center">
                                                            <div className="">
                                                                <h5 className="mb-2 color-374650">{t('cart.the_cart_is_currently_empty')}</h5>
                                                                <Link to={EcommerceRoutePath.PRODUCTS} className="bgc-2678BF px-5 btn btn-sm font-weight-semi-bold text-decoration-none text-white">
                                                                    {t('cart.start_shopping')}
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>}
                                </div>
                            }
                            {this.state.config.type === 'type_2' &&
                                <div id="cart" className="my-4">
                                    {this.state.data.length > 0 &&
                                        <>
                                            <p className="m-0 font-weight-bold color-292929">{t('checkout.checkout')}</p>
                                            <div className="row mt-3">
                                                <div className="col-12 col-sm-12 col-md-8 col-lg-8 col-xl-8">
                                                    <div ref={this.addressSelectedRef} tabIndex="-1" className="bg-white shadow-graph rounded p-3">
                                                        <div className="border-bottom pb-2">
                                                            <p className="m-0 color-646464  font-weight-semi-bold">{t('checkout.shipping_address')}</p>
                                                        </div>
                                                        {!IsEmpty(this.state.address_selected) &&
                                                            <div className="row pt-2">
                                                                <div className="col-9 col-sm-9 col-md-9 col-lg-9 col-xl-9">
                                                                    <div className="">
                                                                        <p className="m-0 color-646464  font-weight-semi-bold">{this.state.address_selected.receiver_name} ({this.state.address_selected.address_name}) | {this.state.address_selected.receiver_phone}</p>
                                                                        <p className="m-0 color-646464 ">{this.state.address_selected.address}</p>
                                                                        <p className="m-0 color-646464 ">{this.state.address_selected.subdistrict}, {this.state.address_selected.city}, {this.state.address_selected.postal_code}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="col-3 col-sm-3 col-md-3 col-lg-3 col-xl-3">
                                                                    <p className="accent-color font-weight-semi-bold  text-right" onClick={event => this.changeModal('modal_edit_address', true)}>{t('checkout.change')}</p>
                                                                </div>
                                                            </div>}
                                                        {!IsEmpty(this.state.address_selected) ?
                                                            <div className="row justify-content-center mt-3">
                                                                <div className="btn text-decoration-none font-weight-bold border-accent-color accent-color" onClick={() => this.changeModal("modal_change_address", true)}>{t('checkout.choose_address')}</div>
                                                            </div> :
                                                            <div className="row justify-content-center mt-3">
                                                                <p className="accent-color font-weight-semi-bold text-right" onClick={event => this.changeModal('modal_change_address', true)}>{t('checkout.select_shipping_address')}</p>
                                                            </div>}
                                                    </div>
                                                    <ErrorDiv style="" error={this.state.errors.address_selected} />
                                                    {/* {this.state.address_selected && <> */}
                                                    {this.state.data.map((value, index) => (
                                                        <>
                                                            <div ref={this.sellerRef[index]} tabIndex="-1" className="bg-white shadow-graph rounded p-3 mt-4" key={value.id}>
                                                                <div className="border-bottom pb-2">
                                                                    <p className="m-0 color-646464  font-weight-semi-bold">{t('checkout.your_order')}</p>
                                                                </div>
                                                                <div className="mt-3">
                                                                    {value.cartForAuction.length > 0 && (
                                                                        <CheckoutAuction
                                                                            data={value}
                                                                        />
                                                                    )}

                                                                    {value.carts.length > 0 && value.carts.map((outerCart, outerCartIndex) => (
                                                                        <CartCheckoutOuterDiv key={outerCart.id} data={outerCart}>
                                                                            {outerCart.items.map((value1, index1) => {
                                                                                return (
                                                                                    <div className="d-flex align-items-center mt-3" key={value1.id}>
                                                                                        {value1.mp_product_sku.mp_product_sku_images && value1.mp_product_sku.mp_product_sku_images.length > 0 ?
                                                                                            <CustomImage folder={PublicStorageFolderPath.products} filename={value1.mp_product_sku.mp_product_sku_images[0].filename} alt={value1.mp_product_sku.mp_product_sku_images[0].filename} className="object-fit-cover rounded" style={{ width: 50, height: 50 }} /> :
                                                                                            <CustomImage folder={PublicStorageFolderPath.products} filename={value1.mp_product.mp_product_images[0].filename} alt={value1.mp_product.mp_product_images[0].filename} className="object-fit-cover rounded" style={{ width: 50, height: 50 }} />}
                                                                                        <div className="pl-3 w-100">
                                                                                            <div className="m-0 color-333333  row">
                                                                                                <ManualSwitchLanguage data={value1.mp_product.mp_product_informations} langAttr={"language_code"} valueAttr={"name"} />
                                                                                                <div className="ml-auto">
                                                                                                    <span> {value1.quantity} pcs</span>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="">
                                                                                                <span>{value1.mp_product_sku.mp_product_sku_variant_options.map((option) => option.name).join(", ")}</span>
                                                                                            </div>
                                                                                            <div className="d-flex align-items-center">
                                                                                                {value.is_sale_price &&
                                                                                                    <>
                                                                                                        <span className="bgc-accent-color  rounded px-1">{PriceRatio(value1.mp_product_sku.normal_price, value1.mp_product_sku.price)}</span>
                                                                                                        <span className="color-858585 px-2"><del>Rp {CurrencyFormat(value1.mp_product_sku.normal_price)}</del></span>
                                                                                                    </>}
                                                                                                <span className="color-292929 font-weight-bold px-1 price-center">Rp {CurrencyFormat(value1.mp_product_sku.price)}</span>
                                                                                                <div className="ml-auto">
                                                                                                    <span className="color-292929 font-weight-bold price-right">Rp {CurrencyFormat(value1.mp_product_sku.price)}</span>
                                                                                                    <span className="color-292929 font-weight-bold total-price">Rp {CurrencyFormat(value1.mp_product_sku.price * value1.quantity)}</span>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </CartCheckoutOuterDiv>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            {this.state.address_selected && <>
                                                                <div className="bg-white rounded shadow-graph p-3 mt-4">
                                                                    <div className="mt-2 mt-sm-2 mt-md-3 mt-lg-0 mt-xl-0">
                                                                        <div className="border-bottom pb-2">
                                                                            <p className="m-0 color-646464  font-weight-semi-bold">{t('checkout.delivery_method')}</p>
                                                                        </div>
                                                                        <div className="">
                                                                            <div className="row mt-2">
                                                                                <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                                                                                    <p className="">{t('checkout.choose_courier')}</p>
                                                                                    <div className="mt-2">
                                                                                        <Select
                                                                                            className="form-control-sm h-100 p-0"
                                                                                            options={value.couriers}
                                                                                            value={value.courier_selected}
                                                                                            onChange={(option) => this.onCourierChange(option, index)}
                                                                                        />
                                                                                    </div>
                                                                                    <div className="small color-EB2424">{value.courier_error}</div>
                                                                                </div>
                                                                                <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 mt-3 mt-sm-3 mt-md-0 mt-lg-0 mt-xl-0">
                                                                                    <p className="">{t('checkout.choose_delivery_duration')}</p>
                                                                                    <div className="mt-2">
                                                                                        <Select
                                                                                            className="form-control-sm h-100 p-0"
                                                                                            options={value.courier_types}
                                                                                            value={value.courier_type_selected}
                                                                                            onChange={(option) => this.onCourierTypeChange(option, index)}
                                                                                        />
                                                                                    </div>
                                                                                    {value.courier_type_selected && <div className="mt-2 ">
                                                                                        {value.courier_type_selected.cost.etd && <div>
                                                                                            <span>ETD: </span>
                                                                                            <span>{value.courier_type_selected.cost.etd} </span>
                                                                                            <span>{this.needUnit(value.courier_selected)}</span>
                                                                                        </div>}
                                                                                    </div>}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <ErrorDiv style="" error={this.state.errors[index]} />
                                                            </>}
                                                        </>
                                                    ))}
                                                </div>
                                                <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4 mt-4 mt-sm-4 mt-md-0 mt-lg-0 mt-xl-0">
                                                    <div className="bg-white shadow-graph rounded p-3 position-sticky" style={{ top: context.sticky_top_px }}>
                                                        <p className="m-0 font-weight-bold color-333333 ">{t('cart.voucher_discount')}</p>
                                                        {this.state.selected_vouchers.map(selected_voucher => (
                                                            <VoucherRowSelected item={selected_voucher} />
                                                        ))}
                                                        <div className="py-2 text-center"
                                                            onClick={() => this.changeModal('modal_voucher', true)}>
                                                            <label className="accent-color font-weight-bold ">{t('cart.all_voucher')}?</label>
                                                        </div>
                                                        <p className="m-0 font-weight-bold color-333333">{t('cart.checkout_summary')}</p>
                                                        <div className="d-flex justify-content-between mt-3">
                                                            <p className="m-0 color-333333 ">{t('cart.total_price')}</p>
                                                            <p className="m-0 color-333333 ">Rp {CurrencyFormat(this.state.price_without_shipping)}</p>
                                                        </div>
                                                        <div className="d-flex justify-content-between">
                                                            <p className="m-0 color-333333 ">{t('checkout.shipping_fee')}</p>
                                                            <p className="m-0 color-333333 ">Rp {CurrencyFormat(this.state.shipping_fee)}</p>
                                                        </div>
                                                        <div className="d-flex justify-content-between">
                                                            <p className="m-0 color-333333 ">{t('cart.total_discount')}</p>
                                                            <p className="m-0 color-333333 ">{this.state.total_discount > 0 && "-"} Rp {CurrencyFormat(this.state.total_discount)}</p>
                                                        </div>
                                                        <div className="d-flex justify-content-between">
                                                            <p className="m-0 color-333333 font-weight-bold">{t('cart.total_purchase')} <small className="font-weight-bold">({this.state.total_quantity} {t('seller.products')})</small></p>
                                                            <p className="m-0 font-weight-semi-bold color-333333 ">Rp {CurrencyFormat(this.state.price_without_shipping + this.state.shipping_fee - this.state.total_discount)}</p>
                                                        </div>
                                                        <div className="mt-3">
                                                            <button onClick={this.checkout} disabled={this.state.submitting || !this.state.address_selected} className="btn btn-block bgc-accent-color">{t('checkout.proceed_to_buy')}</button>
                                                            <div className="my-2">{t("checkout.by_continuing_the_transaction_i_agree_with")} <span className="link accent-color" onClick={() => this.setState({ modal_tnc: true })}>{t("checkout.terms_and_conditions")}</span></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>}

                                    {this.state.isEmptyCart &&
                                        <div className="empty-cart mt-3 mt-sm-3 mt-md-0 mt-lg-0 mt-xl-0">
                                            <div className="row">
                                                <div className="col-8 offset-2">
                                                    <div className="row">
                                                        <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 d-flex align-items-center">
                                                            <div className="shimmer">
                                                                <img
                                                                    src={`/images/empty-cart.png`}
                                                                    className="w-100"
                                                                    onError={event => event.target.src = `/images/placeholder.gif`}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 mt-4 mt-sm-4 mt-md-0 mt-lg-0 mt-xl-0 d-flex align-items-center">
                                                            <div className="">
                                                                <h5 className="mb-2 color-374650">{t('cart.the_cart_is_currently_empty')}</h5>
                                                                <Link to={EcommerceRoutePath.PRODUCTS} className="bgc-2678BF px-5 btn btn-sm font-weight-semi-bold text-decoration-none text-white">
                                                                    {t('cart.start_shopping')}
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>}
                                </div>
                            }
                        </>}

                    <Modal centered show={this.state.isShowingDeleteConfirm} onHide={event => this.changeModal('isShowingDeleteConfirm', false)}>
                        <Modal.Header className="d-flex justify-content-center">
                            <Modal.Title className="font-weight-bold small color-374650">Are you sure ?</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="row">
                                <div className="col-6">
                                    <button
                                        onClick={event => this.changeModal("isShowingDeleteConfirm", false)}
                                        className="btn btn-block border-707070 shadow-graph color-374650 font-weight-bold"
                                    >{t('general.cancel')}</button>
                                </div>
                                <div className="col-6">
                                    <button
                                        onClick={this.deleteByIds}
                                        className="btn btn-block bgc-EB2424 shadow-graph text-white font-weight-bold"
                                    >{t('general.delete')}</button>
                                </div>
                            </div>
                        </Modal.Body>
                    </Modal>

                    <ChooseCustomerAddress
                        config={this.state.config}
                        customer_addresses={this.state.customer_addresses}
                        address_selected={this.state.address_selected}
                        modal={this.state.modal_change_address}
                        useAddress={(state, value) => {
                            this.setState({
                                [state]: value
                            }, () => this.changeModal("modal_change_address", false))
                        }
                        }
                        addAddress={() => {
                            this.changeModal("modal_change_address", false)
                            this.changeModal("modal_add_address", true)
                        }}
                        editAddress={(state, value) => {
                            this.setState({
                                [state]: value
                            }, () => {
                                console.log("edit address..")
                                this.changeModal("modal_change_address", false)
                                this.changeModal("modal_edit_address", true)
                            })
                        }
                        }
                        setDefaultAddress={(state, value) => {
                            this.setState({
                                [state]: value
                            }, () => this.changeModal("modal_default_address", true))
                        }
                        }
                        closeModal={() => this.changeModal("modal_change_address", false)} />

                    <AddCustomerAddress
                        modal={this.state.modal_add_address}
                        runAfter={this.getCustomerAddresses}
                        closeModal={() => this.changeModal("modal_add_address", false)} />

                    <EditCustomerAddress
                        modal={this.state.modal_edit_address}
                        data={this.state.address_selected}
                        runAfter={this.getCustomerAddresses}
                        closeModal={() => this.changeModal("modal_edit_address", false)} />

                    <SetDefaultAddress
                        modal={this.state.modal_default_address}
                        data={this.state.address_selected}
                        runAfter={this.getCustomerAddresses}
                        closeModal={() => this.changeModal("modal_default_address", false)} />

                    <style>{`
                    a[aria-expanded=false] .fa-caret-up {
                        display: none;
                    }
                    a[aria-expanded=true] .fa-caret-down {
                        display: none;
                    }
                `}</style>
                    <Modal size="lg" centered show={this.state.modal_voucher} onHide={event => this.changeModal('modal_voucher', false)}>
                        <Modal.Header closeButton>
                            <Modal.Title className="font-weight-bold text-center color-374650">Voucher</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <VoucherSelection cartIDs={this.state.selected_ids}
                                selectedVoucherIDs={this.state.selected_voucher_ids}
                                onChange={this.onVoucherSelection}
                            />
                        </Modal.Body>
                    </Modal>

                    <Modal centered show={this.state.modal_tnc} onHide={() => this.setState({ modal_tnc: false })} size="xl">
                        <Modal.Header closeButton>
                            <Modal.Title>Terms and Conditions</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <TinyMceContent>
                                {this.state.termsAndConditions}
                            </TinyMceContent>
                        </Modal.Body>
                    </Modal>
                </>)}</MyContext.Consumer>
            </Template>
        );
    }
}

export default withTranslation()(CheckoutOrder);