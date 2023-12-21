import React, {PureComponent} from 'react';
import {withTranslation} from "react-i18next";
import 'react-multi-carousel/lib/styles.css';
import {Link, useHistory} from "react-router-dom";
import CurrencyFormat from '../../../components/helpers/CurrencyFormat';
import ManualSwitchLanguage from '../../../components/helpers/ManualSwitchLanguage';
import TextTruncate from '../../../components/helpers/TextTruncate';
import EcommerceRoutePath from '../EcommerceRoutePath';
import $ from "jquery";
import Select from "react-select";
import Paginate from "../../../components/helpers/Paginate";
import MyContext from "../../../components/MyContext";
import PriceRatio from '../../../components/helpers/PriceRatio';
import CustomImage, { PublicStorageFolderPath } from '../../../components/helpers/CustomImage';

class SellerProduct extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {};
        this.responsive = {
            desktop: {
                breakpoint: {max: 3000, min: 1024},
                items: 5,
            },
            tablet: {
                breakpoint: {max: 1024, min: 464},
                items: 5,
            },
            mobile: {
                breakpoint: {max: 464, min: 0},
                items: 5,
            }
        };
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.setState({...this.state, nextProps});
    }

    componentDidMount() {
        window.addEventListener('resize', this.imgSquare);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.imgSquare);
    }

    imgSquare = () => {
        $('.product-comp-image').css('height', $('.product-comp-image').width())
    }

    render() {
        const {t} = this.props;
        return (
            <>
            {this.props.parent.state.config.type == "type_1" && <div>
            <MyContext.Consumer>{context => (
                <div className="mt-4">
                    <style>{`
                    @media only screen and (max-width: 767.98px) {
                        .mobile-hidden {
                            display: none;
                        }
                    }
                    `}
                    </style>
                    {
                        this.props.parent.state.seller_banners.length > 0 ?
                            <div id="cms-carousel" className="carousel slide w-100" data-interval={3000} data-ride="enable" style={{height: 300}}>
                                <div className="carousel-inner h-100">
                                    {this.props.parent.state.seller_banners.map((banner, index) => (
                                        <div className={`carousel-item h-100 ${index === 0 ? 'active' : ''}`} key={index}>
                                            <CustomImage folder={PublicStorageFolderPath.seller} filename={banner.filename} alt={banner.filename} className="d-block w-100 h-100 object-fit-cover"/>
                                        </div>
                                    ))}
                                </div>
                                <a className="carousel-control-prev" href="#cms-carousel" role="button" data-slide="prev">
                                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                    <span className="sr-only">Previous</span>
                                </a>
                                <a className="carousel-control-next" href="#cms-carousel" role="button" data-slide="next">
                                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                    <span className="sr-only">Next</span>
                                </a>
                            </div> : null
                    }

                    <div className="row mt-sm-0 mt-md-4 mt-lg-4 mt-xl-4 mobile-hidden">
                        <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3">
                            <input
                                type="text"
                                className="form-control mt-2"
                                placeholder={t('seller.search_product')}
                                onChange={e => this.props.parent.onSearchChange(e.target.value)}
                            />
                        </div>
                        <div className="col-12 col-sm-12 col-md-9 col-lg-9 col-xl-9">
                            <div className="bgc-F0F6F9 rounded px-3">
                                <label className="color-22262A  mr-3">{t('seller.sort_by')}</label>
                                <div className="d-inline-block" style={{width: '15rem'}}>
                                    <Select
                                        isClearable
                                        options={[
                                            {
                                                value: 'newest',
                                                label: t('seller.newest')
                                            }
                                        ]}
                                        className="select"
                                        onChange={selectedOption => this.props.parent.onSortChange(selectedOption)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row mt-sm-0 mt-md-4 mt-lg-4 mt-xl-4">
                        <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 mobile-hidden">
                            <div className="bgc-F0F6F9 p-3 rounded">
                                <div className="pl-3">
                                    <div className={`${this.props.parent.state.currentLabel === "all" && "font-weight-bold"} `} onClick={() => this.props.parent.onLabelChange("all")}>{t("seller.all_product")}</div>
                                    {
                                        this.props.parent.state.seller_labels.map((label, index) => (
                                            <div key={index} className={`${this.props.parent.state.currentLabel === label.id && "font-weight-bold"}  mt-2`} onClick={() => this.props.parent.onLabelChange(label.id)}>{label.name}</div>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-sm-12 col-md-9 col-lg-9 col-xl-9 mt-3 mt-sm-3 mt-md-0 mt-lg-0 mt-xl-0">
                            <div id="products-comp">
                                <style>{`
                                @media only screen and (max-width: 767.98px) {
                                    #products-comp {
                                        display: grid;
                                        grid-template-columns: repeat(2, 1fr);
                                        gap: 1rem;
                                    }
                                }
                                @media only screen and (min-width: 767.98px) {
                                    #products-comp {
                                        display: grid;
                                        grid-template-columns: repeat(3, 1fr);
                                        gap: 1rem;
                                    }
                                }
                            `}</style>
                                {
                                    this.props.parent.state.seller_products.map((product, index) => (
                                        <Link to={EcommerceRoutePath.PRODUCT_DETAIL.replace(":seller_slug", this.props.parent.state.seller_slug).replace(":product_slug", product.slug)} className="bg-white shadow-graph position-relative text-decoration-none rounded p-2" key={product.id}>
                                            <CustomImage folder={PublicStorageFolderPath.products} filename={product.mp_product_images[0].filename} alt={product.mp_product_images[0].filename} className="w-100 object-fit-cover product-comp-image"/>
                                            <TextTruncate lineClamp={2} className="m-0  font-weight-semi-bold"><ManualSwitchLanguage data={product.mp_product_informations} langAttr={"language_code"} valueAttr={"name"} /></TextTruncate>
                                            {parseInt(product.mp_product_skus.find(value1 => value1.is_main).normal_price) > 0 &&
                                            <div className="d-flex align-items-center">
                                                <span className="bgc-accent-color  rounded px-1">{PriceRatio(product.mp_product_skus.find(value1 => value1.is_main).normal_price, product.mp_product_skus.find(value1 => value1.is_main).price)}</span>
                                                <span className="color-374650 px-1"><del>Rp. {CurrencyFormat(product.mp_product_skus.find(value1 => value1.is_main).normal_price)}</del></span>
                                            </div>}
                                            <p className="m-0  color-374650 font-weight-bold">Rp. {CurrencyFormat(product.mp_product_skus.find(value1 => value1.is_main).price)}</p>
                                            <p
                                                className="m-0  color-374650"
                                            >{product.mp_seller.city}</p>
                                            <div className="d-flex align-items-center">
                                                <>
                                                    <i className="far fa-star  accent-color" />
                                                    <span className=" color-374650 mt-1 ml-1">{product.rating ? product.rating : "-"}</span>
                                                    <span className=" color-374650 mt-1 ml-1">|</span>
                                                </>
                                                <span className=" color-374650 mt-1 ml-1">{t('product_detail.sold')} {product.sold_product}</span>
                                            </div>
                                            <div className="position-absolute pointer" style={{right: '0.5rem', bottom: 0}} onClick={event => {event.preventDefault(); this.props.parent.addWishlist(product.id, !product.mp_wishlist)}}>
                                                {product.mp_wishlist ?
                                                    <svg width="28px" height="28px" viewBox="0 0 16 16" className="bi bi-heart-fill" fill={context.theme_settings ? context.theme_settings.accent_color.value : ''} xmlns="http://www.w3.org/2000/svg">
                                                        <path fillRule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z" />
                                                    </svg> :
                                                    <svg width="28px" height="28px" viewBox="0 0 16 16" className="bi bi-heart" fill={context.theme_settings ? context.theme_settings.accent_color.value : ''} xmlns="http://www.w3.org/2000/svg">
                                                        <path fillRule="evenodd" d="M8 2.748l-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z" />
                                                    </svg>}
                                            </div>
                                        </Link>
                                    ))
                                }
                            </div>
                            {(this.props.parent.state.last_page > 0) &&
                            <div className="d-flex justify-content-end mt-3">
                                <Paginate
                                    pageCount={this.props.parent.state.last_page}
                                    onPageChange={selected => this.props.parent.onPageChange(selected)}
                                    initialPage={this.props.parent.state.current_page}
                                />
                            </div>}
                        </div>
                    </div>
                </div>
            )}</MyContext.Consumer>
            </div>}
            {this.props.parent.state.config.type == "type_2" && <div>
            <MyContext.Consumer>{context => (
                <div className="mt-4">
                    <style>{`
                    @media only screen and (min-width: 767.98px) {
                        .desktop-hidden {
                            display: none !important;
                        }
                    }
                    @media only screen and (max-width: 767.98px) {
                        .mobile-hidden {
                            display: none;
                        }
                    }
                    `}
                    </style>
                    <div className="row mt-sm-0 mt-md-4 mt-lg-4 mt-xl-4">
                        <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 mobile-hidden">
                            <div className="p-3 shadow-graph rounded">
                                <div className={`font-weight-semi-bold  py-3 border-bottom`}>Label</div>
                                <div className="py-3 border-bottom d-flex" onClick={() => this.props.parent.onLabelChange("all")}>
                                    <label className={`${this.props.parent.state.currentLabel === "all" && "font-weight-bold accent-color"} `}>{t("seller.all_product")}</label>
                                    <label className={`${this.props.parent.state.currentLabel === "all" && "font-weight-bold accent-color"}  ml-auto`}><i className="fas fa-angle-right"/></label>
                                </div>
                                {
                                    this.props.parent.state.seller_labels.map((label, index) => (
                                    <div key={index} className={`py-3 d-flex ${this.props.parent.state.seller_labels.length-1 != index && "border-bottom"}`} onClick={() => this.props.parent.onLabelChange(label.id)}>
                                        <label className={`${this.props.parent.state.currentLabel === label.id && "font-weight-bold accent-color"} `}>{label.name}</label>
                                        <label className={`${this.props.parent.state.currentLabel === label.id && "font-weight-bold accent-color"}  ml-auto`}><i className="fas fa-angle-right"/></label>
                                    </div>
                                    ))
                                }
                            </div>
                        </div>
                        <div className="col-12 col-sm-12 col-md-9 col-lg-9 col-xl-9 mt-3 mt-sm-3 mt-md-0 mt-lg-0 mt-xl-0">
                            <div className="row mb-4">
                                <div className="col-12 col-sm-12 col-md 12 col-lg-6 col-xl-6 align-items-center d-flex">
                                    <div className="font-weight-semi-bold">{t('seller.products')}</div>
                                </div>
                                <div className="col-12 col-sm-12 col-md 12 col-lg-6 col-xl-6 d-flex desktop-hidden my-3">
                                    <div className="col-3 col-sm-3 col-md-3 col-lg-0 col-xl-0">
                                        <label className="color-22262A mt-3">Label</label>
                                    </div>
                                    <div className="d-inline-block" style={{width: '15rem'}}>
                                        <Select
                                            options={this.props.parent.state.labelOptions}
                                            className="select"
                                            value={this.props.parent.state.currentLabel && this.props.parent.state.labelOptions.find(data => data.value === this.props.parent.state.currentLabel)}
                                            onChange={selectedOption => this.props.parent.onLabelChange(selectedOption.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-12 col-sm-12 col-md 12 col-lg-6 col-xl-6 d-flex sort-product">
                                    <div className="col-3 col-sm-3 col-md-3 col-lg-0 col-xl-0">
                                        <label className="color-22262A mt-3">{t('seller.sort_by')}</label>
                                    </div>
                                    <div className="d-inline-block" style={{width: '15rem'}}>
                                        <Select
                                            isClearable
                                            options={[
                                                {
                                                    value: 'newest',
                                                    label: t('seller.newest')
                                                }
                                            ]}
                                            className="select"
                                            onChange={selectedOption => this.props.parent.onSortChange(selectedOption)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div id="products-comp">
                                <style>{`
                                @media only screen and (max-width: 767.98px) {
                                    #products-comp {
                                        display: grid;
                                        grid-template-columns: repeat(2, 1fr);
                                        gap: 1rem;
                                    }
                                    .sort-product {
                                        justify-content: start;
                                    }
                                }
                                @media only screen and (min-width: 767.98px) {
                                    #products-comp {
                                        display: grid;
                                        grid-template-columns: repeat(3, 1fr);
                                        gap: 1rem;
                                    }
                                    .sort-product {
                                        justify-content: end;
                                    }
                                }
                            `}</style>
                                {
                                    this.props.parent.state.seller_products.map((product, index) => (
                                        <Link to={EcommerceRoutePath.PRODUCT_DETAIL.replace(":seller_slug", this.props.parent.state.seller_slug).replace(":product_slug", product.slug)} className="bg-white shadow-graph position-relative text-decoration-none rounded p-2" key={product.id}>
                                            <CustomImage folder={PublicStorageFolderPath.products} filename={product.mp_product_images[0].filename} alt={product.mp_product_images[0].filename} className="w-100 object-fit-cover product-comp-image"/>
                                            <TextTruncate lineClamp={2} className="m-0"><ManualSwitchLanguage data={product.mp_product_informations} langAttr={"language_code"} valueAttr={"name"} /></TextTruncate>
                                            <div className="d-flex align-items-center">
                                                <img src={`/images/seller-icon.png`} className="mr-2" style={{height: 20}}/>
                                                <p
                                                    className="m-0 font-size-80-percent color-374650"
                                                    onMouseOver={event => event.currentTarget.textContent = product.mp_seller.name}
                                                    onMouseOut={event => event.currentTarget.textContent = product.mp_seller.city}
                                                >{product.mp_seller.city}</p>
                                            </div>
                                            {product.is_sale_price &&
                                            <div className="d-flex align-items-center mt-2">
                                                <span className="font-size-80-percent bgc-accent-color  rounded px-1">{PriceRatio(product.mp_product_skus.find(value1 => value1.is_main).normal_price, product.mp_product_skus.find(value1 => value1.is_main).price)}</span>
                                                <span className="font-size-80-percent color-374650 px-1"><del>Rp. {CurrencyFormat(product.mp_product_skus.find(value1 => value1.is_main).normal_price)}</del></span>
                                            </div>}
                                            <p className="m-0 color-374650 font-weight-bold">Rp. {CurrencyFormat(product.mp_product_skus.find(value1 => value1.is_main).price)}</p>
                                            <div className="d-flex align-items-center">
                                                <i className="far fa-star font-size-80-percent accent-color mt-1" />
                                                <span className="font-size-80-percent color-374650 mt-1 ml-1">{product.rating ? product.rating : "-"}</span>
                                                <span className="font-size-80-percent color-374650 mt-1 ml-1">|</span>
                                                <span className="font-size-80-percent color-374650 mt-1 ml-1">Terjual {product.sold_product}</span>
                                            </div>
                                        </Link>
                                    ))
                                }
                            </div>
                            {(this.props.parent.state.last_page > 0) &&
                            <div className="d-flex justify-content-end mt-3">
                                <Paginate
                                    pageCount={this.props.parent.state.last_page}
                                    onPageChange={selected => this.props.parent.onPageChange(selected)}
                                    initialPage={this.props.parent.state.current_page}
                                />
                            </div>}
                        </div>
                    </div>
                </div>
            )}</MyContext.Consumer>
            </div>}
            </>
        )
    }
}

export default withTranslation()(SellerProduct);