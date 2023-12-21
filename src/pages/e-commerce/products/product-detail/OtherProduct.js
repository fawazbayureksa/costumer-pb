import CurrencyFormat, { CurrencyFormat2 } from "../../../../components/helpers/CurrencyFormat";
import IsEmpty from "../../../../components/helpers/IsEmpty";
import ManualSwitchLanguage from "../../../../components/helpers/ManualSwitchLanguage";
import PriceRatio from "../../../../components/helpers/PriceRatio";
import Select from 'react-select'
import { Link } from "react-router-dom";
import EcommerceRoutePath from "../../EcommerceRoutePath";
import { PureComponent } from "react";
import axios from "axios";
import Config from "../../../../components/axios/Config";
import SwalToast from "../../../../components/helpers/SwalToast";
import Cookie from 'js-cookie'
import CartQuantity from "./CartQuantity";
import CustomImage, { PublicStorageFolderPath } from "../../../../components/helpers/CustomImage";

/**
 * 
 * @param {object} config config
 * @param {object} data product data
 * @param {object} t translation props
 * @returns 
 */
class OtherProduct extends PureComponent{
    constructor(props) {
        super(props);
        this.state = {
            currentImagePreview: this.props.data.mp_product.mp_product_images[0].filename,
            detail: this.props.data.mp_product,
            currentVariant: this.props.data.mp_product.mp_product_skus.find(value => value.is_main === true),
            cartQty: 1,
            variantSelected: {},
            variantSelectedStatus: '',
        };
    }

    arrayUnique = (arrayJson, prop) => {
        return arrayJson.filter((obj, pos, arr) => {
            return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
        });
    }

    chooseVariant = (level1, level2) => {
        console.log('lv1', level1.name)
        console.log('lv2', level2)
        let temp_variantSelected = {...this.state.variantSelected};
        temp_variantSelected[level1.name.replace(' ', '_')] = level2;
        this.setState({
            variantSelected: {...temp_variantSelected}
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

    handleAddToCart = () => {
        const {t} = this.props;        
        if(!Cookie.get('token')){
            SwalToast.fire({icon: 'info',title: t('product_detail.do_login_first')});
            return
        }

        if (this.checkVariantSelected()) {
            this.setState({
                variantSelectedStatus: ''
            }, () => {
                if (parseInt(this.state.cartQty) < parseInt(this.state.currentVariant.stock)) {
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
                        if(error.response && error.response.data){
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

    cartQuantityOnChange=(cartQty)=>{
        this.setState({cartQty: cartQty})
    }

    render(){
    const {t} = this.props
    if(!this.props.config) return null
    else if (this.props.config.type === "type_1") return (<>
        <div className="row">
            <div className="col-12 col-sm-12 col-md-12 col-lg-4 col-xl-4">
                <div className="product-preview-image">
                    <CustomImage folder={PublicStorageFolderPath.products} filename={this.state.currentImagePreview} alt={this.state.currentImagePreview} className="object-fit-cover" style={{maxWidth: '100%'}}/>
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
                                <CustomImage folder={PublicStorageFolderPath.products} filename={value.filename} alt={value.filename} className="object-fit-cover" style={{width: 80, height: 80}}/>
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
                    <p className="mb-2 color-858585 font-size-60-percent">{this.props.config.show_unit_sold && <>{t('product_detail.sold')} {this.state.detail.sold_product} |</>} {this.props.config.show_rating && <><i className="far fa-star accent-color" /> {t('product_detail.rating')} {this.state.detail.rating} (3 {t('product_detail.reviews')}) |</>} {t('product_detail.discussion')} (1)</p>
                    <div className="price d-flex align-items-end">
                        <h4 className="m-0 color-292929 font-weight-bold">Rp {CurrencyFormat(this.state.currentVariant.price * this.state.cartQty)}</h4>
                        {parseInt(this.state.currentVariant.normal_price) > 0 &&
                            <div className="d-flex align-items-center">
                                <p className="mb-0 ml-3 color-292929 small"><del>Rp {CurrencyFormat(this.state.currentVariant.normal_price * this.state.cartQty)}</del></p>
                                <span className="ml-1  bgc-accent-color font-size-60-percent px-1">{PriceRatio(this.state.currentVariant.normal_price, this.state.currentVariant.price)}</span>
                            </div>}
                    </div>
                    {!IsEmpty(this.arrayUnique(this.state.detail.mp_product_variants, 'name')) && <div className="variant mt-3">
                        <p className="m-0 color-292929 font-size-70-percent font-weight-semi-bold">{t('product_detail.choose_variant')}</p>
                        <div className="row">
                            <div className="col-12 col-sm-12 col-md-5 col-lg-5 col-xl-5">
                                {this.arrayUnique(this.state.detail.mp_product_variants, 'name').map(value => (
                                    <div className="row no-gutters mt-2">
                                        <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 d-flex align-items-center pr-0 pr-sm-0 pr-md-1 pr-lg-1 pr-xl-1">
                                            <p className="m-0 color-292929 font-size-70-percent">{value.name}</p>
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
                                                <CustomImage folder={PublicStorageFolderPath.seller} filename={this.state.detail.mp_seller.logo} alt={this.state.detail.mp_seller.logo} className="w-100 object-fit-cover" style={{maxWidth: 50}}/>
                                            </Link>
                                        </div>
                                        <div className="col-9 d-flex align-items-center">
                                            <div>
                                                <Link to={EcommerceRoutePath.SELLER.replace(":seller_slug", this.state.detail.mp_seller.slug)} className="text-decoration-none">
                                                    <p className="m-0 color-292929 font-size-70-percent font-weight-bold">{this.state.detail.mp_seller.name}</p>
                                                </Link>
                                                <p className="m-0 color-858585 font-size-60-percent"><i className="far fa-star accent-color" /> 5.0 {this.props.config.show_seller_location && <>| {this.state.detail.mp_seller.city}</>}</p>
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
        <div className="row">
            <div className="col-12 col-sm-12 col-md-12 col-lg-4 col-xl-4">
                <div className="d-none d-sm-none d-md-block d-lg-block d-xl-block">
                    <div className="overflow-auto" style={{margin: '0 -0.5rem'}}>
                        {this.state.detail.mp_product_images.map(value => (
                            <a href="#" className="text-decoration-none px-2" onClick={event => {
                                event.preventDefault();
                                this.setState({
                                    currentImagePreview: value.filename
                                });
                            }}>    
                                <CustomImage folder={PublicStorageFolderPath.products} filename={value.filename} alt={value.filename} className="object-fit-cover" style={{width: 80, height: 80}}/>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
            <div className="col-12 col-sm-12 col-md-8 col-lg-8 col-xl-8">
                <div className="payment">
                    <div className="quantity d-flex align-items-center">
                        <CartQuantity
                            type={this.props.config.type}
                            stock={this.state.currentVariant.stock}
                            maxOrder={this.state.detail.max_order}
                            onChange={this.cartQuantityOnChange}
                        />
                        <button className="btn btn-sm  bgc-accent-color px-4 py-2 ml-3" onClick={this.handleAddToCart}>
                            <div className="d-flex align-items-center">
                                <svg className="bi bi-cart3" width="1rem" height="1rem" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .49.598l-1 5a.5.5 0 0 1-.465.401l-9.397.472L4.415 11H13a.5.5 0 0 1 0 1H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l.84 4.479 9.144-.459L13.89 4H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm7 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
                                </svg>
                                <p className="mb-0 ml-3" style={{fontWeight: 'normal'}}>{t('product_detail.add_to_cart')}</p>
                            </div>
                        </button>
                        <Link to={EcommerceRoutePath.PRODUCT_DETAIL.replace(":seller_slug", this.state.detail.mp_seller.slug).replace(":product_slug", this.state.detail.slug)} className="btn border-accent-color accent-color ml-2">                                
                            {t('product_detail.view_product_page')}
                        </Link>  
                    </div>
                </div>
            </div>
        </div>
    </>)
    else if (this.props.config.type === "type_2") return (
        <div className="row">
            <div className="col-12 col-sm-12 col-md-12 col-lg-4 col-xl-4">
                <div className="product-preview-image">                    
                    <CustomImage folder={PublicStorageFolderPath.products} filename={this.state.currentImagePreview} alt={this.state.currentImagePreview} className="object-fit-cover" style={{maxWidth: '100%'}}/>
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
                                <CustomImage folder={PublicStorageFolderPath.products} filename={value.filename} alt={value.filename} className="object-fit-cover" style={{ width: 80, height: 80 }}/>
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
                                    <CustomImage folder={PublicStorageFolderPath.products} filename={value.filename} alt={value.filename} className="object-fit-cover" style={{ width: 80, height: 80 }}/>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-12 col-sm-12 col-md-12 col-lg-8 col-xl-8">
                <div className="pdg-dwa shadow-graph bg-white rounded p-4">
                    <div className="pb-4 border-bottom">
                        <h5 className="m-0 color-292929">
                            <ManualSwitchLanguage data={this.state.detail.mp_product_informations} langAttr={"language_code"} valueAttr={"name"} />
                        </h5>
                        <p className="mb-2 color-858585 font-size-60-percent"><span><i className="fa fa-check-circle mt-2 accent-color" style={{ fontSize: 20 }} /></span> {this.state.detail.mp_seller.name} | {this.props.config.show_unit_sold && <>{t('product_detail.sold')} {this.state.detail.sold_product} |</>} {this.props.config.show_rating && <><i className="far fa-star accent-color" /> {t('product_detail.rating')} {this.state.detail.rating} (3 {t('product_detail.reviews')})</>}</p>
                        <div className="price d-flex align-items-end">
                            {parseInt(this.state.currentVariant.normal_price) > 0 &&
                                <span className="ml  bgc-accent-color font-size-60-percent px-2 rounded">{PriceRatio(this.state.currentVariant.normal_price, this.state.currentVariant.price)}</span>}
                            {parseInt(this.state.currentVariant.normal_price) > 0 &&
                                <div className="d-flex align-items-center">
                                    <p className="mb-0 ml-3 color-292929 small"><del>Rp {CurrencyFormat(this.state.currentVariant.normal_price)}</del></p>
                                </div>}
                            <h4 className="m-0 ml-3 color-292929 font-weight-bold">Rp {CurrencyFormat(this.state.currentVariant.price)}</h4>
                        </div>
                    </div>
                    <div className="pb-4 border-bottom">
                        <div className="mt-3">
                            <p className="m-0 mb-2 color-292929 font-size-70-percent font-weight-semi-bold">{t('product_detail.delivery')}</p>
                            <p className="font-size-60-percent">{t('product_detail.delivery_from')}: {this.state.detail.mp_seller.city}</p>
                            {/* <p className="font-size-60-percent">Oleh: </p> */}
                        </div>
                    </div>
                    <div className={`${!IsEmpty(this.arrayUnique(this.state.detail.mp_product_variants, 'name')) && "pb-4 border-bottom"}`}>
                        {!IsEmpty(this.arrayUnique(this.state.detail.mp_product_variants, 'name')) &&
                            <div className="variant mt-3">
                                <p className="m-0 color-292929 font-size-70-percent font-weight-semi-bold">{t('product_detail.choose_variant')}</p>
                                <div className="row">
                                    <div className="col-12 col-sm-12 col-md-5 col-lg-5 col-xl-5">
                                        {this.arrayUnique(this.state.detail.mp_product_variants, 'name').map(value => (
                                            <div className="mt-2">
                                                <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 d-flex align-items-center pr-0 pr-sm-0 pr-md-1 pr-lg-1 pr-xl-1">
                                                    <p className="m-0 color-292929 font-size-70-percent">{value.name}</p>
                                                </div>
                                                <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 ">
                                                    <div className="row no-gutters mt-1">
                                                        {this.arrayUnique(value.mp_product_sku_variant_options, 'name').map(value1 =>
                                                            <div className={`mr-3 px-2 px-1 rounded font-size-70-percent ${this.state[`variantOption${value.id}`] && (this.state[`variantOption${value.id}`]).value == value1.id ? "accent-color border-accent-color font-weight-bold" : "color-292929 border-292929"}`}
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
                            </div>}
                    </div>
                    <div className="mt-3">
                        <div className="row no-gutters">
                            <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                                <p className="m-0 color-292929 font-size-70-percent font-weight-semi-bold">{t('product_detail.total_product')}</p>
                                <CartQuantity
                                    type={this.props.config.type}
                                    stock={this.state.currentVariant.stock}
                                    maxOrder={this.state.detail.max_order}
                                    onChange={this.cartQuantityOnChange}
                                />
                                <div className="font-size-60-percent">{t('cart.total_price')}: Rp {CurrencyFormat(this.state.currentVariant.price * this.state.cartQty)}</div>
                            </div>
                            <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                                <Link to={EcommerceRoutePath.PRODUCT_DETAIL.replace(":seller_slug", this.state.detail.mp_seller.slug).replace(":product_slug", this.state.detail.slug)} className="btn btn-block border-accent-color accent-color">                                
                                    {t('product_detail.view_product_page')}
                                </Link>                                
                                <div className="btn btn-block bgc-accent-color " onClick={this.handleAddToCart}>{t('product_detail.add_to_cart')}</div>
                            </div>
                        </div>                        
                    </div>
                </div>
            </div>
        </div>
    )                        
    else return null
    }
}

export default OtherProduct;