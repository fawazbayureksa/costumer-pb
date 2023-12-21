import React, { PureComponent } from 'react';
import Paginate from "../../../components/helpers/Paginate";
import { withTranslation } from 'react-i18next';
import axios from "axios";
import Config from "../../../components/axios/Config";
import ManualSwitchLanguage from '../../../components/helpers/ManualSwitchLanguage';
import CustomImage, { PublicStorageFolderPath } from '../../../components/helpers/CustomImage';
import { DateTimeFormat } from '../../../components/helpers/DateTimeFormat';

let Style = () => {
    return (
        <style>
            {`
                .active {
                    border: 2px solid #000000 !important;
                    color: #000000;
                    cursor: auto;
                }
            `}
        </style>
    )
}

class ProductReview extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            page_count: 0,
            page: 1,
            records: [],
            filter: "all",
            count_all: 0,
            count_with_photos: 0
        };
    }

    componentDidMount = () => {
        this.getData()
        this.getRating()
    }

    onPageChange = (page) => {
        this.setState({
            page
        }, () => this.getData())
    }

    getData = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}review/getWithParams`
        let params = {
            page: this.state.page,
            per_page: 10,
            filter: this.state.filter,
            product_id: this.props.productDetail.id
        }
        axios.get(url, Config({

        }, params)).then(res => {
            this.setState({
                records: res.data.data.data,
                page_count: res.data.data.last_page
            })
        }).catch((error) => {
            console.log(error)
            if (error.response) console.log(error.response)
        })
    }

    getRating = () => {
        let data = []
        let url = `${process.env.REACT_APP_BASE_API_URL}review/getRating`
        let params = {
            product_id: this.props.productDetail.id
        }
        axios.get(url, Config({

        }, params)).then(res => {
            data = res.data.data
            if (data) {
                this.setState({
                    rating: res.data.data,
                    rating_1: data.find(data1 => data1.rating == 1) ? data.find(data1 => data1.rating == 1).value : 0,
                    rating_2: data.find(data1 => data1.rating == 2) ? data.find(data1 => data1.rating == 2).value : 0,
                    rating_3: data.find(data1 => data1.rating == 3) ? data.find(data1 => data1.rating == 3).value : 0,
                    rating_4: data.find(data1 => data1.rating == 4) ? data.find(data1 => data1.rating == 4).value : 0,
                    rating_5: data.find(data1 => data1.rating == 5) ? data.find(data1 => data1.rating == 5).value : 0
                }, () => this.setState({ count_rating: this.state.rating_1 + this.state.rating_2 + this.state.rating_3 + this.state.rating_4 + this.state.rating_5 }))
            }
        }).catch((error) => {
            console.log(error)
            if (error.response) console.log(error.response)
        })
    }

    render() {
        const { t } = this.props;
        return (
            <>
                {this.props.type == "type_1" && <div>
                    <Style />

                    <div className="d-flex shadow-graph p-3 filter">
                        <div className="small mr-5">Filter</div>
                        <div className={`small border border-dark rounded px-2 mr-2 ${this.state.filter === "all" && "font-weight-bold active"}`} onClick={() => this.setState({ filter: "all" }, () => this.getData())}>{t("general.all")}</div>
                        <div className={`small border border-dark rounded px-2 mr-2 ${this.state.filter === "with_photos" && "font-weight-bold active"}`} onClick={() => this.setState({ filter: "with_photos" }, () => this.getData())}>{t("product_detail.with_photos")}</div>
                        <div className={`small border border-dark rounded px-2 mr-2 ${this.state.filter === "1" && "font-weight-bold active"}`} onClick={() => this.setState({ filter: "1" }, () => this.getData())}><i className="fas fa-star color-FFB200" /> 1</div>
                        <div className={`small border border-dark rounded px-2 mr-2 ${this.state.filter === "2" && "font-weight-bold active"}`} onClick={() => this.setState({ filter: "2" }, () => this.getData())}><i className="fas fa-star color-FFB200" /> 2</div>
                        <div className={`small border border-dark rounded px-2 mr-2 ${this.state.filter === "3" && "font-weight-bold active"}`} onClick={() => this.setState({ filter: "3" }, () => this.getData())}><i className="fas fa-star color-FFB200" /> 3</div>
                        <div className={`small border border-dark rounded px-2 mr-2 ${this.state.filter === "4" && "font-weight-bold active"}`} onClick={() => this.setState({ filter: "4" }, () => this.getData())}><i className="fas fa-star color-FFB200" /> 4</div>
                        <div className={`small border border-dark rounded px-2 mr-2 ${this.state.filter === "5" && "font-weight-bold active"}`} onClick={() => this.setState({ filter: "5" }, () => this.getData())}><i className="fas fa-star color-FFB200" /> 5</div>
                    </div>
                    {this.state.records.length > 0 ? <div className="">
                        {this.state.records.map((item, index) => (<div className="d-flex shadow-graph p-3 mt-4">
                            <CustomImage folder={PublicStorageFolderPath.customer} filename={item.mp_customer.photo_profile} alt={item.mp_customer.photo_profile} className="object-fit-cover rounded-circle" style={{ width: 80, height: 80 }} />
                            <div class="ml-4">
                                <div className="small font-weight-bold">{item.mp_customer.name}</div>
                                <div className="small ">{DateTimeFormat(item.created_at, 5)}</div>
                                <div className="d-flex">
                                    {[1, 2, 3, 4, 5].map(rating =>
                                        rating <= item.rating && <div><i className="fas fa-star color-FFB200" /></div>
                                    )}
                                </div>
                                <div className="small">{item.review}</div>
                                <div className="d-flex mt-2">
                                    {item.mp_product_rating_files.map((file) =>
                                        <CustomImage folder={PublicStorageFolderPath.product_review} filename={file.filename} alt={file.filename} className="object-fit-cover rounded mr-2" style={{ width: 80, height: 80 }} />
                                    )}
                                </div>
                            </div>
                        </div>))}
                        <div className="mt-3">
                            <Paginate pageCount={this.state.page_count} onPageChange={this.onPageChange} initialPage={this.state.page} />
                        </div>
                    </div> :
                        <div className="shadow-graph p-3 mt-4">
                            <div className="small">{t("product_detail.no_review")}</div>
                        </div>}
                </div>}
                {this.props.type == "type_2" && <div>
                    <Style />

                    <div className="bg-white shadow-graph rounded p-4">
                        <p className="font-weight-semi-bold"><ManualSwitchLanguage data={this.props.productDetail.mp_product_informations} langAttr={"language_code"} valueAttr={"name"} /></p>
                        {this.state.rating &&
                            <div className="d-flex mt-2">
                                <div className="d-flex align-items-center">
                                    <div>
                                        <p className="d-flex justify-content-center font-weight-semi-bold"><label className="">{this.props.productDetail.rating ? this.props.productDetail.rating : "-"}</label><label className=" d-flex align-items-end">/5</label></p>
                                        <p className=""><i className="fas fa-star color-FFB200" /><i className="fas fa-star color-FFB200" /><i className="fas fa-star color-FFB200" /><i className="fas fa-star color-FFB200" /><i className="fas fa-star color-FFB200" /></p>
                                    </div>
                                </div>
                                <div className="ml-5">
                                    <div className="d-flex">
                                        <p className=""><i className="fas fa-star color-FFB200" /> 5</p>
                                        <div className="mt-2 mx-3">
                                            <div className="rounded border-D3D3D3 bgc-D3D3D3" style={{ width: 70, height: 10 }}>
                                                <div className="bgc-FFB200 border-FFB200 rounded" style={{ width: this.state.rating_5 / this.state.count_rating * 70, height: '100%' }}></div>
                                            </div>
                                        </div>
                                        <p className="">{this.state.rating_5}</p>
                                    </div>
                                    <div className="d-flex">
                                        <p className=""><i className="fas fa-star color-FFB200" /> 4</p>
                                        <div className="mt-2 mx-3">
                                            <div className="rounded border-D3D3D3 bgc-D3D3D3" style={{ width: 70, height: 10 }}>
                                                <div className="bgc-FFB200 border-FFB200 rounded" style={{ width: this.state.rating_4 / this.state.count_rating * 70, height: '100%' }}></div>
                                            </div>
                                        </div>
                                        <p className="">{this.state.rating_4}</p>
                                    </div>
                                    <div className="d-flex">
                                        <p className=""><i className="fas fa-star color-FFB200" /> 3</p>
                                        <div className="mt-2 mx-3">
                                            <div className="rounded border-D3D3D3 bgc-D3D3D3" style={{ width: 70, height: 10 }}>
                                                <div className="bgc-FFB200 border-FFB200 rounded" style={{ width: this.state.rating_3 / this.state.count_rating * 70, height: '100%' }}></div>
                                            </div>
                                        </div>
                                        <p className="">{this.state.rating_3}</p>
                                    </div>
                                    <div className="d-flex">
                                        <p className=""><i className="fas fa-star color-FFB200" /> 2</p>
                                        <div className="mt-2 mx-3">
                                            <div className="rounded border-D3D3D3 bgc-D3D3D3" style={{ width: 70, height: 10 }}>
                                                <div className="bgc-FFB200 border-FFB200 rounded" style={{ width: this.state.rating_2 / this.state.count_rating * 70, height: '100%' }}></div>
                                            </div>
                                        </div>
                                        <p className="">{this.state.rating_2}</p>
                                    </div>
                                    <div className="d-flex">
                                        <p className=""><i className="fas fa-star color-FFB200" /> 1</p>
                                        <div className="mt-2 mx-3">
                                            <div className="rounded border-D3D3D3 bgc-D3D3D3" style={{ width: 70, height: 10 }}>
                                                <div className="bgc-FFB200 border-FFB200 rounded" style={{ width: this.state.rating_1 / this.state.count_rating * 70, height: '100%' }}></div>
                                            </div>
                                        </div>
                                        <p className="">{this.state.rating_1}</p>
                                    </div>
                                </div>
                            </div>
                        }
                        <div className="d-flex filter border-bottom mt-5">
                            <div className={`small px-2 pb-2 mr-2  ${this.state.filter === "all" && "font-weight-bold accent-color border-bottom-accent-color"}`} onClick={() => this.setState({ filter: "all" }, () => this.getData())}>{t("general.all")}</div>
                            <div className={`small px-2 pb-2 mr-2  ${this.state.filter === "with_photos" && "font-weight-bold accent-color border-bottom-accent-color"}`} onClick={() => this.setState({ filter: "with_photos" }, () => this.getData())}>{t("product_detail.with_photos")}</div>
                            <div className={`small px-2 pb-2 mr-2  ${this.state.filter === "1" && "font-weight-bold accent-color border-bottom-accent-color"}`} onClick={() => this.setState({ filter: "1" }, () => this.getData())}><i className="fas fa-star color-FFB200" /> 1</div>
                            <div className={`small px-2 pb-2 mr-2  ${this.state.filter === "2" && "font-weight-bold accent-color border-bottom-accent-color"}`} onClick={() => this.setState({ filter: "2" }, () => this.getData())}><i className="fas fa-star color-FFB200" /> 2</div>
                            <div className={`small px-2 pb-2 mr-2  ${this.state.filter === "3" && "font-weight-bold accent-color border-bottom-accent-color"}`} onClick={() => this.setState({ filter: "3" }, () => this.getData())}><i className="fas fa-star color-FFB200" /> 3</div>
                            <div className={`small px-2 pb-2 mr-2  ${this.state.filter === "4" && "font-weight-bold accent-color border-bottom-accent-color"}`} onClick={() => this.setState({ filter: "4" }, () => this.getData())}><i className="fas fa-star color-FFB200" /> 4</div>
                            <div className={`small px-2 pb-2 mr-2  ${this.state.filter === "5" && "font-weight-bold accent-color border-bottom-accent-color"}`} onClick={() => this.setState({ filter: "5" }, () => this.getData())}><i className="fas fa-star color-FFB200" /> 5</div>
                        </div>
                        {this.state.records.length > 0 ? <div className="">
                            {this.state.records.map((item, index) => (<div className={`d-flex py-3 mt-2 ${index < this.state.records.length - 1 && "border-bottom"}`}>
                                <CustomImage folder={PublicStorageFolderPath.customer} filename={item.mp_customer.profile_picture} alt={item.mp_customer.profile_picture} className="object-fit-cover rounded-circle" style={{ width: 80, height: 80 }} />
                                <div class="ml-4">
                                    <div className="small font-weight-bold ">{item.mp_customer.name}</div>
                                    <div className="small ">{DateTimeFormat(item.created_at, 5)}</div>
                                    <div className="d-flex">
                                        {[1, 2, 3, 4, 5].map(rating =>
                                            rating <= item.rating && <div><i className="fas fa-star color-FFB200" /></div>
                                        )}
                                    </div>
                                    <div className="small ">{item.review}</div>
                                    <div className="d-flex mt-2">
                                        {console.log(item.mp_product_rating_files)}
                                        {item.mp_product_rating_files.map((file) =>
                                            <CustomImage folder={PublicStorageFolderPath.product_review} filename={file.filename} alt={file.filename} className="object-fit-cover rounded mr-2" style={{ width: 80, height: 80 }} />
                                        )}
                                    </div>
                                </div>
                            </div>))}
                            <div className="mt-3">
                                <Paginate pageCount={this.state.page_count} onPageChange={this.onPageChange} initialPage={this.state.page} />
                            </div>
                        </div> :
                            <div className="py-3 mt-2">
                                <div className="small  ">{t("product_detail.no_review")}</div>
                            </div>}
                    </div>

                </div>}
            </>
        )
    }
}

/**
 * @param {string} type config type
 * @param {object} productDetail product detail
 */
export default withTranslation()(ProductReview)