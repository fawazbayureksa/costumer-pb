import React, { PureComponent } from "react";
import Template from "../../../components/Template";
import axios from "axios";
import Config from "../../../components/axios/Config";
import Section from "../../cms/Section";
import MyContext from "../../../components/MyContext";
import EcommerceRoutePath from "../EcommerceRoutePath";
import { Link } from "react-router-dom";
import Paginate from "../../../components/helpers/Paginate";
import { withTranslation } from "react-i18next";
import CustomImage, { PublicStorageFolderPath } from "../../../components/helpers/CustomImage";

const Style = props => {
    if (props.themes) {
        return (
            <style>{`
                #sellers {
                    max-width: ${props.themes.site_width.width};
                    margin: 0 auto;
                }
                @media (max-width: 765.98px) {
                    #sellers {
                        padding-right: 18px;
                        padding-left: 18px;
                    }
                }
            `}</style>
        );
    } else return null;
}

class SellerList extends PureComponent {
    constructor(props) {
        super(props);
        let params = new URLSearchParams(window.location.search);
        let querySearch = params.get('search');
        this.state = {
            sections: null,
            records: [],
            search: querySearch,
            page: 1,
            last_page: 1,
            length: 10
        };
    }

    componentDidMount() {
        this.getSellerList();
        this.props.history.listen((location, action) => {
            let params = new URLSearchParams(window.location.search);
            let querySearch = params.get('search');
            this.setState({
                search: querySearch,
                page: 1,
            }, () => this.getSellerList());
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.page !== this.state.page) {
            this.getSellerList()
        }
    }

    getSellerList = () => {
        let params = {
            search: this.state.search,
            order_by: this.state.order_by,
            order: this.state.order,
            page: this.state.page,
            length: this.state.length,
        }
        axios.get(`${process.env.REACT_APP_BASE_API_URL}ecommerce/seller/get`, Config({}, params))
            .then(response => {
                console.log(response.data.data)
                if (response.data.data) {
                    this.setState({
                        records: response.data.data.data,
                        last_page: response.data.data.last_page
                    })
                }
            }).catch(error => {
                console.error(error);
            }).finally(() => {
                //
            });
    }

    render() {
        console.log(this.props)
        const { t } = this.props;
        return (
            <Template>
                <div id="seller-comp">
                    <style>{`
                        #seller-comp {
                            display: grid;
                            grid-template-columns: repeat(3, 1fr);
                            gap: 1rem;
                        }
                        @media (max-width: 767.98px) {
                            #seller-comp {
                                display: grid;
                                grid-template-columns: repeat(2, 1fr);
                                gap: 1rem;
                            }
                        }
                    `}</style>
                </div>
                <MyContext.Consumer>{(context) => (
                    <>
                        <Style themes={context.theme_settings} />
                        <div id="sellers">
                            <div id="seller-comp">
                                {this.state.records.map((value, index) => (
                                    <Link to={EcommerceRoutePath.SELLER.replace(":seller_slug", value.slug)} className="bg-white shadow-graph position-relative text-decoration-none rounded p-2" key={index}>
                                        <div className="row no-gutters border-bottom py-3" style={{ height: 100 }}>
                                            <div className="col-4 col-sm-4 col-md-4 col-lg-3 col-xl-3 d-flex justify-content-center align-items-center">
                                                <CustomImage folder={PublicStorageFolderPath.seller} filename={value.logo} alt={value.logo} className="object-fit-cover rounded-circle" style={{ height: 50, width: 50 }} />
                                            </div>
                                            <div className="col-8 col-sm-8 col-md-8 col-lg-9 col-xl-9 d-flex align-items-center pl-1">
                                                <div>
                                                    <p className="m-0 color-292929  font-weight-bold"><i className="fa fa-check-circle mt-2 accent-color" style={{ fontSize: 20 }} />{value.name}</p>
                                                    <p className="m-0 color-858585 "><i className="fa fa-map-marker accent-color mr-2" />{value.city}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row no-gutters py-3" style={{ height: 180 }}>
                                            <CustomImage folder={PublicStorageFolderPath.seller} filename={value.cover_picture} alt={value.cover_picture} className="w-100 h-100 object-fit-cover" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            {(this.state.records.length > 0) &&
                                <div className="d-flex justify-content-end mt-3">
                                    <Paginate
                                        pageCount={this.state.last_page}
                                        onPageChange={selected => this.setState({ page: selected })}
                                        initialPage={this.state.page}
                                    />
                                </div>}

                            {(this.state.records.length === 0) &&
                                <div className="bg-white rounded shadow-graph p-4">
                                    <div className="row">
                                        <div className="col-3 d-flex align-items-center">
                                            <img
                                                src={`/images/empty-product.png`}
                                                className="w-100"
                                                onError={event => event.target.src = `/images/placeholder.gif`}
                                            />
                                        </div>
                                        <div className="col-9 d-flex align-items-center">
                                            <div className="w-100">
                                                <p className="m-0 color-858585 font-weight-bold">{t('product_list.not_found')}</p>
                                                <p className="m-0 color-858585 ">{t('product_list.try_again')}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>}
                        </div>
                    </>
                )}</MyContext.Consumer>
            </Template>
        );
    }
}

export default withTranslation()(SellerList)