import { PureComponent } from "react";
import { Modal } from 'react-bootstrap';
import $ from "jquery";
import update from 'immutability-helper';
import ExceedUploadLimit from "./ExceedUploadLimit";
import ErrorDiv from './ErrorDiv';
import SwalToast from "./SwalToast";
import IsEmpty from "./IsEmpty";
import ManualSwitchLanguage from "./ManualSwitchLanguage";
import axios from "axios";
import Config from "../../components/axios/Config";
import Cookie from "js-cookie";
import CurrencyFormat from "./CurrencyFormat";
import CustomImage, { PublicStorageFolderPath } from "./CustomImage";


class Review extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            review_modal_show: props.state.review_modal_show,
            selected_transaction: props.state.selected_transaction,
            product_rating: props.state.product_rating,
            seller_rating: props.state.seller_rating,
            errors: {}
        }
    }


    componentDidUpdate(prevProps, prevState) {
        console.log(this.props.state.product_rating)
        if (this.props !== prevProps) {
            this.setState({
                review_modal_show: this.props.state.review_modal_show,
                selected_transaction: this.props.state.selected_transaction,
                product_rating: this.props.state.product_rating,
                seller_rating: this.props.state.seller_rating,
                errors: {}
            })
        }
    }

    ratingProduct = (index, rating) => {
        this.setState({
            product_rating: update(this.state.product_rating, {
                [index]: { rating: { $set: rating } }
            })
        })
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) $(`#star-${index}-${i}`).css('color', '#F8931D    ')
            else $(`#star-${index}-${i}`).css('color', '#858585')
        }
    }

    onFileChange = (e, index) => {
        let value = e.target.files[0];

        if (value) {
            let exceed = ExceedUploadLimit(value)
            let errors = {}
            if (exceed.value) {
                errors["image[" + index + "]"] = `Limit upload size is ${exceed.max_size / 1024} Kb`
                this.setState({ errors: errors });
                return;
            }

            this.setState({ is_submit_file: true })
            const formData = new FormData();
            formData.append('file', value);

            let url = process.env.REACT_APP_BASE_API_URL + "review/uploadFile";

            axios.post(url, formData, Config({
                Authorization: 'Bearer ' + Cookie.get('token'),
                'content-type': 'multipart/form-data'
            })).then(response => {
                this.setState({
                    product_rating: update(this.state.product_rating, {
                        [index]: { review_file: { $push: [response.data.data] } }
                    })
                })
            }).catch(error => {
                if (error.response) {
                    errors["image[" + index + "]"] = error.response.data.message
                    this.setState({ errors: errors })
                }
            }).finally(() => {
                this.setState({ is_submit_file: false })
            });

        } else {
            this.setState({
                filename: "",
                is_submit_file: false
            })
        }
    }

    validate = () => {
        let validate = true
        let errors = {}

        if (this.state.seller_rating < 1) {
            validate = false
            errors["seller_rating"] = "Seller rating is required"
        }
        this.state.product_rating.forEach((product, index) => {
            if (product.rating < 1) {
                validate = false
                errors["product_rating[" + index + "]"] = "Product rating is required"
            }
        });

        this.setState({ errors }, () => console.log(errors))
        return validate
    }

    sendReview = () => {
        if (!this.validate()) return

        console.log("Send review...")
        let data = {
            seller_id: parseInt(this.state.selected_transaction.mp_seller_id),
            transaction_id: parseInt(this.state.selected_transaction.id),
            seller_rating: parseInt(this.state.seller_rating),
            product_rating: this.state.product_rating
        }

        this.setState({ submitting: true })
        let url = `${process.env.REACT_APP_BASE_API_URL}review/save`
        axios.post(url, data, Config({
            Authorization: 'Bearer ' + Cookie.get('token'),
        })).then(res => {
            console.log(res)
            SwalToast.fire({ icon: "success", title: res.data.message })
            this.setState({ submitting: false })
            this.props.closeReviewModal()
            this.props.refresh()
        }).catch((error) => {
            console.log(error)
            this.setState({ submitting: false })
            if (IsEmpty(error.response)) {
                SwalToast.fire({
                    icon: 'error',
                    title: 'Whoops, something went wrong!'
                });
            } else {
                let errors = error.response.data.data
                this.setState({ errors })
                if (errors) {
                    SwalToast.fire({
                        icon: 'error',
                        title: 'Please check your input'
                    });
                } else {
                    SwalToast.fire({
                        icon: 'error',
                        title: error.response.data.message
                    });
                }

            }
        })
    }

    render() {
        return (
            <Modal size={"xl"} centered show={this.props.state.review_modal_show} onHide={this.props.closeReviewModal}>
                <style>{`
                    .image-review {
                        width: 40%;
                    }
                    @media (max-width: 767.98px) {
                        .image-review {
                            width: 100%;
                        }
                        .review-image-girl {
                            width: 80px;
                        }
                    }
                `}</style>
                {
                    this.state.selected_transaction &&
                    <>
                        <Modal.Header className="d-flex">
                            <Modal.Title className="font-weight-bold small color-5F6C73 d-flex">{this.props.t('my_orders.review')}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="px-3 pb-2">
                                <div className="">
                                    <div className="">{this.props.t('review.how_is_your_shopping_experience_with')} {this.state.selected_transaction.mp_seller.name}?</div>
                                    <div className="row mt-2">
                                        <div className="col-4 col-sm-4 col-md-2 col-lg-2 col-xl-2">
                                            <img src={`/images/${this.state.seller_rating == 1 ? "seller-rating-color-1.png" : "seller-rating-1.png"}`} style={{ width: 80, height: 80 }} onClick={() => this.setState({ seller_rating: 1 })} />
                                        </div>
                                        <div className="col-4 col-sm-4 col-md-2 col-lg-2 col-xl-2">
                                            <img src={`/images/${this.state.seller_rating == 3 ? "seller-rating-color-2.png" : "seller-rating-2.png"}`} style={{ width: 80, height: 80 }} onClick={() => this.setState({ seller_rating: 3 })} />
                                        </div>
                                        <div className="col-4 col-sm-4 col-md-2 col-lg-2 col-xl-2">
                                            <img src={`/images/${this.state.seller_rating == 5 ? "seller-rating-color-3.png" : "seller-rating-3.png"}`} style={{ width: 80, height: 80 }} onClick={() => this.setState({ seller_rating: 5 })} />
                                        </div>
                                    </div>
                                    <ErrorDiv error={this.state.errors.seller_rating} style="" />
                                </div>
                                {
                                    this.state.selected_transaction.mp_transaction_details.map((value, index) => (
                                        <>
                                            <div className="row mt-4 py-4" style={{ borderTop: '1px solid #D3D3D3' }}>
                                                <div className="col-3 col-sm-3 col-md-2 col-lg-2 col-xl-2">
                                                    <CustomImage folder={PublicStorageFolderPath.products} filename={value.mp_transaction_product.mp_transaction_product_images[0].filename} alt={value.mp_transaction_product.mp_transaction_product_images[0].filename} className="object-fit-cover rounded" style={{ width: 50, height: 50 }} />
                                                </div>
                                                <div className="col-6 col-sm-6 col-md-6 col-lg-8 col-xl-8">
                                                    <div className="font-weight-semi-bold">
                                                        <ManualSwitchLanguage data={value.mp_transaction_product.mp_transaction_product_informations} langAttr={"language_code"} valueAttr={"name"} />
                                                    </div>
                                                    {value.mp_transaction_product.mp_transaction_product_sku_variants.map((variant) => (
                                                        <div key={variant.id}>
                                                            <small className="">{variant.name}: {variant.mp_transaction_product_sku_variant_option.name}</small>
                                                        </div>)
                                                    )}
                                                    <div className="d-flex mt-2">
                                                        <small>Rp {CurrencyFormat(value.mp_transaction_product.mp_transaction_product_sku.price.toString())}</small>
                                                    </div>
                                                </div>
                                                <div className="col-3 col-sm-3 col-md-3 col-lg-2 col-xl-2 text-right">
                                                    <small>{value.quantity} {this.props.t('seller.products')}</small>
                                                    <div className="mt-2">
                                                        <small className="font-weight-semi-bold">Rp {CurrencyFormat(value.total_price.toString())}</small>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row py-4" style={{ borderTop: '1px solid #D3D3D3' }}>
                                                <div className="col-4 col-sm-4 col-md-4 col-lg-2 col-xl-2">
                                                    <img src={`/images/people-review.png`} className="review-image-girl" />
                                                </div>
                                                <div className="col-8 col-sm-8 col-md-8 col-lg-10 col-xl-10">
                                                    <h5 className="accent-color">{this.props.t('Hi')} {this.state.selected_transaction.mp_customer.name}! {this.props.t('review.do_you_like_this_product')}?</h5>
                                                    <div>{this.props.t('review.give_star_for_this_product_and_write_your_review')}</div>
                                                    <div className="d-flex my-2">
                                                        {
                                                            [1, 2, 3, 4, 5].map(rating =>
                                                                <p onClick={() => this.ratingProduct(index, rating)}><i id={"star-" + index + "-" + rating} className="fas fa-star color-858585" /></p>
                                                            )
                                                        }
                                                    </div>
                                                    <ErrorDiv error={this.state.errors["product_rating[" + index + "]"]} style="" />
                                                </div>
                                            </div>
                                            <div className="row py-4" style={{ borderTop: '1px solid #D3D3D3' }}>
                                                <small className="font-weight-bold">{this.props.t('review.write_review')}</small>
                                                <textarea
                                                    className="form-control mt-2"
                                                    onChange={e => this.setState({
                                                        product_rating: update(this.state.product_rating, {
                                                            [index]: { review: { $set: e.target.value } }
                                                        })
                                                    })
                                                    }
                                                />
                                                <div className="mt-3 image-review" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 10 }}>
                                                    {
                                                        this.state.product_rating[index].review_file.map((img, imgIndex) => (
                                                            <div className="w-100" style={{ position: "relative", height: 60 }}>
                                                                <CustomImage folder={PublicStorageFolderPath.product_review} filename={img} alt={img} className="w-100" style={{ height: 60 }} />
                                                                <button className="close"
                                                                    onClick={() => this.setState({
                                                                        product_rating: update(this.state.product_rating, {
                                                                            [index]: { review_file: { $splice: [[imgIndex, 1]] } }
                                                                        })
                                                                    })}
                                                                ><i className="fa fa-window-close color-374650 fa-sm"></i></button>
                                                            </div>
                                                        ))
                                                    }
                                                    {
                                                        this.state.product_rating[index].review_file.length < 5 &&
                                                        <div className="w-100" style={{ height: 60 }}>
                                                            <label for={"file-input-" + index} className="w-100" style={{ height: 60 }}>
                                                                <img src={`/images/add-photos.png`} className="w-100" style={{ height: 60 }} />
                                                            </label>
                                                            <input id={"file-input-" + index} type="file" style={{ display: "none" }} onChange={e => this.onFileChange(e, index)} accept="image/*" />
                                                        </div>
                                                    }
                                                </div>
                                                <ErrorDiv error={this.state.errors["image[" + index + "]"]} style="" />
                                            </div>
                                        </>
                                    ))
                                }
                                <div className="text-right">
                                    <button className="btn accent-color border-accent-color mt-4 mr-2" onClick={this.props.closeReviewModal} disabled={this.state.submitting}>{this.props.t('general.cancel')}</button>
                                    <button className="btn bgc-accent-color mt-4" onClick={this.sendReview} disabled={this.state.submitting}>{this.props.t('general.send')}</button>
                                </div>
                            </div>
                        </Modal.Body>
                    </>
                }
            </Modal>
        )
    }
}

export default Review;