import React, { PureComponent } from 'react';
import Template from "../../../components/Template";
import MyContext from "../../../components/MyContext";
import $ from "jquery";
import axios from "axios";
import Config from "../../../components/axios/Config";
import ManualSwitchLanguage from "../../../components/helpers/ManualSwitchLanguage";
import { withTranslation } from "react-i18next";
import CurrencyFormat from "../../../components/helpers/CurrencyFormat";
import IsEmpty from "../../../components/helpers/IsEmpty";
import SwalToast from "../../../components/helpers/SwalToast";
import AuthRoutePath from "../../auth/AuthRoutePath";
import ProductSnapshotInformation from "./ProductSnapshotInformation";
import { Link } from "react-router-dom";
import Select from "react-select";
import Cookie from 'js-cookie'
import PriceRatio from '../../../components/helpers/PriceRatio';
import EcommerceRoutePath from '../EcommerceRoutePath';
import CustomImage, { PublicStorageFolderPath } from '../../../components/helpers/CustomImage';
import CustomImageZoom from '../../../components/helpers/CustomImageZoom';

const Style = props => {
    if (props.themes) {
        return (
            <style>{`
                #product-detail {
                    max-width: ${props.themes.site_width.width};
                    margin: 0 auto;
                }
                .product-preview-image img {
                    width: 100% !important;
                    object-fit: cover;
                }
            `}</style>
        );
    } else return null;
}

class ProductSnapshot extends PureComponent {
    constructor(props) {
        super(props);
        this.tab = {
            first: 'information',
            second: 'discussion',
            third: 'reviews',
        };
        this.state = {
            imgPreviewSize: 300,
            currentImagePreview: null,
            currentTab: this.tab.first,
            isNotFound: false,
            config: null,
            detail: null,
        };

        if (IsEmpty(Cookie.get('token'))) {
            this.props.history.push({
                pathname: AuthRoutePath.LOGIN,
                search: `from=${this.props.location.pathname}`
            });
        }
    }

    componentDidMount() {
        this.getProductSnapshot();
        window.addEventListener('resize', this.imgSquare);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.imgSquare);
    }

    getProductSnapshot = () => {
        axios.get(`${process.env.REACT_APP_BASE_API_URL}my-orders/getProductSnapshot/${this.props.match.params.id}`, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        })).then(response => {
            let config = JSON.parse(response.data.data.config) || {};

            let detail = response.data.data.product
            if (detail) {
                for (const mp_transaction_product_information of detail.mp_transaction_product_informations) {
                    mp_transaction_product_information.sections = JSON.parse(mp_transaction_product_information.sections)
                }

                this.setState({
                    config,
                    detail,
                    isNotFound: false,
                    currentImagePreview: detail.mp_transaction_product_images[0].filename,
                });
            } else {
                this.setState({
                    isNotFound: true
                })
            }
        }).catch(error => {
            console.log(error);
        }).finally(() => {
            //
        });
    }

    arrayUnique = (arrayJson, prop) => {
        return arrayJson.filter((obj, pos, arr) => {
            return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
        });
    }

    imgSquare = () => {
        let imgWidth = $('.product-preview-image img').width();
        this.setState({
            imgPreviewSize: imgWidth
        }, () => {
            $('.product-preview-image img').css('height', imgWidth);
            $('.product-carousel-image img').css('height', $('.product-carousel-image').width());
        });
    }

    render() {
        const { t } = this.props;
        return (
            <Template>
                <MyContext.Consumer>{context => (<>
                    {!IsEmpty(this.state.config) &&
                        <>
                            {this.state.config.type === 'type_1' &&
                                <div id={"product-detail"} className="my-4">
                                    <Style themes={context.theme_settings} />
                                    {!IsEmpty(this.state.detail) &&
                                        <>
                                            <div className="bgc-D1E8FA rounded border-8DBBDC d-flex align-items-center px-3 py-2">
                                                <img
                                                    src={`/images/alert-blue.png`}
                                                    onError={event => event.target.src = `/images/placeholder.gif`}
                                                    width={24}
                                                    height={24}
                                                />
                                                <div className="ml-3" style={{ lineHeight: 1.2 }}>
                                                    <p className="m-0 color-374650 ">This is product snapshot page when you ordered this product on <b>2021-03-24</b></p>
                                                </div>
                                            </div>
                                            <div className="row mt-3">
                                                <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4">
                                                    <div className="product-preview-image">
                                                        <CustomImageZoom folder={PublicStorageFolderPath.products} filename={this.state.currentImagePreview} height={this.state.imgPreviewSize} />
                                                    </div>
                                                </div>
                                                <div className="col-12 col-sm-12 col-md-8 col-lg-8 col-xl-8">
                                                    <div className="px-2 px-sm-2 px-md-0 px-lg-0 px-xl-0">
                                                        <h5 className="m-0 color-292929">
                                                            <ManualSwitchLanguage data={this.state.detail.mp_transaction_product_informations} langAttr={"language_code"} valueAttr={"name"} />
                                                        </h5>
                                                        <p className="mb-2 color-858585 ">{this.state.config.show_unit_sold && <>{t('product_detail.sold')} {this.state.detail.sold_product} |</>} {this.state.config.show_rating && <><i className="far fa-star accent-color" /> {t('product_detail.rating')} {this.state.detail.rating} (3 {t('product_detail.reviews')}) |</>} {t('product_detail.discussion')} (1)</p>
                                                        <div className="price d-flex align-items-end">
                                                            <h4 className="m-0 color-292929 font-weight-bold">Rp {CurrencyFormat(this.state.detail.mp_transaction_product_sku.price.toString())}</h4>
                                                            {parseInt(this.state.detail.mp_transaction_product_sku.normal_price) > 0 &&
                                                                <div className="d-flex align-items-center">
                                                                    <p className="mb-0 ml-3 color-292929 small"><del>Rp {CurrencyFormat(this.state.detail.mp_transaction_product_sku.normal_price.toString())}</del></p>
                                                                    <span className="ml-1  bgc-accent-color px-1">{PriceRatio(this.state.detail.mp_transaction_product_sku.normal_price, this.state.detail.mp_transaction_product_sku.price)}</span>
                                                                </div>}
                                                        </div>
                                                        <div className="variant mt-3">
                                                            <p className="m-0 color-292929  font-weight-semi-bold">{t('product_detail.choose_variant')}</p>
                                                            <div className="row">
                                                                <div className="col-12 col-sm-12 col-md-5 col-lg-5 col-xl-5">
                                                                    {this.state.detail.mp_transaction_product_sku_variants.map(value => {
                                                                        let dropdownValue = {
                                                                            value: value.mp_transaction_product_sku_variant_option.id,
                                                                            label: value.mp_transaction_product_sku_variant_option.name
                                                                        }
                                                                        return (
                                                                            <div className="row no-gutters mt-2">
                                                                                <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 d-flex align-items-center pr-1">
                                                                                    <p className="m-0 color-292929 ">{value.name}</p>
                                                                                </div>
                                                                                <div className="col-12 col-sm-12 col-md-9 col-lg-9 col-xl-9">
                                                                                    <Select
                                                                                        className="form-control-sm h-100 p-0"
                                                                                        defaultValue={dropdownValue}
                                                                                        options={[dropdownValue]}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="brand mt-3">
                                                            <div className="row">
                                                                <div className="col-12 col-sm-12 col-md-5 col-lg-5 col-xl-5">
                                                                    <div className="py-2" style={{ borderTop: '1px solid #F0F6F9', borderBottom: '1px solid #F0F6F9' }}>
                                                                        <div className="row no-gutters">
                                                                            <div className="col-3 pr-2">
                                                                                <CustomImage folder={PublicStorageFolderPath.cms} filename={this.state.detail.mp_seller.logo} alt={this.state.detail.mp_seller.logo} className="w-100 object-fit-cover" style={{ maxHeight: 50 }} />
                                                                            </div>
                                                                            <div className="col-9 d-flex align-items-center">
                                                                                <div>
                                                                                    <p className="m-0 color-292929  font-weight-bold">{this.state.detail.mp_seller.name}</p>
                                                                                    <p className="m-0 color-858585 "><i className="far fa-star accent-color" /> 5.0 {this.state.config.show_seller_location && <>| {this.state.detail.mp_seller.city}</>}</p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row mt-4">
                                                <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4">
                                                    <div className="overflow-auto" style={{ margin: '0 -0.5rem' }}>
                                                        {this.state.detail.mp_transaction_product_images.map(value => (
                                                            <a href="#" className="text-decoration-none px-2" onClick={event => {
                                                                event.preventDefault();
                                                                this.setState({
                                                                    currentImagePreview: value.filename
                                                                });
                                                            }}>
                                                                <CustomImage folder={PublicStorageFolderPath.cms} filename={value.filename} alt={value.filename} className="object-fit-cover" style={{ width: 80, height: 80 }} />
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="information mt-4">
                                                <div className="">
                                                    <span onClick={event => this.setState({ currentTab: this.tab.first })} className={`${this.state.currentTab === this.tab.first ? 'accent-color bgc-FAFAFB font-weight-bold' : 'color-262626'} small pointer px-4 py-3`}>Product Infomation</span>
                                                </div>
                                                <div className="py-3 bgc-FAFAFB">
                                                    {this.state.currentTab === this.tab.first && <ProductSnapshotInformation data={this.state.detail.mp_transaction_product_informations} />}
                                                </div>
                                            </div>
                                        </>}

                                    {this.state.isNotFound &&
                                        <h3 className="m-0 font-weight-semi-bold color-374650">Not Found</h3>}
                                </div>
                            }

                            {this.state.config.type === 'type_2' &&
                                <div id={"product-detail"} className="my-0 my-sm-0 my-md-3 my-lg-4 my-xl-4">
                                    <Style themes={context.theme_settings} />
                                    {!IsEmpty(this.state.detail) &&
                                        <>
                                            <div className="bgc-D1E8FA rounded border-8DBBDC d-flex align-items-center px-3 py-2">
                                                <img
                                                    src={`/images/alert-blue.png`}
                                                    onError={event => event.target.src = `/images/placeholder.gif`}
                                                    width={24}
                                                    height={24}
                                                />
                                                <div className="ml-3" style={{ lineHeight: 1.2 }}>
                                                    <p className="m-0 color-374650 ">This is product snapshot page when you ordered this product on <b>2021-03-24</b></p>
                                                </div>
                                            </div>
                                            <div className="row mt-4">
                                                <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4">
                                                    <div className="product-preview-image">
                                                        <CustomImageZoom folder={PublicStorageFolderPath.products} filename={this.state.currentImagePreview} height={this.state.imgPreviewSize} />
                                                    </div>
                                                    <div className="d-block d-sm-block d-md-none d-lg-none d-xl-none my-3 pdg-dwa">
                                                        <div className="overflow-auto" style={{ margin: '0 -0.5rem' }}>
                                                            {this.state.detail.mp_transaction_product_images.map(value => (
                                                                <a href="#" className="text-decoration-none px-2" onClick={event => {
                                                                    event.preventDefault();
                                                                    this.setState({
                                                                        currentImagePreview: value.filename
                                                                    });
                                                                }}>
                                                                    <CustomImage folder={PublicStorageFolderPath.products} filename={value.filename} alt={value.filename} className={`object-fit-cover rounded ${this.state.currentImagePreview == value.filename ? "border-accent-color" : "border-DCDCDC"} `} style={{ width: 80, height: 80 }} />
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="mt-3">
                                                        <div className="d-none d-sm-none d-md-block d-lg-block d-xl-block">
                                                            <div className="overflow-auto" style={{ margin: '0 -0.5rem' }}>
                                                                {this.state.detail.mp_transaction_product_images.map(value => (
                                                                    <a href="#" className="text-decoration-none px-2" onClick={event => {
                                                                        event.preventDefault();
                                                                        this.setState({
                                                                            currentImagePreview: value.filename
                                                                        });
                                                                    }}>
                                                                        <CustomImage folder={PublicStorageFolderPath.products} filename={value.filename} alt={value.filename} className={`object-fit-cover rounded ${this.state.currentImagePreview == value.filename ? "border-accent-color" : "border-DCDCDC"} `} style={{ width: 80, height: 80 }} />
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-12 col-sm-12 col-md-8 col-lg-8 col-xl-8">
                                                    <div className="pdg-dwa shadow-graph bg-white rounded p-4">
                                                        <div className="pb-4 border-bottom">
                                                            <h5 className="m-0 color-292929">
                                                                <ManualSwitchLanguage data={this.state.detail.mp_transaction_product_informations} langAttr={"language_code"} valueAttr={"name"} />
                                                            </h5>
                                                            <p className="mb-2 color-858585 "><span><i className="fa fa-check-circle mt-2 accent-color" style={{ fontSize: 20 }} /></span> {this.state.detail.mp_seller.name} | {this.state.config.show_unit_sold && <>{t('product_detail.sold')} {this.state.detail.sold_product} |</>} {this.state.config.show_rating && <><i className="far fa-star accent-color" /> {t('product_detail.rating')} {this.state.detail.rating ? this.state.detail.rating : "-"} (3 {t('product_detail.reviews')})</>}</p>
                                                            <div className="price d-flex align-items-center">
                                                                {parseInt(this.state.detail.mp_transaction_product_sku.normal_price) > 0 &&
                                                                    <span className="ml  bgc-accent-color px-2 mr-3 font-size-90-percent rounded">{PriceRatio(this.state.detail.mp_transaction_product_sku.normal_price, this.state.detail.mp_transaction_product_sku.price)}</span>}
                                                                {parseInt(this.state.detail.mp_transaction_product_sku.normal_price) > 0 &&
                                                                    <div className="d-flex align-items-center">
                                                                        <p className="mb-0 mr-3 color-292929 font-size-90-percent"><del>Rp {CurrencyFormat(this.state.mp_transaction_product_sku.normal_price)}</del></p>
                                                                    </div>}
                                                                <h4 className="m-0 mr-3 color-292929 font-weight-bold">Rp {CurrencyFormat(this.state.detail.mp_transaction_product_sku.price)}</h4>
                                                            </div>
                                                        </div>
                                                        <div className="pb-4 border-bottom">
                                                            <div className="mt-3">
                                                                <p className="m-0 mb-2 color-292929  font-weight-semi-bold">{t('product_detail.delivery')}</p>
                                                                <p className="">{t('product_detail.delivery_from')}: {this.state.detail.mp_seller.city}</p>
                                                                {/* <p className="">Oleh: </p> */}
                                                            </div>
                                                        </div>
                                                        <div className="">
                                                            {!IsEmpty(this.arrayUnique(this.state.detail.mp_transaction_product_sku_variants, 'name')) ?
                                                                <div className="variant mt-3">
                                                                    <p className="m-0 color-292929 font-weight-semi-bold">{t('product_detail.choose_variant')}</p>
                                                                    <div className="row">
                                                                        <div className="col-12 col-sm-12 col-md-5 col-lg-5 col-xl-5">
                                                                            {this.arrayUnique(this.state.detail.mp_product_variants, 'name').map(value => (
                                                                                <div className="mt-2">
                                                                                    <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 row align-items-center pr-0 pr-sm-0 pr-md-1 pr-lg-1 pr-xl-1">
                                                                                        <p className="m-0 color-292929 ">{value.name}</p>
                                                                                    </div>
                                                                                    <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 ">
                                                                                        <div className="row mt-1">
                                                                                            {this.arrayUnique(value.mp_product_sku_variant_options, 'name').map(value1 =>
                                                                                                <div className={`mr-3 px-2 px-1 rounded  ${this.state[`variantOption${value.id}`] && (this.state[`variantOption${value.id}`]).value == value1.id ? "accent-color border-accent-color font-weight-bold" : "color-292929 border-292929"}`}
                                                                                                    onClick={() => this.setState({
                                                                                                        [`variantOption${value.id}`]: { label: value1.name, value: value1.id }
                                                                                                    }, () => this.chooseVariant(value, value1.name))}>
                                                                                                    {value1.name}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div> :
                                                                <div>
                                                                    <div className="mt-3">
                                                                        <p className="m-0 color-292929 font-weight-semi-bold">{t('product_detail.choose_variant')}</p>
                                                                        <p className="m-0 color-292929 mt-2">{t('product_detail.no_variant')}</p>
                                                                    </div>
                                                                </div>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="pdg-dwa mt-4">
                                                <div className="brand bg-white shadow-graph rounded p-4 mt-3">
                                                    <div className="row">
                                                        <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                                                            <div className="py-2">
                                                                <div className="row no-gutters">
                                                                    <div className="col-3 pr-2">
                                                                        <Link to={EcommerceRoutePath.SELLER.replace(":seller_slug", this.state.detail.mp_seller.slug)} className="text-decoration-none">
                                                                            <CustomImage folder={PublicStorageFolderPath.seller} filename={this.state.detail.mp_seller.logo} alt={this.state.detail.mp_seller.logo} className="object-fit-cover rounded-circle seller-image w-100" />
                                                                        </Link>
                                                                    </div>
                                                                    <div className="col-9 d-flex align-items-center">
                                                                        <div className="ml-3">
                                                                            <Link to={EcommerceRoutePath.SELLER.replace(":seller_slug", this.state.detail.mp_seller.slug)} className="text-decoration-none">
                                                                                <p className="m-0 color-292929  font-weight-bold">{this.state.detail.mp_seller.name}</p>
                                                                            </Link>
                                                                            <p className="m-0 color-858585 "><i className="fa fa-map-marker accent-color mr-2" />{this.state.detail.mp_seller.city}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 d-flex align-items-center">
                                                            <div className="col-6 col-sm-6 col-md-6 col-lg-6 col-xl-6 m-0 p-0 pr-2">
                                                                <Link className="btn btn-block border-accent-color accent-color font-weight-bold w-100" to={this.state.chatPath}>{t('seller.call')}</Link>
                                                            </div>
                                                            <div className="col-6 col-sm-6 col-md-6 col-lg-6 col-xl-6 m-0 p-0 pl-2">
                                                                <div className="btn bgc-accent-color  w-100" onClick={this.follow}>{this.state.detail.mp_seller.follow && this.state.detail.mp_seller.follow.is_follow ? t('seller.unfollow') : t('seller.follow')}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="information mt-4">
                                                    <div className="">
                                                        <span onClick={event => this.setState({ currentTab: this.tab.first })} className={`${this.state.currentTab === this.tab.first ? 'accent-color bgc-FAFAFB font-weight-bold' : 'color-262626'} small pointer px-4 py-3`}>Product Infomation</span>
                                                    </div>
                                                    <div className="py-3 bgc-FAFAFB">
                                                        {this.state.currentTab === this.tab.first && <ProductSnapshotInformation data={this.state.detail.mp_transaction_product_informations} />}
                                                    </div>
                                                </div>
                                            </div>
                                        </>}

                                    {this.state.isNotFound &&
                                        <h3 className="m-0 font-weight-semi-bold color-374650">Not Found</h3>}
                                </div>
                            }
                        </>}
                </>)}</MyContext.Consumer>
            </Template>
        );
    }
}

export default withTranslation()(ProductSnapshot);