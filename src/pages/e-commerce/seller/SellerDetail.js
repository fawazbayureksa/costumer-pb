import React, { PureComponent } from 'react';
import Template from "../../../components/Template";
import ManualSwitchLanguage from "../../../components/helpers/ManualSwitchLanguage";
import { withTranslation } from "react-i18next";
import axios from "axios";
import Config from "../../../components/axios/Config";
import IsEmpty from "../../../components/helpers/IsEmpty";
import MyContext from "../../../components/MyContext";
import $ from "jquery";
import Cookie from "js-cookie";
import SellerProduct from './SellerProduct';
import update from "immutability-helper";
import SellerInformation from './SellerInformation';
import SwalToast from "../../../components/helpers/SwalToast";
import AuthRoutePath from '../../auth/AuthRoutePath';
import EcommerceRoutePath from '../EcommerceRoutePath';
import { Link } from 'react-router-dom';
import CustomImage, { PublicStorageFolderPath } from '../../../components/helpers/CustomImage';
import AllThread from '../customer/profil-customer/AllThread';
import { isLogin } from '../../general/forum/components/IsLogin';
import MetaTrigger from '../../../components/MetaTrigger';

const Style = props => {
    if (props.themes) {
        return (
            <style>{`
                #seller-detail {
                    max-width: ${props.themes.site_width.width};
                    margin: 0 auto;
                }
                .container-xsdcn-content{
                    display: flex;
                }
                .cover-seller {
                    min-height: 17rem;
                }
                .cover-seller img {
                    height: 17rem;
                }
                .seller-header {
                    display: flex;
                }
                .seller-header-parent {
                    height: 17rem;
                    padding: 16px;
                }
                .image-square{
                    background-color: transparent;
                    border-radius: 4px;
                    width: 120px;
                    height: 120px;
                    margin-top: -80px;
                }
                .image-square>img{
                    border-radius: 4px;
                    width: 120px;
                    height: 120px;
                    background-color: white;
                }
                .image-square-2{
                    background-color: transparent;
                    width: 100px;
                    height: 100px;
                }
                .image-square-2>img{
                    width: 100px;
                    height: 100px;
                    background-color: white;
                }
                .select{
                    display: block;
                    width: 100%;
                    height: calc(1.5em + .75rem + 2px);
                    padding: .375rem .75rem;
                    font-size: 1rem;
                    font-weight: 400;
                    line-height: 1.5;
                    color: #495057;
                }
                @media only screen and (max-width: 767.98px) {
                    .seller-header {
                        display: block;
                        margin-right: -15px;
                        margin-left: -15px;
                    }
                    .seller-header-parent {
                        height: 24rem;
                        padding: 16px;
                    }
                    .image-square-2{
                        background-color: transparent;
                        width: 60px;
                        height: 60px;
                    }
                    .image-square-2>img{
                        width: 60px;
                        height: 60px;
                        background-color: white;
                    }
                }
            `}</style>
        );
    } else return null;
}

class SellerDetail extends PureComponent {
    constructor(props) {
        super(props);
        this.tab = {
            first: 'products',
        };
        this.state = {
            currentTab: this.tab.first,
            currentLabel: "all",
            per_page: 10,
            current_page: 1,
            last_page: 1,
            search: "",
            seller_data: null,
            seller_slug: "",
            seller_cover: "",
            seller_logo: "",
            seller_name: "",
            seller_city: "",
            seller_sold_product: 0,
            seller_rating: 0,
            seller_review: 0,
            seller_informations: [],
            seller_banners: [],
            seller_labels: [],
            seller_products: [],
            labelOptions: [],

            chatPath: {
                pathname: EcommerceRoutePath.CHAT,
            },
        }
    }

    componentDidMount = () => {
        this.getMasterData();
        this.getSeller();
        this.getProduct();
    }

    getMasterData = () => {
        axios.get(`${process.env.REACT_APP_BASE_API_URL}ecommerce/seller/getMasterData`, Config()).then(response => {
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

    getSeller = () => {

        let url = `${process.env.REACT_APP_BASE_API_URL}ecommerce/seller/find?seller_slug=${this.props.match.params.seller_slug}`

        let axiosInstance = axios.get(url, Config());

        if (isLogin()) {
            axiosInstance = axios.get(url, Config({ Authorization: `Bearer ${Cookie.get('token')}` }))
        }

        axiosInstance.then(response => {
            console.log(response.data.data)
            let labelOptions = [{ label: "All", value: "all" }]
            let informations = []
            let informations1 = []
            let informations2 = []
            let validate = false
            response.data.data.sellerData.informations.forEach(info => {
                if (info.language_code == Cookie.get('language_code')) {
                    validate = true
                    info.section = JSON.parse(info.section)
                    info.section.map((section, index) => {
                        informations1.push({
                            title: section.title,
                            content: section.content
                        })
                    })
                } else if (info.language_code == response.data.data.languageData.language_code) {
                    info.section = JSON.parse(info.section)
                    info.section.map((section, index) => {
                        informations2.push({
                            title: section.title,
                            content: section.content
                        })
                    })
                }
            });
            if (validate) informations = informations1
            else informations = informations2
            response.data.data.sellerData.labels.forEach((value =>
                labelOptions.push({ label: value.name, value: value.id })
            ))
            this.setState({
                seller_data: response.data.data.sellerData,
                seller_slug: response.data.data.sellerData.slug,
                seller_cover: response.data.data.sellerData.cover_picture,
                seller_logo: response.data.data.sellerData.logo,
                seller_name: response.data.data.sellerData.name,
                seller_city: response.data.data.sellerData.city,
                seller_sold_product: response.data.data.soldProduct || 0,
                seller_informations: informations,
                seller_banners: response.data.data.sellerData.banners,
                seller_follow: response.data.data.sellerData.follow,
                seller_labels: response.data.data.sellerData.labels,
                seller_follower: response.data.data.sellerFollower || 0,
                seller_rating: response.data.data.sellerRating || 0,
                seller_review: response.data.data.sellerReview || 0,
                seller_success_transaction: response.data.data.sellerSuccessTransaction || 0,
                seller_on_time_delivery: response.data.data.sellerOnTimeDelivery || 0,
                chatPath: {
                    pathname: EcommerceRoutePath.CHAT,
                    state: { user_id: response.data.data.sellerData.id, user_type: "seller" }
                },
                labelOptions: labelOptions
            });
        }).catch(error => {
            console.log(error);
            // this.setState({
            //     isNotFound: true
            // });
        }).finally(() => {
            //
        });
    }

    getProduct = () => {
        let params = {
            seller_slug: this.props.match.params.seller_slug,
            search: this.state.search || "",
            label: this.state.currentLabel == "all" ? 0 : this.state.currentLabel,
            order_column: this.state.sort ? this.state.sort.value : "",
            order_dir: 'asc',
            per_page: this.state.per_page,
            page: this.state.current_page,
        }
        axios.get(`${process.env.REACT_APP_BASE_API_URL}ecommerce/seller/product`,
            Config({}, params)
        ).then(response => {
            this.setState({
                seller_products: response.data.data.data,
                last_page: response.data.data.last_page
            });
        }).catch(error => {
            console.log(error);
            // this.setState({
            //     isNotFound: true
            // });
        }).finally(() => {
            //
        });
    }

    follow = () => {
        if (!isLogin()) {
            SwalToast.fire({
                icon: 'error',
                title: 'Login required!'
            });
            return
        }
        axios.post(`${process.env.REACT_APP_BASE_API_URL}ecommerce/seller/follow`, {
            mp_seller_id: this.state.seller_data.id,
            is_follow: this.state.seller_follow ? !this.state.seller_follow.is_follow : true
        }, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        })).then(response => {
            SwalToast.fire({
                icon: 'success',
                title: 'Successfully follow!'
            });
            this.getSeller()
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

    onSearchChange = value => {
        this.setState({
            search: value
        }, () => this.getProduct())
    }

    onLabelChange = value => {
        this.setState({
            currentLabel: value
        }, () => this.getProduct())
    }

    onSortChange = selectedOption => {
        this.setState({
            sort: selectedOption
        }, () => this.getProduct())
    }

    onPageChange = value => {
        this.setState({
            current_page: value
        }, () => this.getProduct())
    }

    addWishlist = (product_id, value) => {
        const { t } = this.props;
        if (Cookie.get('token')) {
            axios.post(`${process.env.REACT_APP_BASE_API_URL}my-wishlist/add`, {
                product_id: product_id
            }, Config({
                Authorization: `Bearer ${Cookie.get('token')}`
            })).then(response => {
                this.getProduct()
                SwalToast.fire({
                    icon: 'success',
                    title: value ? t('general.success_add_wishlist') : t('general.success_remove_wishlist')
                });
            }).catch(error => {
                SwalToast.fire({
                    icon: 'error',
                    title: 'Failed!'
                });
            }).finally(() => {
                //
            });
        } else {
            this.props.history.push({
                pathname: AuthRoutePath.LOGIN
            });
        }
    }

    render() {
        const { t } = this.props;
        return (
            <Template>
                {!IsEmpty(this.state.config) &&
                    <>
                        {this.state.config.type === 'type_1' &&
                            <MyContext.Consumer>{context => (
                                <div id="seller-detail" className="my-4">
                                    <MetaTrigger
                                        pageTitle={context.companyName ? `${context.companyName} - ${this.state.seller_name}` : ""}
                                        pageDesc={`Seller Detail`}
                                    />
                                    <Style themes={context.theme_settings} />
                                    {!IsEmpty(this.state.seller_data) &&
                                        <>
                                            <div className="container-xsdcn">
                                                <div className="data-image shadow-graph">
                                                    <div className="shimmer cover-seller">
                                                        <CustomImage folder={PublicStorageFolderPath.seller} filename={this.state.seller_cover} alt={this.state.seller_cover} className="w-100 object-fit-cover" />
                                                    </div>
                                                </div>
                                                <div className="seller-header-parent bgc-FFFFFF shadow-graph" style={{ marginTop: 1 }}>
                                                    <div className="image-square shimmer">
                                                        <CustomImage folder={PublicStorageFolderPath.seller} filename={this.state.seller_logo} alt={this.state.seller_logo} className="shadow-graph" />
                                                    </div>
                                                    <div className="seller-header justify-content-between mt-4">
                                                        <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4">
                                                            <div className="color-333333 title">{this.state.seller_name}</div>
                                                            <div className="color-5F6C73">{this.state.seller_city}</div>
                                                            {Cookie.get('token') && <div className="mt-2">
                                                                <Link className="color-EC9700" to={this.state.chatPath}>
                                                                    <button className="btn border-EC9700" style={{ width: 100 }}>{t('seller.chat')}</button>
                                                                </Link>
                                                            </div>}
                                                        </div>
                                                        <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 mt-2 mt-sm-2 mt-md-0 mt-lg-0 mt-xl-0">

                                                        </div>
                                                        <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 mt-2 mt-sm-2 mt-md-0 mt-lg-0 mt-xl-0">
                                                            <div className="mb-0 mb-sm-0 mb-md-2 mb-lg-2 mb-xl-2 color-5F6C73">{t('seller.sold')}</div>
                                                            <div>{this.state.seller_sold_product}</div>
                                                        </div>
                                                        <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 mt-2 mt-sm-2 mt-md-0 mt-lg-0 mt-xl-0">
                                                            <div className="mb-0 mb-sm-0 mb-md-2 mb-lg-2 mb-xl-2 color-5F6C73">{t('seller.ratings')}</div>
                                                            <div>{this.state.seller_rating ? this.state.seller_rating : "-"} ({this.state.seller_review} {t('seller.review')})</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-3 font-weight-bold row">
                                                    <span
                                                        onClick={event => this.setState({ currentTab: this.tab.first })}
                                                        className={`${this.state.currentTab === this.tab.first ? 'color-EC9700 bgc-FAFAFB' : 'color-262626'} py-3 col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3`}
                                                        style={{ borderBottom: this.state.currentTab === this.tab.first ? '5px solid #EC9700' : null }}
                                                    >
                                                        {t("seller.products")}
                                                    </span>
                                                    {
                                                        this.state.seller_informations.map((info, index) => (
                                                            <span onClick={event => this.setState({ currentTab: index })} className={`${this.state.currentTab === index ? 'color-EC9700 bgc-FAFAFB' : 'color-262626'} py-3 col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3`} style={{ borderBottom: this.state.currentTab === index ? '5px solid #EC9700' : null }}>{info.title.length > 20 ? info.title.substring(0, 20) + "..." : info.title}</span>
                                                        ))
                                                    }
                                                </div>
                                                <div className="py-3 bgc-FAFAFB">
                                                    {
                                                        this.state.currentTab === this.tab.first ?
                                                            <SellerProduct parent={this} />
                                                            :
                                                            <SellerInformation parent={this}
                                                            />
                                                    }
                                                </div>
                                            </div>
                                        </>}
                                </div>
                            )}
                            </MyContext.Consumer>}
                        {this.state.config.type === 'type_2' &&
                            <MyContext.Consumer>{context => (
                                <div id="seller-detail" className="my-4">
                                    <MetaTrigger
                                        pageTitle={context.companyName ? `${context.companyName} - ${this.state.seller_name}` : ""}
                                        pageDesc={`Seller Detail`}
                                    />
                                    <Style themes={context.theme_settings} />
                                    {!IsEmpty(this.state.seller_data) &&
                                        <>
                                            <div className="container-xsdcn">
                                                <div className="data-image shadow-graph">
                                                    <div className="shimmer cover-seller">
                                                        <CustomImage folder={PublicStorageFolderPath.seller} filename={this.state.seller_cover} alt={this.state.seller_cover} className="w-100 object-fit-cover" />
                                                    </div>
                                                </div>
                                                <div className="seller-header-parent bgc-FFFFFF shadow-graph row" style={{ marginTop: 1 }}>
                                                    <div className="col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6">
                                                        <div className="d-flex">
                                                            <div className="image-square-2 shimmer">
                                                                <CustomImage folder={PublicStorageFolderPath.seller} filename={this.state.seller_logo} alt={this.state.seller_logo} className="shadow-graph rounded-circle" />
                                                            </div>
                                                            <div className="pl-4 d-flex align-items-center">
                                                                <div>
                                                                    <h6 className=" color-333333 font-weight-semi-bold">{this.state.seller_name}</h6>
                                                                    <p className="m-0 color-858585 "><i className="fa fa-map-marker accent-color mr-2" />{this.state.seller_city}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="row mt-3">
                                                            <div className="col-6">
                                                                <Link className="btn btn-block border-707070 shadow-graph color-707070 font-weight-bold" to={this.state.chatPath}>{t('seller.call')}</Link>
                                                            </div>
                                                            <div className="col-6">
                                                                <div className="btn btn-block bgc-accent-color shadow-graph  font-weight-bold" onClick={this.follow}>{this.state.seller_follow && this.state.seller_follow.is_follow ? t('seller.unfollow') : t('seller.follow')}</div>
                                                            </div>
                                                        </div>
                                                        {/* <label className="">{t('seller.reply_in')} -+4 menit</label> */}
                                                    </div>
                                                    <div className="col-12 col-sm-12 col-md-12 col-lg-4 col-xl-4">
                                                        <div className="row">
                                                            <div className="col-6 col-sm-6 col-md-6 col-lg-5 col-xl-5">
                                                                <div className=" text-center">{t('seller.product_review')}</div>
                                                                <div className="text-center">
                                                                    <div>
                                                                        <p className="d-flex justify-content-center font-weight-semi-bold"><label className="">{this.state.seller_rating}</label><label className=" d-flex align-items-end">/5</label></p>
                                                                        <p className=""><i className="fas fa-star color-FFB200" /><i className="fas fa-star color-FFB200" /><i className="fas fa-star color-FFB200" /><i className="fas fa-star color-FFB200" /><i className="fas fa-star color-FFB200" /></p>
                                                                    </div>
                                                                </div>
                                                                <div className=" text-center">({this.state.seller_review} {t('seller.review')})</div>
                                                            </div>
                                                            <div className="col-6 col-sm-6 col-md-6 col-lg-7 col-xl-7">
                                                                <div className=""><label className="font-weight-semi-bold">{this.state.seller_sold_product}</label> {t('seller.sold_product')}</div>
                                                                <div className=""><label className="font-weight-semi-bold">{this.state.seller_success_transaction > 0 ? `${this.state.seller_success_transaction}%` : "-"}</label> {t('seller.transaction_successful')}</div>
                                                                <div className=""><label className="font-weight-semi-bold">{this.state.seller_follower}</label> {t('seller.follower')}</div>
                                                                <div className=""><label className="font-weight-semi-bold">{this.state.seller_on_time_delivery > 0 ? `${this.state.seller_on_time_delivery}%` : "-"}</label> {t('seller.on_time_delivery')}</div>
                                                            </div>
                                                        </div>
                                                        <div className=" mt-3">{t('seller.share_to')}: </div>
                                                    </div>
                                                </div>

                                                <div className="mt-5 font-weight-bold d-flex border-bottom">
                                                    <span
                                                        onClick={event => this.setState({ currentTab: this.tab.first })}
                                                        className={`${this.state.currentTab === this.tab.first ? 'accent-color border-bottom-accent-color bgc-FAFAFB font-weight-bold' : 'color-262626'} small pointer px-2 px-sm-2 px-md-4 px-lg-4 px-xl-4 py-2`}>
                                                        {t("seller.products")}
                                                    </span>
                                                    {
                                                        this.state.seller_informations.map((info, index) => (
                                                            <span onClick={event => this.setState({ currentTab: index })} className={`${this.state.currentTab === index ? 'accent-color border-bottom-accent-color bgc-FAFAFB font-weight-bold' : 'color-262626'} small pointer px-2 px-sm-2 px-md-4 px-lg-4 px-xl-4 py-2`}>{info.title.length > 20 ? info.title.substring(0, 20) + "..." : info.title}</span>
                                                        ))
                                                    }
                                                    <span
                                                        onClick={event => this.setState({ currentTab: this.tab.second })}
                                                        className={`${this.state.currentTab === this.tab.second ? 'accent-color border-bottom-accent-color bgc-FAFAFB font-weight-bold' : 'color-262626'} small pointer px-2 px-sm-2 px-md-4 px-lg-4 px-xl-4 py-2`}
                                                    >
                                                        Forum
                                                    </span>
                                                </div>
                                                <div className="py-0 py-sm-0 py-md-0 py-lg-3 py-xl-3 bgc-FAFAFB">
                                                    {this.state.currentTab === this.tab.first ?
                                                        <SellerProduct parent={this} /> :
                                                        this.state.currentTab === this.tab.second ?
                                                            <AllThread type={"seller"} seller={this.state.seller_data} />
                                                            :
                                                            <SellerInformation parent={this} />
                                                    }
                                                </div>
                                            </div>
                                        </>}
                                </div>
                            )}
                            </MyContext.Consumer>}
                    </>
                }
            </Template>
        )
    }
}

export default withTranslation()(SellerDetail);