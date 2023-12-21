import React, { PureComponent } from 'react';
import Template from "../../../components/Template";
import MyContext from "../../../components/MyContext";
import $ from "jquery";
import Select from "react-select";
import axios from "axios";
import Config from "../../../components/axios/Config";
import ManualSwitchLanguage from "../../../components/helpers/ManualSwitchLanguage";
import { Trans, withTranslation } from "react-i18next";
import CurrencyFormat, { CurrencyFormat2 } from "../../../components/helpers/CurrencyFormat";
import IsEmpty from "../../../components/helpers/IsEmpty";
import SwalToast from "../../../components/helpers/SwalToast";
import Carousel from "react-multi-carousel";
import { Link } from "react-router-dom";
import TextTruncate from "../../../components/helpers/TextTruncate";
import AuthRoutePath from "../../auth/AuthRoutePath";
import EcommerceRoutePath from "../EcommerceRoutePath";
import Cookie from "js-cookie";
import update from "immutability-helper";
import PriceRatio from '../../../components/helpers/PriceRatio'
import { Modal } from 'react-bootstrap';
import PwpConditions from './product-detail/PwpConditions';
import OtherProduct from './product-detail/OtherProduct';
import CartQuantity from './product-detail/CartQuantity';
import InformationTabs from './product-detail/InformationTabs';
import CustomImage, { PublicStorageFolderPath } from '../../../components/helpers/CustomImage';
import CustomImageZoom from '../../../components/helpers/CustomImageZoom';
import { CountdownAuction } from '../auction/components/CountDownAuction';
import AuctionConditions, { ConditionAuction } from './product-detail/AuctionConditions';
import Countdown from 'react-countdown';
import MetaTrigger from '../../../components/MetaTrigger';
import { isLogin } from '../../general/forum/components/IsLogin';
import Cookies from 'js-cookie';

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
                    object-fit: contain;
                }
                @media (max-width: 765.98px) {
                    .pdg-dwa {
                        padding-right: 18px;
                        padding-left: 18px;
                    }
                }
            `}</style>
        );
    } else return null;
}

class ProductDetail extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            imgPreviewSize: 300,
            currentImagePreview: null,
            currentVariant: null,
            variantSelected: {},
            variantSelectedStatus: '',
            cartQty: 1,
            isNotFound: false,
            config: {
                type: ""
            },
            detail: null,
            auction: null,
            related: [],
            pwp: null,
            bundlings: [],

            pwp_modal_open: false,
            other_product_modal_open: false,
            other_product_modal_data: null,
            dataBid: [10000, 15000, 20000],
            selectBid: null,
            bid: null,
            chatPath: {
                pathname: EcommerceRoutePath.CHAT,
            },
        };
        this.responsive = {
            desktop: {
                breakpoint: { max: 3000, min: 768 },
                items: 5,
            },
            tablet: {
                breakpoint: { max: 767.98, min: 576 },
                items: 5,
            },
            mobile: {
                breakpoint: { max: 575.98, min: 0 },
                items: 2.5,
            }
        };
    }

    componentDidMount() {
        this.getMasterData();
        this.getProductDetail();
        window.addEventListener('resize', this.imgSquare);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.imgSquare);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.location.pathname !== prevProps.location.pathname) {
            this.setState({
                detail: null,
                related: [],
                pwp: null,
                bundlings: [],
                pwp_modal_open: false,
                other_product_modal_open: false,
            })
            window.scrollTo(0, 0)
            this.getProductDetail();
        }
    }

    getMasterData = () => {
        axios.get(`${process.env.REACT_APP_BASE_API_URL}ecommerce/products/getMasterData`, Config()).then(response => {
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

    addWishlist = (product_id, value) => {
        const { t } = this.props;
        if (!Cookie.get('token')) {
            SwalToast.fire({ icon: 'info', title: t('product_detail.do_login_first') });
            return
        }

        axios.post(`${process.env.REACT_APP_BASE_API_URL}my-wishlist/add`, {
            product_id: product_id
        }, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        })).then(response => {
            this.setState({
                detail: update(this.state.detail, {
                    mp_wishlist: { $set: value }
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

    getProductDetail = () => {
        axios.get(`${process.env.REACT_APP_BASE_API_URL}ecommerce/product/find?seller_slug=${this.props.match.params.seller_slug}&product_slug=${this.props.match.params.product_slug}`, Config()).then(response => {
            response.data.data.detail.mp_product_informations.forEach(value => {
                value.sections = JSON.parse(value.sections) || {};
            });
            console.log('detail', response);
            this.setState({
                detail: response.data.data.detail,
                related: response.data.data.related,
                currentImagePreview: response.data.data.detail.mp_product_images[0].filename,
                currentVariant: response.data.data.detail.mp_product_skus.find(value => value.is_main === true),
                chatPath: {
                    pathname: EcommerceRoutePath.CHAT,
                    state: { user_id: response.data.data.detail.mp_seller_id, user_type: "seller", product: response.data.data.detail }
                }
            });
        }).catch(error => {
            console.log(error);
            // this.setState({
            //     isNotFound: true
            // });
        }).finally(() => {
            this.getPwpByProductID();
            this.getBundlingByProductID();
            this.getDataAuction();
        });
    }

    getPwpByProductID = () => {
        if (!this.state.detail || !this.state.detail.id) return;
        if (!this.state.detail.mp_product_pwp) return

        axios.get(`${process.env.REACT_APP_BASE_API_URL}ecommerce/product/getPwpByProductID/${this.state.detail.id}`, Config()).then(response => {
            console.log(response.data.data, 'pwp')
            this.setState({
                pwp: response.data.data
            })
        }).catch(error => {
            console.log(error);
        }).finally(() => {

        });
    }

    getBundlingByProductID = () => {
        if (!this.state.detail || !this.state.detail.id) return;
        if (this.state.detail.type !== "bundling") return

        axios.get(`${process.env.REACT_APP_BASE_API_URL}ecommerce/product/getBundlingByProductID/${this.state.detail.id}`, Config()).then(response => {
            console.log(response.data.data, 'bundling')
            response.data.data.forEach(datum => {
                datum.mp_product_sku.mp_product.mp_product_informations.forEach(information => {
                    information.sections = JSON.parse(information.sections) || {};
                });
            })

            this.setState({
                bundlings: response.data.data
            })
        }).catch(error => {
            console.log(error);
        }).finally(() => {

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

    chooseVariant = (level1, level2) => {
        console.log('lv1', level1.name)
        console.log('lv2', level2)
        let temp_variantSelected = { ...this.state.variantSelected };
        temp_variantSelected[level1.name.replace(' ', '_')] = level2;
        this.setState({
            variantSelected: { ...temp_variantSelected }
        }, () => {
            if (this.checkVariantSelected()) {
                this.setState({
                    variantSelectedStatus: ''
                }, () => {
                    let variant = [];
                    this.state.detail.mp_product_variants.map(value => {
                        variant.push(this.state.variantSelected[value.name.replace(' ', '_')]);
                    });
                    console.log('variant', variant);
                    axios.post(`${process.env.REACT_APP_BASE_API_URL}ecommerce/product/variant-change`, {
                        product_id: this.state.detail.id,
                        variant: JSON.stringify(variant),
                    }, Config()).then(response => {
                        if (response.data.success) {
                            this.setState({
                                currentVariant: response.data.data
                            }, () => console.log('vd', this.state.currentVariant));
                        }
                    }).catch(error => {
                        console.error(error.response);
                    });
                });
            }
        });
    }

    checkVariantSelected = () => {
        let result = true;
        if (this.state.detail.mp_product_variants.length > 0) this.state.detail.mp_product_variants.map(value => {
            if (result) {
                if (IsEmpty(this.state.variantSelected[value.name.replace(' ', '_')])) result = false;
            }
        });
        else {
            let sku = this.state.detail.mp_product_skus.find(value => value.is_main === true);
            if (!IsEmpty(sku)) this.setState({
                currentVariant: sku,
            }, () => result = true);
            else SwalToast.fire({
                icon: 'error',
                title: 'Failed add to cart!'
            });
        }
        return result;
    }

    arrayUnique = (arrayJson, prop) => {
        return arrayJson.filter((obj, pos, arr) => {
            return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
        });
    }

    handleAddToCart = () => {
        const { t } = this.props;
        if (!Cookie.get('token')) {
            SwalToast.fire({ icon: 'info', title: t('product_detail.do_login_first') });
            return
        }

        if (this.checkVariantSelected()) {
            this.setState({
                variantSelectedStatus: ''
            }, () => {
                if (parseInt(this.state.cartQty) <= parseInt(this.state.currentVariant.stock)) {
                    axios.post(`${process.env.REACT_APP_BASE_API_URL}cart/add`, {
                        sku_id: this.state.currentVariant.id,
                        qty: this.state.cartQty
                    }, Config({
                        Authorization: `Bearer ${Cookie.get('token')}`
                    })).then(response => {
                        SwalToast.fire({
                            icon: 'success',
                            title: 'Successfully add to cart!'
                        });
                    }).catch(error => {
                        let errMsg = 'Failed add to cart!'
                        if (error.response && error.response.data) {
                            errMsg = error.response.data.message
                        }
                        SwalToast.fire({
                            icon: 'error',
                            title: errMsg
                        });
                    });
                } else {
                    SwalToast.fire({
                        icon: 'error',
                        title: 'Out of Stock'
                    });
                }
            });
        } else {
            this.setState({
                variantSelectedStatus: 'have no variant selected'
            }, () => {
                SwalToast.fire({
                    icon: 'error',
                    title: 'Please choose variant first!'
                });
            });
        }
    }

    follow = () => {
        if (IsEmpty(Cookie.get('token'))) {
            this.props.history.push({
                pathname: AuthRoutePath.LOGIN,
                search: `from=${this.props.location.pathname}`
            });
            return
        }
        axios.post(`${process.env.REACT_APP_BASE_API_URL}ecommerce/seller/follow`, {
            mp_seller_id: this.state.detail.mp_seller_id,
            is_follow: this.state.detail.mp_seller.follow ? !this.state.detail.mp_seller.follow.is_follow : true
        }, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        })).then(response => {
            SwalToast.fire({
                icon: 'success',
                title: 'Successfully follow!'
            });
            this.getProductDetail()
        }).catch(error => {
            let errMsg = 'Failed to follow!'
            if (error.response && error.response.data) {
                errMsg = error.response.data.message
            }
            SwalToast.fire({
                icon: 'error',
                title: errMsg
            });
        })
    }


    buyAtLeastQtyForPwp = () => {
        if (!this.state.pwp) return;
        if (!this.state.detail || !this.state.detail.id) return

        let pwp_detail_for_current_product = this.state.pwp.details.find(x => x.mp_product_id === this.state.detail.id)
        if (pwp_detail_for_current_product) {
            return this.props.t('product_detail.buy_at_least_qty_for_pwp', { qty: pwp_detail_for_current_product.min_qty })
        }

        return null
    }

    openOtherProductModal = (e) => {
        let index = e.currentTarget.getAttribute('index')
        this.setState({
            other_product_modal_open: true,
            other_product_modal_data: this.state.pwp.details[index]
        })
    }

    closeOtherProductModal = () => {
        this.setState({
            other_product_modal_open: false,
            other_product_modal_data: null
        })
    }

    cartQuantityOnChange = (cartQty) => {
        this.setState({ cartQty: cartQty })
    }

    onSelectBid = (bid) => {
        this.setState({ selectBid: bid, bid: bid })
    }
    pwpView = () => {
        const { t } = this.props
        if (this.state.pwp && this.state.pwp.details && this.state.pwp.details.length > 0) return (
            <div className="mt-3 p-5 bgc-accent-color rounded pwp-view">
                <style>{`
                @media only screen and (max-width: 767.99px) {
                    .pwp-view{                        
                        grid-template-columns: 1fr;
                    }
                }
                @media only screen and (min-width: 768px) {
                    .pwp-view{
                        grid-template-columns: 1fr 1fr;
                    }
                }
                .pwp-view{
                    display: grid;
                    gap: 10px;
                }
            `}</style>
                <div className="text-white m-auto">
                    <h3 className="font-weight-bold text-white">{t('product_detail.pwp_discount_exist')}</h3>
                    <Trans i18nKey="product_detail.pwp_desc" components={[<br />]} />
                    <div className="mt-3 link font-weight-bold text-white" onClick={() => this.setState({ pwp_modal_open: true })}>{t('product_detail.pwp_learn_more')}</div>
                </div>
                <div className="" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr)', gap: 10 }}>
                    {this.state.pwp.details.map((item, index) => {
                        if (item.mp_product_id === this.state.detail.id) return null;
                        else return (<div key={item.id} className="bg-white p-3" index={index} onClick={this.openOtherProductModal} style={{ borderRadius: 10 }}>
                            <div>
                                <CustomImage folder={PublicStorageFolderPath.products} filename={item.mp_product.mp_product_images[0].filename} alt={item.mp_product.mp_product_images[0].filename} className="object-fit-contain w-100" />
                            </div>
                            <div className="">
                                <div><ManualSwitchLanguage data={item.mp_product.mp_product_informations} langAttr={"language_code"} valueAttr={"name"} /></div>
                                <div className="price mt-3">
                                    {parseInt(item.mp_product.mp_product_skus.find(x => x.is_main).normal_price) > 0 && <div className="mr-3 d-flex small">
                                        <span className=" bgc-accent-color px-2 rounded">{PriceRatio(item.mp_product.mp_product_skus.find(x => x.is_main).normal_price, item.mp_product.mp_product_skus.find(x => x.is_main).price)}</span>
                                        <div className="d-flex align-items-center">
                                            <p className="mb-0 ml-2 color-292929"><del>Rp {CurrencyFormat(item.mp_product.mp_product_skus.find(x => x.is_main).normal_price)}</del></p>
                                        </div>
                                    </div>}
                                    <div className="m-0 color-292929 font-weight-bold">Rp {CurrencyFormat(item.mp_product.mp_product_skus.find(x => x.is_main).price)}</div>
                                </div>
                            </div>
                        </div>)
                    })}
                </div>
            </div>
        )
        else return null
    }

    getDataAuction = () => {
        if (this.state.detail.type !== 'auction') return
        let url = `${process.env.REACT_APP_BASE_API_URL}auction/detailAuction/${this.state.detail.id}`

        let axiosInstance = axios.get(url, Config())

        if (isLogin()) {
            axiosInstance = axios.get(url, Config({ Authorization: `Bearer ${Cookies?.get("token")}` }))
        }
        axiosInstance.then(response => {
            this.setState({
                auction: response.data.data
            })
        }).catch(error => {
            console.log(error)
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
            }
        })
    }

    render() {
        const { t } = this.props;
        return (
            <Template>
                <style>{`
                    .product-cart {
                        height: 390px;
                    }
                    .product-carousel-image {
                        height: 200px;
                    }
                    .seller-image {
                        height: 100px;
                        width: 100px;
                    }
                    @media (max-width: 767.98px) {
                        #products-comp {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 1rem;
                        }
                        .product-cart {
                            height: 320px;
                        }
                        .product-carousel-image {
                            height: 160px;
                        }
                        .seller-image {
                            height: 80px;
                            width: 80px;
                        }
                    }
                `}</style>
                <MyContext.Consumer>{context => (<>
                    <MetaTrigger
                        pageTitle={!IsEmpty(this.state.detail) ? `${this.state.detail?.mp_product_informations[0]?.name}` : ""}
                        pageDesc={`Product Detail`}
                    />
                    <Style themes={context.theme_settings} />
                    {!IsEmpty(this.state.config) && <>
                        {this.state.config.type === 'type_1' &&
                            <div id={"product-detail"} className="my-0 my-sm-0 my-md-3 my-lg-4 my-xl-4">
                                {!IsEmpty(this.state.detail) &&
                                    <>
                                        <div className="row">
                                            <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4">
                                                <div className="product-preview-image">
                                                    <CustomImageZoom folder={PublicStorageFolderPath.products} filename={this.state.currentImagePreview} height={this.state.imgPreviewSize} />
                                                </div>
                                                <div className="d-block d-sm-block d-md-none d-lg-none d-xl-none my-3 pdg-dwa">
                                                    <div className="overflow-auto" style={{ margin: '0 -0.5rem' }}>
                                                        {this.state.detail.mp_product_images.map(value => (
                                                            <a href="#" className="text-decoration-none px-2" onClick={event => {
                                                                event.preventDefault();
                                                                this.setState({
                                                                    currentImagePreview: value.filename
                                                                });
                                                            }}>
                                                                <CustomImage folder={PublicStorageFolderPath.products} filename={value.filename} alt={value.filename} className="object-fit-contain rounded" style={{ width: 80, height: 80 }} />
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-12 col-md-8 col-lg-8 col-xl-8">
                                                <div className="pdg-dwa">
                                                    <h5 className="m-0 color-292929">
                                                        <ManualSwitchLanguage data={this.state.detail.mp_product_informations} langAttr={"language_code"} valueAttr={"name"} />
                                                    </h5>
                                                    <p className="mb-2 color-858585 ">{this.state.config.show_unit_sold && <>{t('product_detail.sold')} {this.state.detail.sold_product} |</>} {this.state.config.show_rating && <><i className="far fa-star accent-color" /> {t('product_detail.rating')} {this.state.detail.rating ? this.state.detail.rating : "-"} ({this.state.detail.mp_product_ratings.length} {t('product_detail.reviews')}) |</>} {t('product_detail.discussion')} (1)</p>

                                                    <div className="price d-flex align-items-end">
                                                        <h4 className="m-0 color-292929 font-weight-bold">Rp {CurrencyFormat(this.state.currentVariant.price * this.state.cartQty)}</h4>
                                                        {this.state.detail.is_sale_price &&
                                                            <div className="d-flex align-items-center">
                                                                <p className="mb-0 ml-3 color-292929 small"><del>Rp {CurrencyFormat(this.state.currentVariant.normal_price * this.state.cartQty)}</del></p>
                                                                <span className="ml-1  bgc-accent-color px-1">{PriceRatio(this.state.currentVariant.normal_price, this.state.currentVariant.price)}</span>
                                                            </div>}
                                                    </div>

                                                    {this.state.detail?.type == "auction" && (
                                                        <>
                                                            <div className='d-flex align-items-center'>
                                                                <p className='body'>
                                                                    Penawaran Tertinggi :
                                                                </p>
                                                                <p className='font-weight-bold accent-color ml-1'>
                                                                    Rp {CurrencyFormat2(this.state.auction?.highest_bidder[0]?.bid_price)}
                                                                </p>
                                                            </div>
                                                            <div className='d-flex align-items-center my-2'>
                                                                <p className='body'>
                                                                    Penawaran Awal:
                                                                </p>
                                                                <p className='font-weight-bold ml-1 '>
                                                                    Rp {CurrencyFormat2(this.state.detail?.mp_product_skus[0]?.price)}
                                                                </p>
                                                                <p className='body ml-3'>
                                                                    Harga Toko:
                                                                </p>
                                                                <p className='font-weight-bold ml-1'>
                                                                    Rp {CurrencyFormat2(this.state.detail?.mp_product_skus[0]?.normal_price)}
                                                                </p>
                                                            </div>
                                                            <div className='d-flex align-items-center'>
                                                                <p className='body'>
                                                                    Kategori:
                                                                </p>
                                                                {this.state.detail?.mp_category !== null ?
                                                                    <p className='font-weight-bold accent-color ml-1 mt-1'>
                                                                        {this.state.detail?.mp_category.name}
                                                                    </p>
                                                                    :
                                                                    <p className='font-weight-bold accent-color ml-1 mt-1'>
                                                                        -
                                                                    </p>
                                                                }
                                                                <p className='body ml-3'>
                                                                    Label:
                                                                </p>
                                                                {this.state.detail?.mp_product_labels.map((label) => (
                                                                    <p className='font-weight-bold accent-color ml-1' >
                                                                        {label?.mp_label?.name}
                                                                    </p>
                                                                ))}
                                                            </div>
                                                        </>
                                                        // <ConditionAuction 

                                                        // />
                                                    )}

                                                    {!IsEmpty(this.arrayUnique(this.state.detail.mp_product_variants, 'name')) &&
                                                        <div className="variant mt-3">
                                                            <p className="m-0 color-292929  font-weight-semi-bold">{t('product_detail.choose_variant')}</p>
                                                            <div className="row">
                                                                <div className="col-12 col-sm-12 col-md-5 col-lg-5 col-xl-5">
                                                                    {this.arrayUnique(this.state.detail.mp_product_variants, 'name').map(value => (
                                                                        <div className="row no-gutters mt-2">
                                                                            <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 d-flex align-items-center pr-0 pr-sm-0 pr-md-1 pr-lg-1 pr-xl-1">
                                                                                <p className="m-0 color-292929 ">{value.name}</p>
                                                                            </div>
                                                                            <div className="col-12 col-sm-12 col-md-9 col-lg-9 col-xl-9">
                                                                                <Select
                                                                                    className="form-control-sm h-100 p-0"
                                                                                    options={this.arrayUnique(value.mp_product_sku_variant_options, 'name').map(value1 => ({
                                                                                        value: value1.id,
                                                                                        label: value1.name,
                                                                                    }))}
                                                                                    value={this.state[`variantOption${value.id}`]}
                                                                                    onChange={event => this.setState({
                                                                                        [`variantOption${value.id}`]: event
                                                                                    }, () => this.chooseVariant(value, event.label))}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>}
                                                    <div className="brand mt-3">
                                                        <div className="row">
                                                            <div className="col-12 col-sm-12 col-md-5 col-lg-5 col-xl-5">
                                                                <div className="py-2" style={{ borderTop: '1px solid #F0F6F9', borderBottom: '1px solid #F0F6F9' }}>
                                                                    <div className="row no-gutters">
                                                                        <div className="col-3 pr-2">
                                                                            <Link to={EcommerceRoutePath.SELLER.replace(":seller_slug", this.state.detail.mp_seller.slug)} className="text-decoration-none">
                                                                                <CustomImage folder={PublicStorageFolderPath.seller} filename={this.state.detail.mp_seller.logo} alt={this.state.detail.mp_seller.logo} className="object-fit-contain w-100" style={{ maxHeight: 50 }} />
                                                                            </Link>
                                                                        </div>
                                                                        <div className="col-9 d-flex align-items-center">
                                                                            <div>
                                                                                <Link to={EcommerceRoutePath.SELLER.replace(":seller_slug", this.state.detail.mp_seller.slug)} className="text-decoration-none">
                                                                                    <p className="m-0 color-292929  font-weight-bold">{this.state.detail.mp_seller.name}</p>
                                                                                </Link>
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
                                        <div className="pdg-dwa mt-4">
                                            <div className="row">
                                                <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4">
                                                    <div className="d-none d-sm-none d-md-block d-lg-block d-xl-block">
                                                        <div className="overflow-auto" style={{ margin: '0 -0.5rem' }}>
                                                            {this.state.detail.mp_product_images.map(value => (
                                                                <a href="#" className="text-decoration-none px-2" onClick={event => {
                                                                    event.preventDefault();
                                                                    this.setState({
                                                                        currentImagePreview: value.filename
                                                                    });
                                                                }}>
                                                                    <CustomImage folder={PublicStorageFolderPath.products} filename={value.filename} alt={value.filename} className="object-fit-contain" style={{ width: 80, height: 80 }} />
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-12 col-sm-12 col-md-8 col-lg-8 col-xl-8">
                                                    {(this.state.detail?.type === "auction") ?
                                                        <AuctionConditions
                                                            data={this.state.detail}
                                                            auction={this.state.auction}
                                                            getProductDetail={this.getProductDetail}
                                                        />
                                                        :
                                                        <div className="payment">
                                                            <div className="quantity d-flex align-items-center">
                                                                <CartQuantity
                                                                    type={this.state.config.type}
                                                                    stock={this.state.currentVariant.stock}
                                                                    maxOrder={this.state.detail.max_order}
                                                                    onChange={this.cartQuantityOnChange}
                                                                />
                                                                <button className="btn btn-sm  bgc-accent-color px-4 py-2 ml-3" onClick={this.handleAddToCart}>
                                                                    <div className="d-flex align-items-center">
                                                                        <svg className="bi bi-cart3" width="1rem" height="1rem" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                                            <path fillRule="evenodd" d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .49.598l-1 5a.5.5 0 0 1-.465.401l-9.397.472L4.415 11H13a.5.5 0 0 1 0 1H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l.84 4.479 9.144-.459L13.89 4H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm7 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
                                                                        </svg>
                                                                        <p className="mb-0 ml-3" style={{ fontWeight: 'normal' }}>{t('product_detail.add_to_cart')}</p>
                                                                    </div>
                                                                </button>
                                                                <button
                                                                    className="bgc-F6F7F8 rounded border-0 ml-3"
                                                                    style={{ width: '2.4rem', height: '2.4rem' }}
                                                                    onClick={event => this.addWishlist(this.state.detail.id, !this.state.detail.mp_wishlist)}
                                                                >
                                                                    {this.state.detail.mp_wishlist ?
                                                                        <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-heart-fill" fill={context.theme_settings ? context.theme_settings.accent_color.value : ''} xmlns="http://www.w3.org/2000/svg">
                                                                            <path fillRule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z" />
                                                                        </svg> :
                                                                        <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-heart" fill={context.theme_settings ? context.theme_settings.accent_color.value : ''} xmlns="http://www.w3.org/2000/svg">
                                                                            <path fillRule="evenodd" d="M8 2.748l-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z" />
                                                                        </svg>}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    }
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                {this.pwpView()}
                                            </div>
                                            <InformationTabs
                                                type={this.state.config.type}
                                                bundlings={this.state.bundlings}
                                                productDetail={this.state.detail}
                                            />
                                        </div>
                                    </>}

                                {(this.state.config.show_related_product && this.state.related.length > 0) &&
                                    <div className="pdg-dwa mt-4">
                                        <div className="d-flex align-items-end justify-content-between">
                                            <p className="m-0 font-weight-semi-bold  color-333333">{t('product_detail.more_from_this_seller')}</p>
                                            {/* <a href="#" className="m-0 font-weight-semi-bold  accent-color text-decoration-none">{t('product_detail.see_more')}</a> */}
                                        </div>
                                        <div style={{ margin: '0 -0.5rem' }}>
                                            <Carousel responsive={this.responsive} itemClass="px-2 place-self-center">
                                                {this.state.related.map((value, index) => (
                                                    <Link to={EcommerceRoutePath.PRODUCT_DETAIL.replace(":seller_slug", value.mp_seller.slug).replace(":product_slug", value.slug)} className="text-decoration-none" key={value.id}>
                                                        <div className="py-2">
                                                            <div className="bg-white shadow-graph position-relative rounded p-2">
                                                                <CustomImage folder={PublicStorageFolderPath.products} filename={value.mp_product_images[0].filename} alt={value.mp_product_images[0].filename} className="w-100 object-fit-contain product-carousel-image" style={{ minHeight: '13rem' }} />
                                                                <TextTruncate lineClamp={2} className="m-0  font-weight-semi-bold"><ManualSwitchLanguage data={value.mp_product_informations} langAttr={"language_code"} valueAttr={"name"} /></TextTruncate>
                                                                {value.is_sale_price &&
                                                                    <div className="d-flex align-items-center">
                                                                        <span className="bgc-accent-color  rounded px-1">{PriceRatio(value.mp_product_skus.find(value1 => value1.is_main).normal_price, value.mp_product_skus.find(value1 => value1.is_main).price)}</span>
                                                                        <span className="color-374650 px-1"><del>Rp. {CurrencyFormat(value.mp_product_skus.find(value1 => value1.is_main).normal_price)}</del></span>
                                                                    </div>}
                                                                <p className="m-0  color-374650 font-weight-bold">Rp. {CurrencyFormat(value.mp_product_skus.find(value1 => value1.is_main).price)}</p>
                                                                <p
                                                                    className="m-0  color-374650"
                                                                    onMouseOver={event => {
                                                                        event.currentTarget.textContent = value.mp_seller.name
                                                                    }}
                                                                    onMouseOut={event => event.currentTarget.textContent = value.mp_seller.city}
                                                                >{value.mp_seller.city}</p>
                                                                <div className="d-flex align-items-center">
                                                                    <>
                                                                        <i className="far fa-star  accent-color" />
                                                                        <span className=" color-374650 mt-1 ml-1">{value.rating ? value.rating : "-"}</span>
                                                                        <span className=" color-374650 mt-1 ml-1">|</span>
                                                                    </>
                                                                    <span className=" color-374650 mt-1 ml-1">{t('product_detail.sold')} {value.sold_product}</span>
                                                                </div>
                                                                <div className="position-absolute pointer" style={{ right: '0.5rem', bottom: 0 }} onClick={event => this.addWishlist(value.id, !value.mp_wishlist)}>
                                                                    {value.mp_wishlist ?
                                                                        <svg width="28px" height="28px" viewBox="0 0 16 16" className="bi bi-heart-fill" fill={context.theme_settings ? context.theme_settings.accent_color.value : ''} xmlns="http://www.w3.org/2000/svg">
                                                                            <path fillRule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z" />
                                                                        </svg> :
                                                                        <svg width="28px" height="28px" viewBox="0 0 16 16" className="bi bi-heart" fill={context.theme_settings ? context.theme_settings.accent_color.value : ''} xmlns="http://www.w3.org/2000/svg">
                                                                            <path fillRule="evenodd" d="M8 2.748l-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z" />
                                                                        </svg>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </Carousel>
                                        </div>
                                    </div>}

                                {this.state.isNotFound &&
                                    <h3 className="m-0 font-weight-semi-bold color-374650">Not Found</h3>}
                            </div>
                        }

                        {this.state.config.type === 'type_2' &&
                            <div id={"product-detail"} className="my-0 my-sm-0 my-md-3 my-lg-4 my-xl-4">
                                {!IsEmpty(this.state.detail) &&
                                    <>
                                        <div className="row">
                                            <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4">
                                                <div className="product-preview-image">
                                                    <div><CustomImageZoom folder={PublicStorageFolderPath.products} filename={this.state.currentImagePreview} height={this.state.imgPreviewSize} /></div>
                                                </div>
                                                <div className="d-block d-sm-block d-md-none d-lg-none d-xl-none my-3 pdg-dwa">
                                                    <div className="overflow-auto" style={{ margin: '0 -0.5rem' }}>
                                                        {this.state.detail.mp_product_images.map(value => (
                                                            <a href="#" className="text-decoration-none px-2" onClick={event => {
                                                                event.preventDefault();
                                                                this.setState({
                                                                    currentImagePreview: value.filename
                                                                });
                                                            }}>
                                                                <CustomImage folder={PublicStorageFolderPath.products} filename={value.filename} alt={value.filename} className={`object-fit-contain rounded ${this.state.currentImagePreview == value.filename ? "border-accent-color" : "border-DCDCDC"} `} style={{ width: 80, height: 80 }} />
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="mt-3">
                                                    <div className="d-none d-sm-none d-md-block d-lg-block d-xl-block">
                                                        <div className="overflow-auto" style={{ margin: '0 -0.5rem' }}>
                                                            {this.state.detail.mp_product_images.map(value => (
                                                                <a href="#" className="text-decoration-none px-2" onClick={event => {
                                                                    event.preventDefault();
                                                                    this.setState({
                                                                        currentImagePreview: value.filename
                                                                    });
                                                                }}>
                                                                    <CustomImage folder={PublicStorageFolderPath.products} filename={value.filename} alt={value.filename} className={`object-fit-contain rounded ${this.state.currentImagePreview == value.filename ? "border-accent-color" : "border-DCDCDC"} `} style={{ width: 80, height: 80 }} />
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
                                                            <ManualSwitchLanguage data={this.state.detail.mp_product_informations} langAttr={"language_code"} valueAttr={"name"} />
                                                        </h5>
                                                        <p className="mb-2 color-858585 "><span><i className="fa fa-check-circle mt-2 accent-color" style={{ fontSize: 20 }} /></span> {this.state.detail.mp_seller.name} | {this.state.config.show_unit_sold && <>{t('product_detail.sold')} {this.state.detail.sold_product} |</>} {this.state.config.show_rating && <><i className="far fa-star accent-color" /> {t('product_detail.rating')} {this.state.detail.rating ? this.state.detail.rating : "-"} ({this.state.detail.mp_product_ratings.length} {t('product_detail.reviews')})</>}</p>
                                                        {this.state.detail?.type !== "auction" ?
                                                            <div className="price d-flex align-items-center">
                                                                {this.state.detail.is_sale_price &&
                                                                    <span className="ml  bgc-accent-color px-2 mr-3 font-size-90-percent rounded">{PriceRatio(this.state.currentVariant.normal_price, this.state.currentVariant.price)}</span>}
                                                                {this.state.detail.is_sale_price &&
                                                                    <div className="d-flex align-items-center">
                                                                        <p className="mb-0 mr-3 color-292929 font-size-90-percent"><del>Rp {CurrencyFormat(this.state.currentVariant.normal_price)}</del></p>
                                                                    </div>}
                                                                <h4 className="m-0 mr-3 color-292929 font-weight-bold">Rp {CurrencyFormat(this.state.currentVariant.price)}</h4>
                                                            </div>
                                                            :
                                                            <>
                                                                <div className='d-flex align-items-center'>
                                                                    <p className='body'>
                                                                        Penawaran Tertinggi :
                                                                    </p>
                                                                    <p className='font-weight-bold accent-color ml-1'>
                                                                        Rp {CurrencyFormat2(this.state.auction?.highest_bidder[0]?.bid_price)}
                                                                    </p>
                                                                </div>
                                                                <div className='d-flex align-items-center my-2'>
                                                                    <p className='body'>
                                                                        Penawaran Awal:
                                                                    </p>
                                                                    <p className='font-weight-bold ml-1 '>
                                                                        Rp {CurrencyFormat2(this.state.detail?.mp_product_skus[0]?.price)}
                                                                    </p>
                                                                    <p className='body ml-3'>
                                                                        Harga Toko:
                                                                    </p>
                                                                    <p className='font-weight-bold ml-1'>
                                                                        Rp {CurrencyFormat2(this.state.detail?.mp_product_skus[0]?.normal_price)}
                                                                    </p>
                                                                </div>
                                                                <div className='d-flex align-items-center'>
                                                                    <p className='body'>
                                                                        Kategori:
                                                                    </p>
                                                                    {this.state.detail?.mp_category !== null ?
                                                                        <p className='font-weight-bold accent-color ml-1'>
                                                                            {this.state.detail?.mp_category.name}
                                                                        </p>
                                                                        :
                                                                        <p className='font-weight-bold accent-color ml-1 mt-1'>
                                                                            -
                                                                        </p>
                                                                    }
                                                                    <p className='body ml-3'>
                                                                        Label:
                                                                    </p>
                                                                    {this.state.detail?.mp_product_labels.map((label) => (
                                                                        <p className='font-weight-bold accent-color ml-1' >
                                                                            {label?.mp_label?.name}
                                                                        </p>
                                                                    ))}
                                                                </div>
                                                            </>
                                                        }
                                                    </div>
                                                    <div className="pb-4 border-bottom">
                                                        <div className="mt-3">
                                                            <p className="m-0 mb-2 color-292929  font-weight-semi-bold">{t('product_detail.delivery')}</p>
                                                            <p className="">{t('product_detail.delivery_from')}: {this.state.detail.mp_seller.city}</p>
                                                        </div>
                                                    </div>
                                                    <div className="pb-4 border-bottom">
                                                        {!IsEmpty(this.arrayUnique(this.state.detail.mp_product_variants, 'name')) ?
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
                                                    {/* this.state.detail?.mp_product_auction_bid !== null && */}
                                                    {
                                                        (this.state.detail?.type === "auction") ?
                                                            <AuctionConditions
                                                                data={this.state.detail}
                                                                getProductDetail={this.getProductDetail}
                                                                auction={this.state.auction}
                                                            />
                                                            :
                                                            <div className="mt-3">
                                                                <div className="row no-gutters">
                                                                    <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                                                                        <p className="m-0 color-292929 font-weight-semi-bold">{t('product_detail.total_product')}</p>
                                                                        <div className="color-292929">{this.buyAtLeastQtyForPwp()}</div>
                                                                        <CartQuantity
                                                                            type={this.state.config.type}
                                                                            stock={this.state.currentVariant.stock}
                                                                            maxOrder={this.state.detail.max_order}
                                                                            onChange={this.cartQuantityOnChange}
                                                                        />
                                                                        <div className="">{t('cart.total_price')}: Rp {CurrencyFormat(this.state.currentVariant.price * this.state.cartQty)}</div>
                                                                    </div>
                                                                    <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                                                                        <div className="btn btn-block border-accent-color accent-color mt-2 mt-sm-2 mt-md-2 mt-lg-0 mt-xl-0" onClick={event => this.addWishlist(this.state.detail.id, !this.state.detail.mp_wishlist)}>{this.state.detail.mp_wishlist ? t('cart.remove_from_wishlist') : t('cart.add_to_wishlist')}</div>
                                                                        <div className="btn btn-block bgc-accent-color " onClick={this.handleAddToCart}>{t('product_detail.add_to_cart')}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                    }
                                                    {this.state.detail.is_private === true &&
                                                        <div className="row no-gutters justify-content-end ">
                                                            <Countdown date={this.state.detail.valid_private_product}
                                                                renderer={
                                                                    ({ days, hours, minutes, seconds }) => (
                                                                        <div className='shadow-graph bg-white rounded p-2'>
                                                                            <p className='text-center small'>Dipublikasikan pada umum dalam:</p>
                                                                            <div className='d-flex text-danger align-items-center justify-content-center '>
                                                                                <p className='small'>
                                                                                    <strong className='h6 font-weight-bold'>{days}</strong>
                                                                                    hari
                                                                                </p>
                                                                                <p>|</p>
                                                                                <p className='small'>
                                                                                    <strong className='h6 font-weight-bold'>{hours}</strong>
                                                                                    jam
                                                                                </p>
                                                                                <p>|</p>
                                                                                <p className='small'>
                                                                                    <strong className='h6 font-weight-bold'>{minutes}</strong>
                                                                                    menit
                                                                                </p>
                                                                                <p>|</p>
                                                                                <p className='small'>
                                                                                    <strong className='h6 font-weight-bold'>{seconds}</strong>
                                                                                    detik
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        <div className="pdg-dwa mt-4">
                                            {this.pwpView()}
                                        </div>
                                        <div className="pdg-dwa mt-4">
                                            <div className="brand bg-white shadow-graph rounded p-4 mt-3">
                                                <div className="row">
                                                    <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                                                        <div className="py-2">
                                                            <div className="row no-gutters">
                                                                <div className="col-3 pr-2">
                                                                    <Link to={EcommerceRoutePath.SELLER.replace(":seller_slug", this.state.detail.mp_seller.slug)} className="text-decoration-none">
                                                                        <CustomImage folder={PublicStorageFolderPath.seller} filename={this.state.detail.mp_seller.logo} alt={this.state.detail.mp_seller.logo} className="object-fit-contain rounded-circle seller-image" />
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
                                            <InformationTabs
                                                type={this.state.config.type}
                                                bundlings={this.state.bundlings}
                                                productDetail={this.state.detail}
                                            />
                                        </div>
                                    </>}

                                {(this.state.config.show_related_product && this.state.related.length > 0) &&
                                    <div className="pdg-dwa mt-4">
                                        <div className="d-flex align-items-end justify-content-between">
                                            <p className="m-0 font-weight-semi-bold  color-333333">{t('product_detail.more_from_this_seller')}</p>
                                            {/* <a href="#" className="m-0 font-weight-semi-bold  accent-color text-decoration-none">{t('product_detail.see_more')}</a> */}
                                        </div>
                                        <div style={{ margin: '0 -0.5rem' }}>
                                            <Carousel responsive={this.responsive} itemClass="px-2 place-self-center">
                                                {this.state.related.map((value, index) => (
                                                    <Link to={EcommerceRoutePath.PRODUCT_DETAIL.replace(":seller_slug", value.mp_seller.slug).replace(":product_slug", value.slug)} className="text-decoration-none" key={value.id}>
                                                        <div className="py-2">
                                                            <div className="bg-white shadow-graph position-relative rounded p-2 product-cart">
                                                                <CustomImage folder={PublicStorageFolderPath.products} filename={value.mp_product_images[0].filename} alt={value.mp_product_images[0].filename} className="w-100 object-fit-contain product-carousel-image" />
                                                                <TextTruncate lineClamp={2} className="m-0"><ManualSwitchLanguage data={value.mp_product_informations} langAttr={"language_code"} valueAttr={"name"} /></TextTruncate>
                                                                <div className="d-flex align-items-center">
                                                                    <img src={`/images/seller-icon.png`} className="mr-2" style={{ height: 20 }} />
                                                                    <p
                                                                        className="m-0 font-size-80-percent color-374650"
                                                                        onMouseOver={event => {
                                                                            event.currentTarget.textContent = value.mp_seller.name
                                                                        }}
                                                                        onMouseOut={event => event.currentTarget.textContent = value.mp_seller.city}
                                                                    >{value.mp_seller.city}</p>
                                                                </div>
                                                                {value.is_sale_price &&
                                                                    <div className="d-flex align-items-center mt-2">
                                                                        <span className="font-size-80-percent bgc-accent-color  rounded px-1">{PriceRatio(value.mp_product_skus.find(value1 => value1.is_main).normal_price, value.mp_product_skus.find(value1 => value1.is_main).price)}</span>
                                                                        <span className="font-size-80-percent color-374650 px-1"><del>Rp. {CurrencyFormat(value.mp_product_skus.find(value1 => value1.is_main).normal_price)}</del></span>
                                                                    </div>}
                                                                <p className="m-0 color-374650 font-weight-bold">Rp. {CurrencyFormat(value.mp_product_skus.find(value1 => value1.is_main).price)}</p>
                                                                <div className="d-flex align-items-center">
                                                                    <i className="far fa-star accent-color mt-1" />
                                                                    <span className="font-size-80-percent color-374650 mt-1 ml-1">{value.rating ? value.rating : "-"}</span>
                                                                    <span className="font-size-80-percent color-374650 mt-1 ml-1">|</span>
                                                                    <span className="font-size-80-percent color-374650 mt-1 ml-1">{t('product_detail.sold')} {value.sold_product}</span>
                                                                </div>
                                                                {/* <div className="position-absolute pointer" style={{right: '0.5rem', bottom: 0}} onClick={event => this.addWishlist(value.id, !value.mp_wishlist)}>
                                                                {value.mp_wishlist ?
                                                                    <svg width="28px" height="28px" viewBox="0 0 16 16" className="bi bi-heart-fill" fill={context.theme_settings ? context.theme_settings.accent_color.value : ''} xmlns="http://www.w3.org/2000/svg">
                                                                        <path fillRule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z" />
                                                                    </svg> :
                                                                    <svg width="28px" height="28px" viewBox="0 0 16 16" className="bi bi-heart" fill={context.theme_settings ? context.theme_settings.accent_color.value : ''} xmlns="http://www.w3.org/2000/svg">
                                                                        <path fillRule="evenodd" d="M8 2.748l-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z" />
                                                                    </svg>}
                                                            </div> */}
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </Carousel>
                                        </div>
                                    </div>}

                                {this.state.isNotFound &&
                                    <h3 className="m-0 font-weight-semi-bold color-374650">Not Found</h3>}
                            </div>
                        }

                        <Modal size="lg" centered show={this.state.pwp_modal_open} onHide={() => { this.setState({ pwp_modal_open: false }) }}>
                            <Modal.Header className="d-flex" closeButton>
                                <Modal.Title className="font-weight-bold color-5F6C73 d-flex">{t('product_detail.pwp_discount')}</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                {this.state.pwp && <PwpConditions data={this.state.pwp} />}
                            </Modal.Body>
                        </Modal>

                        <Modal size="xl" centered show={this.state.other_product_modal_open} onHide={this.closeOtherProductModal}>
                            <Modal.Header className="d-flex" closeButton>
                                <Modal.Title className="font-weight-bold color-5F6C73 d-flex">{t('product_detail.choose_product')}</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                {this.state.other_product_modal_data && <OtherProduct
                                    config={this.state.config}
                                    data={this.state.other_product_modal_data}
                                    t={t}
                                />}
                            </Modal.Body>
                        </Modal>
                    </>}
                </>)}</MyContext.Consumer>

            </Template>
        );
    }
}

export default withTranslation()(ProductDetail);