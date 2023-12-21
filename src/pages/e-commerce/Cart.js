import React, { PureComponent } from 'react';
import { withTranslation } from "react-i18next";
import Template from "../../components/Template";
import MyContext from "../../components/MyContext";
import axios from "axios";
import Config from "../../components/axios/Config";
import Cookie from "js-cookie";
import ManualSwitchLanguage, { ManualSwitchLanguageFn } from "../../components/helpers/ManualSwitchLanguage";
import CurrencyFormat from "../../components/helpers/CurrencyFormat";
import update from "immutability-helper";
import SwalToast from "../../components/helpers/SwalToast";
import { Modal, Tab, Tabs } from "react-bootstrap";
import IsEmpty from "../../components/helpers/IsEmpty";
import { Link } from "react-router-dom";
import EcommerceRoutePath from "./EcommerceRoutePath";
import AuthRoutePath from "../auth/AuthRoutePath";
import { cartCheckoutGetDataShown, cartCheckoutGetDataShown2, CartCheckoutOuterDiv } from './HelperCartCheckout';
import PriceRatio from '../../components/helpers/PriceRatio';
import CustomImage, { PublicStorageFolderPath } from '../../components/helpers/CustomImage';
import OtherProduct from './products/product-detail/OtherProduct';
import MetaTrigger from '../../components/MetaTrigger';
import CartAuctionList from './CartAuctionList';

const Style = props => {
    if (props.themes) {
        return (
            <style>{`
                #cart {
                    max-width: ${props.themes.site_width.width};
                    margin: 0 auto;
                }
                @media (max-width: 767.98px) {
                    #cart {
                        padding-right: 18px;
                        padding-left: 18px;
                    }
                }
            `}</style>
        );
    } else return null;
};

class Cart extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isShowingDeleteConfirm: false,
            isUpdatingCart: false,
            isEmptyCart: false,
            config: null,
            data: [],
            selected_ids: [],
            inactive_product: [],
            inactive_product_count: 0,
            temp_qty: 0,

            total_price: 0,
            total_discount: 0,

            other_product_modal_open: false,
            other_product_modal_data: null,
            other_product_modal_key: null,
        };

        if (IsEmpty(Cookie.get('token'))) {
            this.props.history.push({
                pathname: AuthRoutePath.LOGIN,
                search: `from=${this.props.location.pathname}`
            });
        }

        this.minStockForOutOfStockWarning = 10
    }

    componentDidMount() {
        this.checkStock();
        this.getCarts();
        this.getMasterData();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.selected_ids !== this.state.selected_ids) {
            let data = cartCheckoutGetDataShown2(this.state.data, this.state.selected_ids, [])
            this.setState({
                data: data
            })
        }
        if (prevState.data !== this.state.data) {
            this.calculateTotalPrice();
        }
    }

    checkStock = () => {
        axios.get(`${process.env.REACT_APP_BASE_API_URL}cart/checkStock`, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        })).then(response => {
            if (!IsEmpty(response.data.data)) {
                this.setState({
                    inactive_product: response.data.data,
                    inactive_product_count: response.data.data.length
                })
            } else {
                this.setState({
                    inactive_product: []
                });
            }
        }).catch(error => {
            console.log(error);
        }).finally(() => {
            //
        });
    }

    getCarts = () => {
        axios.get(`${process.env.REACT_APP_BASE_API_URL}cart/get`, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        })).then(response => {
            console.log(response.data.data)
            if (!IsEmpty(response.data.data)) {
                let data = cartCheckoutGetDataShown2(cartCheckoutGetDataShown(response.data.data), this.state.selected_ids, []);

                this.setState({
                    data: data
                })
            } else {
                this.setState({
                    isEmptyCart: true,
                    data: [],
                });
            }
        }).catch(error => {
            console.log(error);
        }).finally(() => {
            //
        });
    }

    getMasterData = () => {
        axios.get(`${process.env.REACT_APP_BASE_API_URL}cart/getMasterData`, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        })).then(response => {
            response.data.data.config = JSON.parse(response.data.data.config) || {};
            this.setState({
                config: response.data.data.config,
            });
        }).catch(error => {
            console.log(error);
        }).finally(() => {
            //
        });
    }

    handleQuantityInputOnChange = (e) => {
        let indexSeller = e.currentTarget.getAttribute('indexSeller');
        let indexOuter = e.currentTarget.getAttribute('indexOuter');
        let indexProduct = e.currentTarget.getAttribute('indexProduct');

        let currentQuantity = ""
        let parseIntQuantity = parseInt(e.target.value)
        if (!isNaN(parseIntQuantity)) {
            currentQuantity = parseIntQuantity
        }

        this.setState({
            data: update(this.state.data, {
                [indexSeller]: {
                    carts: {
                        [indexOuter]: {
                            items: {
                                [indexProduct]: {
                                    quantity: { $set: currentQuantity }
                                }
                            }
                        }
                    }
                }
            })
        });
    };

    handleQuantityInputOnBlur = async (e) => {
        let indexSeller = e.currentTarget.getAttribute('indexSeller');
        let indexOuter = e.currentTarget.getAttribute('indexOuter');
        let indexProduct = e.currentTarget.getAttribute('indexProduct');
        let currentCartData = this.state.data[indexSeller].carts[indexOuter].items[indexProduct];
        let newQty = currentCartData.quantity;

        try {
            await this.updateCart(currentCartData.id, newQty);
        } catch (err) {
            if (this.state.temp_qty) {
                this.setState({
                    data: update(this.state.data, {
                        [indexSeller]: {
                            carts: {
                                [indexOuter]: {
                                    items: {
                                        [indexProduct]: {
                                            quantity: { $set: this.state.temp_qty }
                                        }
                                    }
                                }
                            }
                        }
                    }),
                    temp_qty: null,
                })
            }
        }
    };

    handleQuantityInputOnFocus = (e) => {
        let indexSeller = e.currentTarget.getAttribute('indexSeller');
        let indexOuter = e.currentTarget.getAttribute('indexOuter');
        let indexProduct = e.currentTarget.getAttribute('indexProduct');
        let currentCartData = this.state.data[indexSeller].carts[indexOuter].items[indexProduct];

        this.setState({
            temp_qty: currentCartData.quantity
        });
    };

    handleQuantity = async (e) => {
        let indexSeller = e.currentTarget.getAttribute('indexSeller');
        let indexOuter = e.currentTarget.getAttribute('indexOuter');
        let indexProduct = e.currentTarget.getAttribute('indexProduct');
        let sign = e.currentTarget.getAttribute('sign');
        let currentCartData = this.state.data[indexSeller].carts[indexOuter].items[indexProduct];

        let newQty = 0;
        if (sign === "+") {
            newQty = currentCartData.quantity + 1;
        } else if (sign === "-") {
            newQty = currentCartData.quantity - 1;
        }

        let maximumQuantityAllowed = currentCartData.mp_product_sku.stock
        if (currentCartData.mp_product.max_order) {
            maximumQuantityAllowed = Math.min(maximumQuantityAllowed, currentCartData.mp_product.max_order)
        }
        if (newQty > maximumQuantityAllowed) {
            newQty = maximumQuantityAllowed
            return
        }

        try {
            await this.updateCart(currentCartData.id, newQty);
        } catch (err) {

        }
    };

    updateCart = async (cart_id, qty) => {
        if (!qty) throw new Error("no quantity");

        this.setState({
            isUpdatingCart: true
        })

        return await axios.post(`${process.env.REACT_APP_BASE_API_URL}cart/update`, {
            cart_id: cart_id,
            qty: qty
        }, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        })).then(response => {
            this.getCarts()
        }).catch(error => {
            console.log(error);
            let errMsg = 'Failed add to cart!'
            if (error.response && error.response.data) {
                errMsg = error.response.data.message
            }
            SwalToast.fire({
                icon: 'error',
                title: errMsg
            });

            throw error;
        }).finally(() => {
            this.setState({
                isUpdatingCart: false
            });
        });
    }

    deleteByIds = () => {
        this.setState({
            isUpdatingCart: true
        }, () => {
            axios.post(`${process.env.REACT_APP_BASE_API_URL}cart/delete-by-ids`, {
                cart_ids: this.state.selected_ids,
            }, Config({
                Authorization: `Bearer ${Cookie.get('token')}`
            })).then(response => {
                this.setState({
                    isShowingDeleteConfirm: false,
                    isUpdatingCart: false,
                    selected_ids: [],
                }, () => {
                    SwalToast.fire({
                        icon: 'success',
                        title: 'Successfully remove item!'
                    });
                    this.getCarts();
                });
            }).catch(error => {
                console.log(error);
                this.setState({
                    isUpdatingCart: false
                }, () => {
                    SwalToast.fire({
                        icon: 'error',
                        title: 'Failed remove item!'
                    });
                });
            });
        });
    }

    submitCart = () => {
        this.setState({
            isUpdatingCart: true
        }, () => {
            axios.post(`${process.env.REACT_APP_BASE_API_URL}cart/submit`, {
                cart_ids: this.state.selected_ids,
                lang: IsEmpty(Cookie.get('language_code')) ? 'en' : Cookie.get('language_code'),
            }, Config({
                Authorization: `Bearer ${Cookie.get('token')}`
            })).then(response => {
                this.props.history.push({
                    pathname: EcommerceRoutePath.CHECKOUT_ORDER
                });
            }).catch(error => {
                this.setState({
                    isUpdatingCart: false
                }, () => {
                    SwalToast.fire({
                        icon: 'error',
                        title: error.response ? error.response.data.message : 'Whoops, something went wrong!'
                    });
                });
            });
        });
    }

    changeModal = (name, value) => {
        this.setState({
            [name]: value
        });
    }

    calculateTotalPrice = () => {
        let total_price = 0
        let total_discount = 0

        // for (const datum of this.state.data) {
        //     for (const cart of datum.carts) {
        //         if (cart.total_discount) total_discount += cart.total_discount
        //         for (const item of cart.items) {
        //             if (this.state.selected_ids.indexOf(item.id) >= 0) {
        //                 total_price += parseInt(item.mp_product_sku.price * item.quantity);
        //                 total_discount += (parseInt(item.mp_product_sku.price) - parseInt(item.mp_product_sku.price)) * item.quantity;
        //             }
        //         }
        //     }
        // }
        for (const datum of this.state.data) {
            for (const cart of datum.carts) {
                if (cart.total_discount) total_discount += cart.total_discount
                for (const item of cart.items) {
                    if (this.state.selected_ids.indexOf(item.id) >= 0) {
                        total_price += parseInt(item.mp_product_sku.price * item.quantity);
                        total_discount += (parseInt(item.mp_product_sku.price) - parseInt(item.mp_product_sku.price)) * item.quantity;
                    }
                }
            }
            for (const item of datum.cartForAuction) {
                if (this.state.selected_ids.indexOf(item.id) >= 0) {
                    total_price += parseInt(item.mp_auction_bid.bid_price * item.quantity);
                    total_discount += (parseInt(item.mp_auction_bid.bid_price) - parseInt(item.mp_auction_bid.bid_price)) * item.quantity;
                }
            }
        }

        this.setState({
            total_price,
            total_discount,
        })
    }

    checkSellerCheckbox = (data) => {
        let flag = true;
        data.forEach(value => {
            if (!value.items) {
                if (this.checkSellerInactive(data)) flag = false
                else if (!this.state.inactive_product.includes(value.mp_product_sku_id) && !this.state.selected_ids.includes(value.id)) flag = false;
            } else {
                for (const item of value.items) {
                    if (this.checkSellerInactive(data)) flag = false
                    else if (!this.state.inactive_product.includes(item.mp_product_sku_id) && !this.state.selected_ids.includes(item.id)) flag = false;
                }
            }
        });

        return flag;
    }

    checkSellerInactive = (data) => {
        let flag = true;
        data.forEach(value => {
            if (!value.items) {
                if (!this.state.inactive_product.includes(value.mp_product_sku_id)) flag = false;
            } else {
                for (const item of value.items) {
                    if (!this.state.inactive_product.includes(item.mp_product_sku_id)) flag = false;
                }
            }
        });

        return flag;
    }

    checkSellerCheckboxOnChange = e => {
        let index = e.currentTarget.getAttribute('index')
        let value = this.state.data[index]
        let checked = e.currentTarget.checked;

        let temp_deleted = this.state.selected_ids;
        if (!checked) {
            value.carts.forEach(value1 => {
                for (const item of value1.items) {
                    temp_deleted.splice(temp_deleted.findIndex(value2 => value2 === item.id), 1);
                }
            });
            value.cartForAuction.forEach(value1 => {
                temp_deleted.splice(temp_deleted.findIndex(value2 => value2 === value1.id), 1);
            });
        } else {
            value.carts.forEach(value1 => {
                for (const item of value1.items) {
                    if (!this.state.inactive_product.includes(item.mp_product_sku_id) && temp_deleted.indexOf(item.id) < 0) temp_deleted.push(item.id);
                }
            });
            value.cartForAuction.forEach(value1 => {
                if (!this.state.inactive_product.includes(value1.mp_product_sku_id) && temp_deleted.indexOf(value1.id) < 0) temp_deleted.push(value1.id);
            });
        }
        this.setState({
            selected_ids: [...temp_deleted]
        });
    }

    checkAllSellerCheckbox = (data) => {
        let flag = true;
        data.forEach(value => {
            if (value.carts.length === 0) {
                value.cartForAuction.forEach(value1 => {
                    if (!this.state.inactive_product.includes(value1.mp_product_sku_id) && !this.state.selected_ids.includes(value1.id)) flag = false;
                });
            } else {
                value.carts.forEach(value1 => {
                    for (const item of value1.items) {
                        if (this.checkAllSellerCheckboxInactive(data)) flag = false
                        else if (!this.state.inactive_product.includes(item.mp_product_sku_id) && !this.state.selected_ids.includes(item.id)) flag = false;
                    }
                });
            }
        });
        return flag;
    }

    checkAllSellerCheckboxInactive = (data) => {
        let flag = true;
        data.forEach(value => {
            if (value.carts.length === 0) {
                value.cartForAuction.forEach(value1 => {
                    if (!this.state.inactive_product.includes(value1.mp_product_sku_id)) flag = false;
                });
            } else {
                value.carts.forEach(value1 => {
                    for (const item of value1.items) {
                        if (!this.state.inactive_product.includes(item.mp_product_sku_id)) flag = false;
                    }
                });
            }
        });
        return flag;
    }

    checkAllSellerCheckboxOnChange = (e) => {
        let temp_deleted = this.state.selected_ids;
        let checked = e.currentTarget.checked;

        if (!checked) {
            temp_deleted = [];
        } else {
            this.state.data.forEach(value => {
                value.carts.forEach(value1 => {
                    for (const item of value1.items) {
                        if (!this.state.inactive_product.includes(item.mp_product_sku_id)) temp_deleted.push(item.id);
                    }
                });
                value.cartForAuction.forEach(value1 => {
                    if (!this.state.inactive_product.includes(value1.mp_product_sku_id)) temp_deleted.push(value1.id);
                });
            });
        }
        this.setState({
            selected_ids: [...temp_deleted]
        });
    }

    checkSingleCheckbox = (value1) => {
        return this.state.selected_ids.find(value2 => value2 === value1.id)
    }
    checkSingleCheckboxOnChange = (value1) => {
        let temp_deleted = this.state.selected_ids;
        if (temp_deleted.includes(value1.id)) {
            temp_deleted.splice(temp_deleted.findIndex(value2 => value2 === value1.id), 1);
        } else {
            temp_deleted.push(value1.id);
        }
        this.setState({
            selected_ids: [...temp_deleted]
        });
        console.log(this.state.selected_ids)
    }

    addWishlist = (product_id, value, index, indexOuter, index1) => {
        console.log(value)
        const { t } = this.props;
        axios.post(`${process.env.REACT_APP_BASE_API_URL}my-wishlist/add`, {
            product_id: product_id
        }, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        })).then(response => {
            this.setState({
                data: update(this.state.data, {
                    [index]: {
                        carts: {
                            [indexOuter]: {
                                items: {
                                    [index1]: {
                                        mp_product: {
                                            mp_wishlist: { $set: value }
                                        }
                                    }
                                }
                            }
                        }
                    }
                })
            }, () => {
                SwalToast.fire({
                    icon: 'success',
                    title: value ? t('general.success_add_wishlist') : t('general.success_remove_wishlist')
                });
            });
        }).catch(error => {
            SwalToast.fire({
                icon: 'error',
                title: 'Failed!'
            });
        }).finally(() => {
            //
        });
    }

    checkQuantityForPwpDiscount = (seller, outerCart, cartData) => {
        if (outerCart.type !== "pwp") return;

        let quantityNeededToAdd = 0
        let showClickHereForPwpDiscount = false
        if (cartData.mp_product.mp_product_pwp_detail && cartData.mp_product.mp_product_pwp_detail.min_qty > cartData.quantity) {
            quantityNeededToAdd = cartData.mp_product.mp_product_pwp_detail.min_qty - cartData.quantity
        }
        if (cartData.mp_product.mp_product_pwp && outerCart.items.length < cartData.mp_product.mp_product_pwp.min_child_type + 1) {
            showClickHereForPwpDiscount = true
        }

        if (outerCart.active === false && (quantityNeededToAdd > 0 || showClickHereForPwpDiscount)) return (
            <div className="d-flex align-items-center">
                <div className="rounded-pill py-2 px-3 bgc-accent-color d-flex align-items-center">
                    <i className="fas fa-exclamation-circle mr-2 fa-lg fa-lg"></i>
                    {quantityNeededToAdd > 0 ? this.props.t('cart.buy_more_to_get_pwp_discount', { amount: quantityNeededToAdd })
                        : showClickHereForPwpDiscount ? this.props.t('cart.you_can_buy_more_to_get_pwp_discount')
                            : ""}
                </div>

                {quantityNeededToAdd > 0 ? null
                    : showClickHereForPwpDiscount ? <div className="ml-3 link accent-color font-weight-bold" mpProductID={cartData.mp_product_id} onClick={this.getPwpByProductID}>
                        {this.props.t('cart.add_another_products')}
                    </div>
                        : null}
            </div>
        )
        else return null
    }

    closeOtherProductModal = () => {
        this.setState({
            other_product_modal_open: false,
            other_product_modal_data: null,
            other_product_modal_key: null,
        })
        this.getCarts()
    }

    getPwpByProductID = (e) => {
        let mpProductID = e.currentTarget.getAttribute('mpProductID')
        if (!mpProductID) return;

        mpProductID = parseInt(mpProductID)

        axios.get(`${process.env.REACT_APP_BASE_API_URL}ecommerce/product/getPwpByProductID/${mpProductID}`, Config()).then(response => {
            console.log(response.data.data, 'pwp')
            let details = []
            let other_product_modal_key = null
            for (const datum of response.data.data.details) {
                if (mpProductID === datum.mp_product_id) continue;

                details.push(datum)
                if (other_product_modal_key === null) other_product_modal_key = datum.mp_product_id;
            }
            response.data.data.details = details
            this.setState({
                other_product_modal_open: true,
                other_product_modal_data: response.data.data,
                other_product_modal_key: other_product_modal_key,
            })
        }).catch(error => {
            console.log(error);
        }).finally(() => {

        });
    }


    render() {
        const { t } = this.props;
        return (
            <Template>
                <style>{`
                    .alert {
                        background-color: #F54C4C33;
                        padding: 10px;
                        border-radius: 20px;
                    }
                    .checkbox-size {
                        width: 1em;
                        height: 0.8em;           
                    }
                    .wishlist-size {
                        width: 1em;
                        height: 1em;   
                    }
                    .trash-size .svg-inline--fa.fa-w-14 {
                        width: 1em;
                        height: 1em;   
                    }
                    @media (max-width: 765.98px) {
                        .product-name {
                            max-width: 150px;
                        }
                        .checkbox-size {
                            width: 1.2em;
                            height: 1em;   
                        }
                        .wishlist-size {
                            width: 1.2em;
                            height: 1.2em;   
                        }
                        .trash-size .svg-inline--fa.fa-w-14 {
                            width: 1.2em;
                            height: 1.2em;   
                        }
                    }
                `}</style>
                <MyContext.Consumer>{context => (<>
                    <MetaTrigger
                        pageTitle={context.companyName ? `${context.companyName} - Cart` : ""}
                        pageDesc={`Manage Cart`}
                    />
                    <Style themes={context.theme_settings} />
                    {!IsEmpty(this.state.config) &&
                        <>
                            {this.state.config.type === 'type_1' &&
                                <div id="cart" className="my-2 my-sm-2 my-md-3 my-lg-4 my-xl-4">
                                    {this.state.data.length > 0 &&
                                        <>
                                            <p className="m-0 font-weight-bold color-292929">{t('cart.my_cart')}</p>
                                            <div className="row mt-2">
                                                <div className="col-12 col-sm-12 col-md-8 col-lg-8 col-xl-8">
                                                    <div className="px-3 py-2 bg-white shadow-graph rounded d-flex align-items-center justify-content-between">
                                                        <div className="form-check d-flex align-items-center">
                                                            <input
                                                                className="form-check-input mt-0"
                                                                type="checkbox"
                                                                id="select-all"
                                                                checked={this.checkAllSellerCheckbox(this.state.data)}
                                                                onChange={this.checkAllSellerCheckboxOnChange}
                                                                disabled={this.checkAllSellerCheckboxInactive(this.state.data)}
                                                            />
                                                            <label className="form-check-label  m-0" htmlFor="select-all">{t('cart.select_all')}</label>
                                                        </div>
                                                        <a href="#" className="text-decoration-none accent-color  font-weight-bold" onClick={event => {
                                                            event.preventDefault();
                                                            if (this.state.selected_ids.length > 0) this.changeModal('isShowingDeleteConfirm', true);
                                                        }}>Delete</a>
                                                    </div>
                                                    {this.state.data.map((value, index) => (
                                                        <>
                                                            {value.cartForAuction.length > 0 && (
                                                                <div className="mt-3">
                                                                    <CartAuctionList
                                                                        data={value}
                                                                        index={index}
                                                                        inactive_product={this.state.inactive_product}
                                                                        checkSellerCheckbox={this.checkSellerCheckbox}
                                                                        checkSellerCheckboxOnChange={this.checkSellerCheckboxOnChange}
                                                                        checkSellerInactive={this.checkSellerInactive}
                                                                        checkSingleCheckbox={this.checkSingleCheckbox}
                                                                        checkSingleCheckboxOnChange={this.checkSingleCheckboxOnChange}
                                                                        checkQuantityForPwpDiscount={this.checkQuantityForPwpDiscount}
                                                                        minStockForOutOfStockWarning={this.state.minStockForOutOfStockWarning}
                                                                    />
                                                                </div>
                                                            )}
                                                            {value.carts.length > 0 && (
                                                                <div className="bg-white shadow-graph rounded p-3 mt-4" key={value.id}>
                                                                    <div className="d-flex">
                                                                        <div className="d-flex align-items-start mt-1" style={{ width: 20 }}>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={this.checkSellerCheckbox(value.carts)}
                                                                                onChange={this.checkSellerCheckboxOnChange}
                                                                                index={index}
                                                                                disabled={this.checkSellerInactive(value.carts)}
                                                                            />
                                                                        </div>
                                                                        <Link to={EcommerceRoutePath.SELLER.replace(":seller_slug", value.seller.slug)} className="text-decoration-none w-100">
                                                                            <p className="m-0 font-weight-bold color-333333 ">{value.seller.name}</p>
                                                                            <p className="m-0 font-weight-bold color-858585 ">{value.seller.city}</p>
                                                                        </Link>
                                                                    </div>
                                                                    {value.carts.map((outerCart, outerCartIndex) => (<CartCheckoutOuterDiv key={outerCart.id} data={outerCart}>
                                                                        {outerCart.items.map((value1, index1) => {
                                                                            return (
                                                                                <div key={value1.id}>
                                                                                    <div className="d-flex mt-2">
                                                                                        <div className="d-flex align-items-center" style={{ width: 20 }}>
                                                                                            <input
                                                                                                type="checkbox"
                                                                                                checked={this.checkSingleCheckbox(value1)}
                                                                                                onChange={() => this.checkSingleCheckboxOnChange(value1)}
                                                                                                disabled={this.state.inactive_product.includes(value1.mp_product_sku_id)}
                                                                                            />
                                                                                        </div>
                                                                                        <div className="d-flex align-items-center w-100">
                                                                                            <Link to={EcommerceRoutePath.PRODUCT_DETAIL.replace(":seller_slug", value.seller.slug).replace(":product_slug", value1.mp_product.slug)}>
                                                                                                {value1.mp_product_sku.mp_product_sku_images && value1.mp_product_sku.mp_product_sku_images.length > 0 ?
                                                                                                    <CustomImage folder={PublicStorageFolderPath.products} filename={value1.mp_product_sku.mp_product_sku_images[0].filename} alt={value1.mp_product_sku.mp_product_sku_images[0].filename} className="object-fit-cover rounded" style={{ width: 50, height: 50 }} /> :
                                                                                                    <CustomImage folder={PublicStorageFolderPath.products} filename={value1.mp_product.mp_product_images[0].filename} alt={value1.mp_product.mp_product_images[0].filename} className="object-fit-cover rounded" style={{ width: 50, height: 50 }} />}
                                                                                            </Link>
                                                                                            <div className="pl-3">
                                                                                                <Link to={EcommerceRoutePath.PRODUCT_DETAIL.replace(":seller_slug", value.seller.slug).replace(":product_slug", value1.mp_product.slug)} className="m-0 color-333333 text-decoration-none">
                                                                                                    <ManualSwitchLanguage data={value1.mp_product.mp_product_informations} langAttr={"language_code"} valueAttr={"name"} />
                                                                                                </Link>
                                                                                                <div className="font-size-90-percent">{value1.mp_product_sku.mp_product_sku_variant_options.map((option) => option.name).join(", ")}</div>
                                                                                                {value1.mp_product_sku.stock < this.minStockForOutOfStockWarning && <div className="small color-E32827">{t('cart.almost_out_of_stock', { stock: value1.mp_product_sku.stock })}</div>}
                                                                                                <div className="d-flex align-items-center">
                                                                                                    {value.is_sale_price &&
                                                                                                        <>
                                                                                                            <span className="bgc-accent-color  rounded px-1">{PriceRatio(value1.mp_product_sku.normal_price, value1.mp_product_sku.price)}</span>
                                                                                                            <span className="color-858585 px-2"><del>Rp {CurrencyFormat(value1.mp_product_sku.normal_price * value1.quantity)}</del></span>
                                                                                                        </>}
                                                                                                    <span className=" color-292929 font-weight-bold px-1">Rp {CurrencyFormat(value1.mp_product_sku.price * value1.quantity)}</span>
                                                                                                </div>
                                                                                                <div className="mt-2">
                                                                                                    {this.checkQuantityForPwpDiscount(value.seller, outerCart, value1)}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="d-flex mt-2">
                                                                                        <div className="d-flex align-items-center" style={{ width: '3%' }}></div>
                                                                                        <div className="" style={{ width: '97%' }}>
                                                                                            <div className="row mt-2">
                                                                                                <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 d-flex align-items-center">
                                                                                                    <p className="m-0 accent-color ">{t('cart.add_note')}</p>
                                                                                                </div>
                                                                                                <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 d-flex align-items-center justify-content-end">
                                                                                                    <p className="m-0 color-858585 ">{t('cart.add_to_wishlist')}</p>
                                                                                                    <p className="m-0 color-858585  mx-2">|</p>
                                                                                                    <a href="#" className="text-decoration-none" onClick={event => {
                                                                                                        event.preventDefault();
                                                                                                        this.setState({
                                                                                                            selected_ids: [value1.id]
                                                                                                        }, () => this.changeModal('isShowingDeleteConfirm', true));
                                                                                                    }}>
                                                                                                        <i className="far fa-trash-alt color-858585" />
                                                                                                    </a>
                                                                                                    <div className="d-flex align-items-center bgc-F6F7F8 ml-3">
                                                                                                        <button
                                                                                                            className="btn color-0063B0 bgc-F6F7F8"
                                                                                                            indexSeller={index}
                                                                                                            indexOuter={outerCartIndex}
                                                                                                            indexProduct={index1}
                                                                                                            sign="-"
                                                                                                            onClick={this.handleQuantity}
                                                                                                            disabled={this.state.isUpdatingCart}
                                                                                                        >
                                                                                                            -
                                                                                                        </button>
                                                                                                        <label className="m-0">
                                                                                                            <input
                                                                                                                type="text"
                                                                                                                className="border-0 bgc-F6F7F8 text-center  mx-2"
                                                                                                                style={{ width: '2.5rem' }}
                                                                                                                indexSeller={index}
                                                                                                                indexOuter={outerCartIndex}
                                                                                                                indexProduct={index1}
                                                                                                                value={value1.quantity}
                                                                                                                onChange={this.handleQuantityInputOnChange}
                                                                                                                onBlur={this.handleQuantityInputOnBlur}
                                                                                                                onFocus={this.handleQuantityInputOnFocus}
                                                                                                                disabled={this.state.isUpdatingCart}
                                                                                                            />
                                                                                                        </label>
                                                                                                        <button
                                                                                                            className="btn color-0063B0 bgc-F6F7F8"
                                                                                                            indexSeller={index}
                                                                                                            indexOuter={outerCartIndex}
                                                                                                            indexProduct={index1}
                                                                                                            sign="+"
                                                                                                            onClick={this.handleQuantity}
                                                                                                            disabled={this.state.isUpdatingCart}
                                                                                                        >
                                                                                                            +
                                                                                                        </button>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </CartCheckoutOuterDiv>))}
                                                                </div>
                                                            )}
                                                        </>
                                                    ))}
                                                </div>
                                                <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4 mt-3 mt-md-0">
                                                    <div className="bg-white shadow-graph rounded p-3 position-sticky" style={{ top: context.sticky_top_px }}>
                                                        <p className="m-0 font-weight-bold color-333333 ">{t('cart.checkout_summary')}</p>
                                                        <div className="d-flex justify-content-between mt-3">
                                                            <p className="m-0 font-weight-semi-bold color-858585 ">{t('cart.price')}</p>
                                                            <p className="m-0 font-weight-semi-bold color-858585 ">Rp {CurrencyFormat(this.state.total_price)}</p>
                                                        </div>
                                                        <div className="d-flex justify-content-between">
                                                            <p className="m-0 font-weight-semi-bold color-858585 ">{t('cart.total_discount')}</p>
                                                            <p className="m-0 font-weight-semi-bold color-858585 ">{this.state.total_discount > 0 && "-"} Rp {CurrencyFormat(this.state.total_discount)}</p>
                                                        </div>
                                                        <div className="d-flex justify-content-between mt-4">
                                                            <p className="m-0 font-weight-bold color-333333 ">{t('cart.total_price')}</p>
                                                            <p className="m-0 font-weight-semi-bold color-333333 ">Rp {CurrencyFormat((this.state.total_price - this.state.total_discount).toString())}</p>
                                                        </div>
                                                        {/* <div className="bgc-F0F6F9 shadow-graph rounded d-flex justify-content-between px-4 py-2 mt-4">
                                                <p className="m-0 font-weight-bold accent-color ">{t('cart.use_voucher')}</p>
                                                <p className="m-0 font-weight-bold accent-color ">&#5171;</p>
                                            </div> */}
                                                        <button className="btn btn-block bgc-accent-color  mt-4" onClick={this.submitCart} disabled={this.state.selected_ids.length === 0}>{t('cart.buy')}</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </>}

                                    {this.state.isEmptyCart &&
                                        <div className="empty-cart mt-3 mt-sm-3 mt-md-0 mt-lg-0 mt-xl-0">
                                            <div className="row">
                                                <div className="col-8 offset-2">
                                                    <div className="row">
                                                        <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 d-flex align-items-center justify-content-center">
                                                            <div className="shimmer">
                                                                <img
                                                                    src={`/images/empty-cart.png`}
                                                                    className="w-100"
                                                                    onError={event => event.target.src = `/images/placeholder.gif`}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 mt-4 mt-sm-4 mt-md-0 mt-lg-0 mt-xl-0 d-flex align-items-center justify-content-center">
                                                            <div className="">
                                                                <h5 className="mb-2 color-374650">The cart is currently empty</h5>
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
                                            <h5 className="m-0 font-weight-bold color-292929">{t('cart.my_cart')}</h5>
                                            <div className="row mt-2">
                                                <div className="col-12 col-sm-12 col-md-8 col-lg-8 col-xl-8">
                                                    {this.state.inactive_product_count > 0 && <small className="alert">
                                                        <i className="fas fa-exclamation-circle mt-2 mr-2" style={{ color: '#F54C4C' }} />
                                                        {t('cart.there_is')} {this.state.inactive_product_count} {t('cart.product_is_not_available')}
                                                    </small>}

                                                    <div className="form-check d-flex align-items-center my-3">
                                                        <input
                                                            className="form-check-input mt-0 checkbox-size"
                                                            type="checkbox"
                                                            id="select-all"
                                                            checked={this.checkAllSellerCheckbox(this.state.data)}
                                                            onChange={this.checkAllSellerCheckboxOnChange}
                                                            disabled={this.checkAllSellerCheckboxInactive(this.state.data)}
                                                        />
                                                        <label className="form-check-label font-weight-semi-bold m-0 mx-2" htmlFor="select-all">{t('cart.select_all')}</label>
                                                    </div>

                                                    {this.state.data.map((value, index) => (
                                                        <>
                                                            {value.cartForAuction.length > 0 && (
                                                                <CartAuctionList
                                                                    data={value}
                                                                    index={index}
                                                                    inactive_product={this.state.inactive_product}
                                                                    checkSellerCheckbox={this.checkSellerCheckbox}
                                                                    checkSellerCheckboxOnChange={this.checkSellerCheckboxOnChange}
                                                                    checkSellerInactive={this.checkSellerInactive}
                                                                    checkSingleCheckbox={this.checkSingleCheckbox}
                                                                    checkSingleCheckboxOnChange={this.checkSingleCheckboxOnChange}
                                                                    checkQuantityForPwpDiscount={this.checkQuantityForPwpDiscount}
                                                                    minStockForOutOfStockWarning={this.state.minStockForOutOfStockWarning}
                                                                />
                                                            )}
                                                            {value.carts.length > 0 && (
                                                                <div className="bg-white shadow-graph rounded p-3 mb-4" key={value.id}>
                                                                    <div className="d-flex border-bottom pb-2">
                                                                        <div className="d-flex align-items-start mt-2" style={{ width: 20 }}>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={this.checkSellerCheckbox(value.carts)}
                                                                                onChange={this.checkSellerCheckboxOnChange}
                                                                                index={index}
                                                                                className="checkbox-size"
                                                                                disabled={this.checkSellerInactive(value.carts)}
                                                                            />
                                                                        </div>
                                                                        <Link to={EcommerceRoutePath.SELLER.replace(":seller_slug", value.seller.slug)} className="text-decoration-none w-100">
                                                                            <p className="m-0 font-weight-bold color-333333"><i className="fa fa-check-circle accent-color mx-2" />{value.seller.name}</p>
                                                                        </Link>
                                                                    </div>
                                                                    {value.carts.map((outerCart, outerCartIndex) => (<CartCheckoutOuterDiv key={outerCart.id} data={outerCart}>
                                                                        {outerCart.items.map((value1, index1) => {

                                                                            return (
                                                                                <div className="pl-3 py-2" key={value1.id}>
                                                                                    <div className="d-flex mt-2">
                                                                                        <div className="d-flex align-items-center" style={{ width: 20 }}>
                                                                                            <input
                                                                                                type="checkbox"
                                                                                                checked={this.checkSingleCheckbox(value1)}
                                                                                                onChange={() => this.checkSingleCheckboxOnChange(value1)}
                                                                                                className="checkbox-size"
                                                                                                disabled={this.state.inactive_product.includes(value1.mp_product_sku_id)}
                                                                                            />
                                                                                        </div>
                                                                                        <div className="d-flex align-items-center w-100 ml-2">
                                                                                            <Link to={EcommerceRoutePath.PRODUCT_DETAIL.replace(":seller_slug", value.seller.slug).replace(":product_slug", value1.mp_product.slug)}>
                                                                                                {value1.mp_product_sku.mp_product_sku_images && value1.mp_product_sku.mp_product_sku_images.length > 0 ?
                                                                                                    <CustomImage folder={PublicStorageFolderPath.products} filename={value1.mp_product_sku.mp_product_sku_images[0].filename} alt={value1.mp_product_sku.mp_product_sku_images[0].filename} className="object-fit-cover rounded" style={{ width: 50, height: 50 }} /> :
                                                                                                    <CustomImage folder={PublicStorageFolderPath.products} filename={value1.mp_product.mp_product_images[0].filename} alt={value1.mp_product.mp_product_images[0].filename} className="object-fit-cover rounded" style={{ width: 50, height: 50 }} />}
                                                                                            </Link>
                                                                                            <div className="pl-3 product-name">
                                                                                                <Link to={EcommerceRoutePath.PRODUCT_DETAIL.replace(":seller_slug", value.seller.slug).replace(":product_slug", value1.mp_product.slug)} className="m-0 color-333333 text-decoration-none">
                                                                                                    <ManualSwitchLanguage data={value1.mp_product.mp_product_informations} langAttr={"language_code"} valueAttr={"name"} />
                                                                                                </Link>
                                                                                                <div className="font-size-90-percent">{value1.mp_product_sku.mp_product_sku_variant_options.map((option) => option.name).join(", ")}</div>
                                                                                                <div className="d-flex align-items-center ">
                                                                                                    {value.is_sale_price &&
                                                                                                        <>
                                                                                                            <span className="bgc-accent-color  rounded font-size-90-percent px-1">{PriceRatio(value1.mp_product_sku.normal_price, value1.mp_product_sku.price)}</span>
                                                                                                            <span className="font-size-90-percent color-858585 px-2"><del>Rp {CurrencyFormat(value1.mp_product_sku.normal_price)}</del></span>
                                                                                                        </>}
                                                                                                    <span className=" color-292929 font-weight-bold px-1">Rp {CurrencyFormat(value1.mp_product_sku.price)}</span>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="ml-auto">
                                                                                                {!this.state.inactive_product.includes(value1.mp_product_sku_id) && <a href="#" className="text-decoration-none"
                                                                                                    onClick={event => this.addWishlist(value1.mp_product.id, !value1.mp_product.mp_wishlist, index, outerCartIndex, index1)}>
                                                                                                    {value1.mp_product.mp_wishlist ?
                                                                                                        <svg viewBox="0 0 16 16" className="bi bi-heart-fill wishlist-size" fill={context.theme_settings ? context.theme_settings.accent_color.value : ''} xmlns="http://www.w3.org/2000/svg">
                                                                                                            <path fillRule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z" />
                                                                                                        </svg> :
                                                                                                        <svg viewBox="0 0 16 16" className="bi bi-heart wishlist-size" fill={context.theme_settings ? context.theme_settings.accent_color.value : ''} xmlns="http://www.w3.org/2000/svg">
                                                                                                            <path fillRule="evenodd" d="M8 2.748l-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z" />
                                                                                                        </svg>}
                                                                                                </a>}
                                                                                                <a href="#" className="text-decoration-none trash-size" onClick={event => {
                                                                                                    event.preventDefault();
                                                                                                    this.setState({
                                                                                                        selected_ids: [value1.id]
                                                                                                    }, () => this.changeModal('isShowingDeleteConfirm', true));
                                                                                                }}><i className="fas fa-trash-alt accent-color ml-3" /></a>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    {!this.state.inactive_product.includes(value1.mp_product_sku_id) && <div className="d-flex mt-2">
                                                                                        <div className="d-flex align-items-center" style={{ width: '3%' }}></div>
                                                                                        <div className="" style={{ width: '97%' }}>
                                                                                            <div className="row mt-2 align-items-center">
                                                                                                <div className="d-flex align-items-center">
                                                                                                    <button
                                                                                                        className="btn"
                                                                                                        indexSeller={index}
                                                                                                        indexOuter={outerCartIndex}
                                                                                                        indexProduct={index1}
                                                                                                        sign="-"
                                                                                                        onClick={this.handleQuantity}
                                                                                                        disabled={this.state.isUpdatingCart}
                                                                                                    >
                                                                                                        <i className="fas fa-minus-circle accent-color" />
                                                                                                    </button>
                                                                                                    <label className="m-0 border-bottom mx-2">
                                                                                                        <input
                                                                                                            type="text"
                                                                                                            className="border-0 text-center mx-2"
                                                                                                            style={{ width: '2.5rem' }}
                                                                                                            indexSeller={index}
                                                                                                            indexOuter={outerCartIndex}
                                                                                                            indexProduct={index1}
                                                                                                            value={value1.quantity}
                                                                                                            onChange={this.handleQuantityInputOnChange}
                                                                                                            onBlur={this.handleQuantityInputOnBlur}
                                                                                                            onFocus={this.handleQuantityInputOnFocus}
                                                                                                            disabled={this.state.isUpdatingCart}
                                                                                                        />
                                                                                                    </label>
                                                                                                    <button
                                                                                                        className="btn"
                                                                                                        indexSeller={index}
                                                                                                        indexOuter={outerCartIndex}
                                                                                                        indexProduct={index1}
                                                                                                        sign="+"
                                                                                                        onClick={this.handleQuantity}
                                                                                                        disabled={this.state.isUpdatingCart}
                                                                                                    >
                                                                                                        <i className="fas fa-plus-circle accent-color" />
                                                                                                    </button>
                                                                                                </div>
                                                                                                {value1.mp_product_sku.stock < this.minStockForOutOfStockWarning && <div className="small color-E32827">{t('cart.almost_out_of_stock', { stock: value1.mp_product_sku.stock })}</div>}
                                                                                                <div className="ml-auto pr-2">
                                                                                                    <span className=" color-292929 font-weight-bold px-1">Rp {CurrencyFormat(value1.mp_product_sku.price * value1.quantity)}</span>
                                                                                                </div>

                                                                                            </div>

                                                                                            <div className="mt-2">
                                                                                                {this.checkQuantityForPwpDiscount(value.seller, outerCart, value1)}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>}
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </CartCheckoutOuterDiv>))}
                                                                </div>
                                                            )}
                                                        </>
                                                    ))}
                                                </div>
                                                <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4 mt-3 mt-md-0">
                                                    <div className="bg-white shadow-graph rounded p-3 position-sticky" style={{ top: context.sticky_top_px }}>
                                                        {/* <p className="m-0 font-weight-bold color-333333 ">{t('cart.voucher_discount')}</p>
                                            <div className="py-2 text-center"
                                                onClick={() => this.changeModal('modal_voucher', true)}>
                                                <label className="accent-color font-weight-bold ">{t('cart.all_voucher')}?</label>
                                            </div> */}
                                                        <p className="m-0 font-weight-bold color-333333 ">{t('cart.checkout_summary')}</p>
                                                        <div className="d-flex justify-content-between mt-3">
                                                            <p className="m-0 color-333333 ">{t('cart.total_price')}</p>
                                                            <p className="m-0 color-333333 ">Rp {CurrencyFormat(this.state.total_price)}</p>
                                                        </div>
                                                        <div className="d-flex justify-content-between">
                                                            <p className="m-0 color-333333 ">{t('cart.total_discount')}</p>
                                                            <p className="m-0 color-333333 ">{this.state.total_discount > 0 && "-"} Rp {CurrencyFormat(this.state.total_discount)}</p>
                                                        </div>
                                                        <div className="d-flex justify-content-between">
                                                            <p className="m-0 color-333333 ">{t('cart.total_purchase')}</p>
                                                            <p className="m-0 font-weight-semi-bold color-333333 ">Rp {CurrencyFormat((this.state.total_price - this.state.total_discount))}</p>
                                                        </div>
                                                        <button className="btn btn-block bgc-accent-color  mt-4" onClick={this.submitCart} disabled={this.state.selected_ids.length === 0}>{t('cart.buy')}</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </>}

                                    {this.state.isEmptyCart &&
                                        <div className="empty-cart mt-3 mt-sm-3 mt-md-0 mt-lg-0 mt-xl-0">
                                            <div className="row">
                                                <div className="col-8 offset-2">
                                                    <div className="row">
                                                        <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 d-flex align-items-center justify-content-center">
                                                            <div className="shimmer">
                                                                <img
                                                                    src={`/images/empty-cart.png`}
                                                                    className="w-100"
                                                                    onError={event => event.target.src = `/images/placeholder.gif`}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 mt-4 mt-sm-4 mt-md-0 mt-lg-0 mt-xl-0 d-flex align-items-center justify-content-center">
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
                        <Modal.Header closeButton>
                            <Modal.Title className="font-weight-bold text-center color-374650">{t('cart.delete_product')}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div className=" mb-3">{t('cart.are_you_sure_want_to_delete_this_product_from_cart')}</div>
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
                                        className="btn btn-block bgc-accent-color shadow-graph  font-weight-bold"
                                    >{t('general.delete')}</button>
                                </div>
                            </div>
                        </Modal.Body>
                    </Modal>

                    <style>{`
                    a[aria-expanded=false] .fa-caret-up {
                        display: none;
                    }
                    a[aria-expanded=true] .fa-caret-down {
                        display: none;
                    }
                `}</style>
                    <Modal centered show={this.state.modal_voucher} onHide={event => this.changeModal('modal_voucher', false)}>
                        <Modal.Header closeButton>
                            <Modal.Title className="font-weight-bold text-center color-374650">Voucher</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="d-flex border-bottom pb-2">
                                <input type="text" className="form-control" placeholder="masukkan kode promo" />
                                <div className="btn bgc-accent-color  ml-3">Terapkan</div>
                            </div>
                            <div className="py-2">
                                <div className="d-flex">
                                    <div className=" font-weight-semi-bold">Pilih Voucher</div>
                                    <div className="ml-auto">
                                        <a href={`#voucher-available`} className="text-decoration-none color-212529 mr-2" data-toggle="collapse" aria-expanded="false">
                                            <i className="fas fa-caret-down color-97A0AE" />
                                            <i className="fas fa-caret-up color-97A0AE" />
                                        </a>
                                    </div>
                                </div>
                                <div className="mt-2 border rounded p-2" id="voucher-available">
                                    <p className="font-size-90-percent font-weight-semi-bold">Nama Voucher</p>
                                    <p className="font-size-90-percent">TnC</p>
                                    <p className="font-size-90-percent">Valid <label className="accent-color">Detail</label></p>
                                </div>
                            </div>
                        </Modal.Body>
                    </Modal>

                    <Modal size="xl" centered show={this.state.other_product_modal_open} onHide={this.closeOtherProductModal}>
                        <Modal.Header className="d-flex" closeButton>
                            <Modal.Title className="font-weight-bold color-5F6C73 d-flex">{t('cart.add_another_products')}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <style>{`
                            .other-product-tab.active{

                            }
                        `}</style>
                            <Tabs className="mb-3" activeKey={this.state.other_product_modal_key} onSelect={(k) => this.setState({ other_product_modal_key: parseInt(k) })} >
                                {this.state.other_product_modal_data && this.state.other_product_modal_data.details.map(detail => (
                                    <Tab tabClassName={`border-0 ${this.state.other_product_modal_key === detail.mp_product_id ? 'font-weight-bold accent-color border-bottom-accent-color' : ''}`}
                                        eventKey={detail.mp_product_id} key={detail.id}
                                        title={ManualSwitchLanguageFn(detail.mp_product.mp_product_informations, "language_code", "name")}>
                                        <OtherProduct
                                            config={this.state.config}
                                            data={detail}
                                            t={t}
                                        />
                                    </Tab>
                                ))}
                            </Tabs>
                        </Modal.Body>
                    </Modal>
                </>)}</MyContext.Consumer>
            </Template>
        );
    }
}

export default withTranslation()(Cart);