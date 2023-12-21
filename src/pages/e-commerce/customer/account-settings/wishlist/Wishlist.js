import React, { PureComponent } from 'react';
import axios from "axios";
import Config from "../../../../../components/axios/Config";
import Cookie from "js-cookie";
import IsEmpty from "../../../../../components/helpers/IsEmpty";
import AuthRoutePath from "../../../../auth/AuthRoutePath";
import Paginate from "../../../../../components/helpers/Paginate";
import ManualSwitchLanguage from "../../../../../components/helpers/ManualSwitchLanguage";
import CurrencyFormat from "../../../../../components/helpers/CurrencyFormat";
import { Link } from "react-router-dom";
import { withTranslation } from "react-i18next";
import EcommerceRoutePath from "../../../EcommerceRoutePath";
import TextTruncate from "../../../../../components/helpers/TextTruncate";
import $ from "jquery";
import SwalToast from "../../../../../components/helpers/SwalToast";
import MyContext from "../../../../../components/MyContext";
import PriceRatio from '../../../../../components/helpers/PriceRatio';
import CustomImage, { PublicStorageFolderPath } from '../../../../../components/helpers/CustomImage';
import MetaTrigger from '../../../../../components/MetaTrigger';

class Wishlist extends PureComponent {
    constructor(props) {
        super(props);
        let params = this.getUrlParams();
        this.state = {
            config: null,
            data: null,
            filter_search: params.search,
            filter_length: params.length,
            filter_current_page: params.current_page,
        };

        if (IsEmpty(Cookie.get('token'))) {
            this.props.history.push({
                pathname: AuthRoutePath.LOGIN,
                search: `from=${this.props.location.pathname}`
            });
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props !== prevProps) {
            this.getData();
        }
    }

    componentDidMount() {
        this.getData();
        this.getMasterData();
        window.addEventListener('resize', this.imgSquare);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.imgSquare);
    }

    getData = () => {
        console.log('windo', window.location.search)
        axios.get(`${process.env.REACT_APP_BASE_API_URL}my-wishlist/get${window.location.search}`, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        })).then(response => {
            console.log('trans', response.data.data);
            if (!IsEmpty(response.data.data)) {
                this.setState({
                    data: response.data.data,
                });
            } else {
                this.setState({
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
        axios.get(`${process.env.REACT_APP_BASE_API_URL}my-wishlist/getMasterData`, Config({
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

    getUrlParams = () => {
        let params = new URLSearchParams(window.location.search);
        return {
            search: params.get('search') || '',
            length: params.get('length') || 10,
            current_page: params.get('page') || 1,
        };
    }

    setUrlParams = () => {
        let query = '';
        if (!IsEmpty(this.state.filter_search)) query += `search=${this.state.filter_search}`;
        if (!IsEmpty(this.state.filter_length)) query += `&length=${this.state.filter_length}`;
        if (!IsEmpty(this.state.filter_current_page)) query += `&page=${this.state.filter_current_page}`;
        if (query.charAt(0) === '&') query = query.substr(1);
        this.props.history.push({
            pathname: this.props.history.location.pathname,
            search: query
        });
    }

    imgSquare = () => {
        $('#data-wishlist img').css('height', $('#data-wishlist img').width())
    }

    addWishlist = (event, product_id) => {
        event.preventDefault();
        axios.post(`${process.env.REACT_APP_BASE_API_URL}my-wishlist/add`, {
            product_id: product_id
        }, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        })).then(response => {
            this.getData();
            SwalToast.fire({
                icon: 'success',
                title: 'Successfully!'
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

    render() {
        const { t } = this.props;
        return (
            <>
                <style>{`
                .empty-state {
                    width: 300px;
                }
                @media (max-width: 765.98px) {
                    .empty-state {
                        width: 200px;
                    }
                }
            `}</style>
                <MyContext.Consumer>{context => (
                    <>
                        <MetaTrigger
                            pageTitle={context.companyName ? `${t('account_setting.wishlist')} - ${context.companyName} ` : ""}
                            pageDesc={t('account_setting.wishlist')}
                        />
                        {!IsEmpty(this.state.config) &&
                            <>
                                {this.state.config.type === 'type_1' &&
                                    <div className="bg-white shadow-graph rounded p-3">
                                        <div id="my-orders">
                                            <div className="row mt-3">
                                                <div className="col-6 col-sm-6 col-md-3 col-lg-3 col-xl-3">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder={"Search"}
                                                        value={this.state.filter_search}
                                                        onChange={event => this.setState({
                                                            filter_search: event.target.value
                                                        })}
                                                    />
                                                </div>
                                                <div className="col-6 col-sm-6 col-md-3 col-lg-3 col-xl-3">
                                                    <button className="btn btn-block  bgc-accent-color" onClick={this.setUrlParams}>Search</button>
                                                </div>
                                            </div>

                                            {!IsEmpty(this.state.data) && this.state.data.data.length === 0 &&
                                                <div className="col-12 p-5">
                                                    <div className="d-flex justify-content-center">
                                                        <img
                                                            src={`/images/empty_state.png`}
                                                            className="empty-state"
                                                            onError={event => event.target.src = `/images/placeholder.gif`}
                                                        />
                                                    </div>
                                                    <center className="mt-2">{t("account_setting.no_wishlist")}</center>
                                                </div>}

                                            <div id="data-wishlist" className="mt-4">
                                                <style>{`
                                    #data-wishlist {
                                        display: grid;
                                        grid-template-columns: repeat(4, 1fr);
                                        gap: 1rem;
                                    }
                                    @media (max-width: 575.98px) {
                                        #data-wishlist {
                                            display: grid;
                                            grid-template-columns: repeat(2, 1fr);
                                            gap: 1rem;
                                        }
                                    }
                                    @media (min-width: 576px) and (max-width: 767.98px) {
                                        #data-wishlist {
                                            display: grid;
                                            grid-template-columns: repeat(3, 1fr);
                                            gap: 1rem;
                                        }
                                    }
                                `}</style>
                                                {!IsEmpty(this.state.data) && this.state.data.data.map(value => (
                                                    <Link to={EcommerceRoutePath.PRODUCT_DETAIL.replace(":seller_slug", value.mp_product.mp_seller.slug).replace(":product_slug", value.mp_product.slug)} className="bg-white shadow-graph position-relative text-decoration-none rounded p-2" key={value.mp_product.id}>
                                                        <CustomImage folder={PublicStorageFolderPath.products} filename={value.mp_product.mp_product_images[0].filename} alt={value.mp_product.mp_product_images[0].filename} className="w-100 object-fit-cover product-comp-image" />
                                                        <TextTruncate lineClamp={2} className="m-0  font-weight-semi-bold"><ManualSwitchLanguage data={value.mp_product.mp_product_informations} langAttr={"language_code"} valueAttr={"name"} /></TextTruncate>
                                                        {parseInt(value.mp_product.mp_product_skus.find(value1 => value1.is_main).normal_price) > 0 &&
                                                            <div className="d-flex align-items-center">
                                                                <span className="bgc-accent-color  rounded px-1">{PriceRatio(value.mp_product.mp_product_skus.find(value1 => value1.is_main).normal_price, value.mp_product.mp_product_skus.find(value1 => value1.is_main).price)}</span>
                                                                <span className="color-374650 px-1"><del>Rp. {CurrencyFormat(value.mp_product.mp_product_skus.find(value1 => value1.is_main).normal_price)}</del></span>
                                                            </div>}
                                                        <p className="m-0  color-374650 font-weight-bold">Rp. {CurrencyFormat(value.mp_product.mp_product_skus.find(value1 => value1.is_main).price)}</p>
                                                        <p
                                                            className="m-0  color-374650"
                                                            onMouseOver={event => {
                                                                event.currentTarget.textContent = value.mp_product.mp_seller.name
                                                            }}
                                                            onMouseOut={event => event.currentTarget.textContent = value.mp_product.mp_seller.city}
                                                        >{value.mp_product.mp_seller.city}</p>
                                                        <div className="d-flex align-items-center">
                                                            <i className="far fa-star  accent-color" />
                                                            <span className=" color-374650 mt-1 ml-1">{value.mp_product.rating}</span>
                                                            <span className=" color-374650 mt-1 ml-1">|</span>
                                                            <span className=" color-374650 mt-1 ml-1">{t('product_detail.sold')} {value.mp_product.sold_product}</span>
                                                        </div>
                                                        <div className="position-absolute pointer" style={{ right: '0.5rem', bottom: 0 }} onClick={event => this.addWishlist(event, value.mp_product.id)}>
                                                            <svg width="28px" height="28px" viewBox="0 0 16 16" className="bi bi-heart-fill" fill={context.theme_settings ? context.theme_settings.accent_color.value : ''} xmlns="http://www.w3.org/2000/svg">
                                                                <path fillRule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z" />
                                                            </svg>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>

                                            {(!IsEmpty(this.state.data) && this.state.data.last_page > 0) &&
                                                <div className="d-flex justify-content-end mt-3">
                                                    <Paginate
                                                        pageCount={this.state.data ? this.state.data.last_page : 1}
                                                        onPageChange={selected => this.setState({
                                                            filter_current_page: selected
                                                        }, () => this.setUrlParams())}
                                                        initialPage={this.state.filter_current_page}
                                                    />
                                                </div>}
                                        </div>
                                    </div>}
                                {this.state.config.type === 'type_2' &&
                                    <div className="bg-white shadow-graph rounded p-3">
                                        <div id="my-orders">
                                            <div className="row mt-3">
                                                <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                                    <div className="d-flex search p-0 form-control">
                                                        <input type="text" className="border-0 w-100 p-2"
                                                            placeholder={t('seller.search_product')}
                                                            value={this.state.filter_search}
                                                            onChange={event => this.setState({
                                                                filter_search: event.target.value
                                                            })} />
                                                        <div className="ml-auto py-1 px-3 bgc-accent-color" style={{ borderTopRightRadius: 4, borderBottomRightRadius: 4 }}
                                                            onClick={this.setUrlParams}>
                                                            <i className="fa fa-search text-white" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {!IsEmpty(this.state.data) && this.state.data.data.length === 0 &&
                                                <div className="col-12 p-5">
                                                    <div className="d-flex justify-content-center">
                                                        <img
                                                            src={`/images/empty_state.png`}
                                                            className="empty-state"
                                                            onError={event => event.target.src = `/images/placeholder.gif`}
                                                        />
                                                    </div>
                                                    <center className="mt-2">{t("account_setting.no_wishlist")}</center>
                                                </div>}

                                            <div id="data-wishlist" className="mt-4">
                                                <style>{`
                                    #data-wishlist {
                                        display: grid;
                                        grid-template-columns: repeat(4, 1fr);
                                        gap: 1rem;
                                    }
                                    @media (max-width: 575.98px) {
                                        #data-wishlist {
                                            display: grid;
                                            grid-template-columns: repeat(2, 1fr);
                                            gap: 1rem;
                                        }
                                    }
                                    @media (min-width: 576px) and (max-width: 767.98px) {
                                        #data-wishlist {
                                            display: grid;
                                            grid-template-columns: repeat(3, 1fr);
                                            gap: 1rem;
                                        }
                                    }
                                `}</style>
                                                {!IsEmpty(this.state.data) && this.state.data.data.map(value => (
                                                    <Link to={EcommerceRoutePath.PRODUCT_DETAIL.replace(":seller_slug", value.mp_product.mp_seller.slug).replace(":product_slug", value.mp_product.slug)} className="bg-white shadow-graph position-relative text-decoration-none rounded p-2" key={value.mp_product.id}>
                                                        <CustomImage folder={PublicStorageFolderPath.products} filename={value.mp_product.mp_product_images[0].filename} alt={value.mp_product.mp_product_images[0].filename} className="w-100 object-fit-cover product-comp-image" />
                                                        <TextTruncate lineClamp={2} className="m-0"><ManualSwitchLanguage data={value.mp_product.mp_product_informations} langAttr={"language_code"} valueAttr={"name"} /></TextTruncate>
                                                        <div className="d-flex align-items-center">
                                                            <img src={`/images/seller-icon.png`} className="mr-2" style={{ height: 20 }} />
                                                            <p
                                                                className="m-0 font-size-80-percent color-374650"
                                                                onMouseOver={event => event.currentTarget.textContent = value.mp_product.mp_seller.name}
                                                                onMouseOut={event => event.currentTarget.textContent = value.mp_product.mp_seller.city}
                                                            >{value.mp_product.mp_seller.city}</p>
                                                        </div>
                                                        {value.mp_product.is_sale_price &&
                                                            <div className="d-flex align-items-center mt-2">
                                                                <span className="font-size-80-percent bgc-accent-color  rounded px-1">{PriceRatio(value.mp_product.mp_product_skus.find(value1 => value1.is_main).normal_price, value.mp_product.mp_product_skus.find(value1 => value1.is_main).price)}</span>
                                                                <span className="font-size-80-percent color-374650 px-1"><del>Rp. {CurrencyFormat(value.mp_product.mp_product_skus.find(value1 => value1.is_main).normal_price)}</del></span>
                                                            </div>}
                                                        <p className="m-0 color-374650 font-weight-bold">Rp. {CurrencyFormat(value.mp_product.mp_product_skus.find(value1 => value1.is_main).price)}</p>
                                                        <div className="d-flex align-items-center">
                                                            <i className="far fa-star font-size-80-percent accent-color mt-1" />
                                                            <span className="font-size-80-percent color-374650 mt-1 ml-1">{value.mp_product.rating ? value.mp_product.rating : "-"}</span>
                                                            <span className="font-size-80-percent color-374650 mt-1 ml-1">|</span>
                                                            <span className="font-size-80-percent color-374650 mt-1 ml-1">Terjual {value.mp_product.sold_product}</span>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>

                                            {(!IsEmpty(this.state.data) && this.state.data.last_page > 0) &&
                                                <div className="d-flex justify-content-end mt-3">
                                                    <Paginate
                                                        pageCount={this.state.data ? this.state.data.last_page : 1}
                                                        onPageChange={selected => this.setState({
                                                            filter_current_page: selected
                                                        }, () => this.setUrlParams())}
                                                        initialPage={this.state.filter_current_page}
                                                    />
                                                </div>}
                                        </div>
                                    </div>}
                            </>}
                    </>
                )}</MyContext.Consumer>
            </>
        );
    }
}

export default withTranslation()(Wishlist);