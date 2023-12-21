import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Config from "../components/axios/Config";
import { Link, useHistory, useLocation } from "react-router-dom";
import $ from "jquery";
import ManualSwitchLanguage from "../components/helpers/ManualSwitchLanguage";
import TextTruncate from "../components/helpers/TextTruncate";
import CurrencyFormat from "../components/helpers/CurrencyFormat";
import Paginate from "../components/helpers/Paginate";
import EcommerceRoutePath from "../pages/e-commerce/EcommerceRoutePath";
import { withTranslation } from "react-i18next";
import Cookie from "js-cookie";
import update from "immutability-helper";
import SwalToast from "../components/helpers/SwalToast";
import MyContext from "../components/MyContext";
import PriceRatio from "../components/helpers/PriceRatio";
import CustomImage, { PublicStorageFolderPath } from "../components/helpers/CustomImage";
import MetaTrigger from "../components/MetaTrigger";
import moment from "moment";
import Countdown from 'react-countdown';
/**
 * 
 * @param {int} id unique id for this component
 * @param {object} data data for this component
 */
const ProductList = (props) => {
    const history = useHistory();
    const location = useLocation();
    const productListType = location.pathname.includes("new_arrival") ? "new_arrival" : location.pathname.includes("best_seller") ? "best_seller" : location.pathname.includes("products/") ? "auction" : ""

    let params = new URLSearchParams(window.location.search);

    const [data, set_data] = useState();

    // from product filter
    let querySearch = params.get('search');
    let queryMinPrice = params.get('min_price');
    let queryMaxPrice = params.get('max_price');
    let queryDeliveryMethod = params.get('delivery_method');
    let queryArea = params.get('area');
    let queryRating = params.get('rating');
    let queryCategory = params.get('category');
    let queryName = params.get('type');

    // not from product filter
    let queryOrderBy = params.get('order_by');
    let queryOrder = params.get('order');
    let queryLength = params.get('length');
    let queryPage = params.get('page');

    // from product filter
    const [search, set_search] = useState(querySearch || '');
    const [price, set_price] = useState({
        min: parseInt(queryMinPrice) || 1,
        max: parseInt(queryMaxPrice) || 50000000,
    });
    const [delivery_method, set_delivery_method] = useState(queryDeliveryMethod || '');
    const [area, set_area] = useState(queryArea || '');
    const [rating, set_rating] = useState(queryRating || '');
    const [category, set_category] = useState(queryCategory || props.data.mp_category_slug || '');

    // not from product filter
    const [order_by, set_order_by] = useState(queryOrderBy || props.data.order_by || '');
    const [order, set_order] = useState(queryOrder || props.data.order || '');
    const [length, set_length] = useState(queryLength || props.data.product_per_page);
    const [current_page, set_current_page] = useState(parseInt(queryPage) || 1);

    const [type_name, set_type_name] = useState(queryName || props.data.type);

    const imgSquareTimeout = useRef(0)
    const alreadyInit = useRef(false)

    const cssClass = {
        productsComp: `products-comp-${props.id}`,
        productCompImage: `product-comp-image-${props.id}`
    }

    const responsiveView = () => {
        imgSquare();
    }

    useEffect(() => {
        window.addEventListener('resize', responsiveView);
        return () => {
            window.removeEventListener('resize', responsiveView);
        };
    }, [])

    useEffect(() => {
        const unlisten = history.listen((location, action) => {
            params = new URLSearchParams(window.location.search);
            querySearch = params.get('search');
            queryMinPrice = params.get('min_price');
            queryMaxPrice = params.get('max_price');
            queryDeliveryMethod = params.get('delivery_method');
            queryArea = params.get('area');
            queryRating = params.get('rating');
            queryCategory = params.get('category');
            queryOrderBy = params.get('order_by');
            queryOrder = params.get('order');
            queryLength = params.get('length');
            queryPage = params.get('page');
            queryName = params.get('type');

            set_search(querySearch);
            if (parseInt(queryMinPrice) !== price.min || parseInt(queryMaxPrice) !== price.max) { // need to compare object's values to prevent unnecessary rerender
                set_price({
                    min: parseInt(queryMinPrice) || price.min,
                    max: parseInt(queryMaxPrice) || price.max,
                });
            }
            set_delivery_method(queryDeliveryMethod);
            set_area(queryArea);
            set_rating(queryRating);
            set_category(queryCategory);
            set_order_by(queryOrderBy || order_by);
            set_order(queryOrder || order);
            set_length(queryLength || length);
            set_current_page(parseInt(queryPage) || current_page);
            if (queryName) {
                set_type_name(queryName)
            } else {
                set_type_name(props.data.type)
            }
        });
        return unlisten
    }, [])

    useEffect(() => {
        if (!alreadyInit.current) return

        if (current_page === 1) {
            getProducts();
            generateFilters();
        } else {
            set_current_page(1)
        }

    }, [search, price, delivery_method, area, rating, category, order_by, order, length, type_name])

    useEffect(() => {
        getProducts();
        generateFilters();
    }, [current_page])

    const getProducts = () => {
        const customUrl = props.data.custom_product_url;
        if (productListType === "custom") {
            customUrl = location.pathname.replace("/products/", "")
        }
        let params = {
            search: search,
            min_price: price.min,
            max_price: price.max,
            delivery_method: delivery_method,
            area: area,
            rating: rating,
            category: category,
            order_by: order_by,
            order: order,
            length: length,
            page: current_page,
            type: type_name ? type_name : productListType,
            custom_product_url: customUrl
        }

        axios.get(`${process.env.REACT_APP_BASE_API_URL}ecommerce/products/get`, Config({}, params)).then(response => {
            set_data(response.data.data);
            alreadyInit.current = true
        }).catch(error => {
            console.error(error);
        }).finally(() => {
            imgSquare();
        });
    }

    const imgSquare = () => {
        if (imgSquareTimeout.current) clearTimeout(imgSquareTimeout.current)
        imgSquareTimeout.current = setTimeout(() => {
            let width = $(`.${cssClass.productCompImage}`).width();
            $(`.${cssClass.productCompImage}`).css('height', width === 0 ? 'auto' : width);
        }, 700);
    }

    const generateFilters = () => {
        let urlParams = new URLSearchParams(window.location.search)
        urlParams.set("search", search);
        urlParams.set(`min_price`, price.min);
        urlParams.set(`max_price`, price.max);
        urlParams.set(`delivery_method`, delivery_method);
        urlParams.set(`area`, area);
        urlParams.set(`rating`, rating);
        urlParams.set(`category`, category);
        urlParams.set(`order_by`, order_by);
        urlParams.set(`order`, order);
        urlParams.set(`length`, length);
        urlParams.set(`page`, current_page);
        urlParams.set(`type`, type_name);
        history.push({
            pathname: history.location.pathname,
            search: urlParams.toString()
        });
    }

    const { t } = props;

    const addWishlist = (event, index, product_id, value) => {
        event.preventDefault();
        axios.post(`${process.env.REACT_APP_BASE_API_URL}my-wishlist/add`, {
            product_id: product_id
        }, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        })).then(response => {
            set_data(update(data, {
                data: {
                    [index]: {
                        mp_wishlist: { $set: value }
                    }
                }
            }));
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
    }


    return (
        <MyContext.Consumer>{context => (
            <>
                <MetaTrigger
                    pageTitle={context.companyName ? `${context.companyName} - Product List` : ""}
                    pageDesc={`Manage Cart`}
                />
                <div id={cssClass.productsComp}>
                    <style>{`
                        #${cssClass.productsComp} {
                            display: grid;
                            grid-template-columns: repeat(${props.data.number_of_column}, 1fr);
                            gap: 1rem;
                        }
                    `}</style>
                    {data && data.data.map((value, index) => {
                        if (props.data.layout === 'type_1') {
                            return (
                                <Link to={EcommerceRoutePath.PRODUCT_DETAIL.replace(":seller_slug", value.mp_seller.slug).replace(":product_slug", value.slug)} className="bg-white shadow-graph position-relative text-decoration-none rounded p-2" key={value.id}>
                                    <CustomImage folder={PublicStorageFolderPath.products} filename={value.mp_product_images[0].filename} alt={value.mp_product_images[0].filename} className={`w-100 object-fit-cover ${cssClass.productCompImage}`} />
                                    {(value.type === 'auction' && moment(new Date()).isBefore(moment(value?.active_start_date))) &&
                                        <CountdownAuction targetDate={value?.active_start_date} t={t} type={"start"} />
                                    }
                                    {(value.type === 'auction' && moment(new Date()).isBetween(moment(value?.active_start_date), moment(value?.active_end_date))) &&
                                        <CountdownAuction targetDate={value?.active_start_date} t={t} type={"end"} />
                                    }
                                    <TextTruncate lineClamp={2} className="m-0  font-weight-semi-bold"><ManualSwitchLanguage data={value.mp_product_informations} langAttr={"language_code"} valueAttr={"name"} /></TextTruncate>
                                    {value.is_sale_price &&
                                        <div className="">
                                            <span className="bgc-accent-color  rounded px-1">{PriceRatio(value.mp_product_skus.find(value1 => value1.is_main).normal_price, value.mp_product_skus.find(value1 => value1.is_main).price)}</span>
                                            <span className="color-374650 px-1"><del>Rp. {CurrencyFormat(value.mp_product_skus.find(value1 => value1.is_main).normal_price)}</del></span>
                                        </div>}
                                    <p className="m-0  color-374650 font-weight-bold">Rp. {CurrencyFormat(value.mp_product_skus.find(value1 => value1.is_main).price)}</p>
                                    {props.data.show_seller_location === 'yes' &&
                                        <p
                                            className="m-0  color-374650"
                                            onMouseOver={event => {
                                                if (props.data.show_seller_name_on_hover === 'yes') event.currentTarget.textContent = value.mp_seller.name
                                            }}
                                            onMouseOut={event => event.currentTarget.textContent = value.mp_seller.city}
                                        >{value.mp_seller.city}</p>}
                                    <div className="d-flex align-items-center">
                                        {props.data.show_ratings === 'yes' &&
                                            <>
                                                <i className="far fa-star  accent-color" />
                                                <span className=" color-374650 mt-1 ml-1">{value.rating ? value.rating : "-"}</span>
                                                <span className=" color-374650 mt-1 ml-1">|</span>
                                            </>}
                                        {props.data.show_unit_sold === 'yes' &&
                                            <span className=" color-374650 mt-1 ml-1">{t('product_detail.sold')} {value.sold_product}</span>}
                                    </div>
                                    <div className="position-absolute" style={{ right: '0.5rem', bottom: 0 }} onClick={event => addWishlist(event, index, value.id, !value.mp_wishlist)}>
                                        {value.mp_wishlist ?
                                            <svg width="28px" height="28px" viewBox="0 0 16 16" className="bi bi-heart-fill" fill={context.theme_settings ? context.theme_settings.accent_color.value : ''} xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z" />
                                            </svg> :
                                            <svg width="28px" height="28px" viewBox="0 0 16 16" className="bi bi-heart" fill={context.theme_settings ? context.theme_settings.accent_color.value : ''} xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" d="M8 2.748l-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z" />
                                            </svg>}
                                    </div>
                                </Link>
                            );
                        } else if (props.data.layout === 'type_2') {
                            return (
                                <Link to={EcommerceRoutePath.PRODUCT_DETAIL.replace(":seller_slug", value.mp_seller.slug).replace(":product_slug", value.slug)} className="bg-white shadow-graph position-relative text-decoration-none rounded p-2" key={value.id}>
                                    <CustomImage folder={PublicStorageFolderPath.products} filename={value.mp_product_images[0].filename} alt={value.mp_product_images[0].filename} className={`w-100 object-fit-cover ${cssClass.productCompImage}`} />
                                    <div className="d-flex align-items-center mt-2">
                                        <span className="font-size-80-percent bgc-accent-color  rounded  px-1">17%</span>
                                        <span className="font-size-80-percent color-374650 px-1"><del>Rp. 123.456</del></span>
                                    </div>
                                    {(value.type === 'auction' && moment(new Date()).isBefore(moment(value?.active_start_date))) &&
                                        <CountdownAuction targetDate={value?.active_start_date} t={t} type={"start"} />
                                    }
                                    {(value.type === 'auction' && moment(new Date()).isBetween(moment(value?.active_start_date), moment(value?.active_end_date))) &&
                                        <CountdownAuction targetDate={value?.active_start_date} t={t} type={"end"} />
                                    }
                                    <TextTruncate lineClamp={2} className="m-0  font-weight-semi-bold"><ManualSwitchLanguage data={value.mp_product_informations} langAttr={"language_code"} valueAttr={"name"} /></TextTruncate>
                                    <p className="m-0 color-374650 font-weight-bold">Rp. {CurrencyFormat(value.mp_product_skus.find(value1 => value1.is_main).price)}</p>
                                    <div className="d-flex align-items-center">
                                        {props.data.show_ratings === 'yes' &&
                                            <>
                                                <i className="far fa-star  accent-color" />
                                                <span className=" color-374650 mt-1 ml-1">{value.rating ? value.rating : "-"}</span>
                                                <span className=" color-374650 mt-1 ml-1">|</span>
                                            </>}
                                        {props.data.show_unit_sold === 'yes' &&
                                            <span className=" color-374650 mt-1 ml-1">{t('product_detail.sold')} {value.sold_product}</span>}
                                    </div>
                                    {props.data.show_seller_location === 'yes' &&
                                        <p
                                            className="m-0  color-374650"
                                            onMouseOver={event => {
                                                if (props.data.show_seller_name_on_hover === 'yes') event.currentTarget.textContent = value.mp_seller.name
                                            }}
                                            onMouseOut={event => event.currentTarget.textContent = value.mp_seller.city}
                                        >{value.mp_seller.city}</p>}
                                    <div className="position-absolute" style={{ right: '0.5rem', bottom: 0 }} onClick={event => addWishlist(event, index, value.id, !value.mp_wishlist)}>
                                        {value.mp_wishlist ?
                                            <svg width="28px" height="28px" viewBox="0 0 16 16" className="bi bi-heart-fill" fill={context.theme_settings ? context.theme_settings.accent_color.value : ''} xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z" />
                                            </svg> :
                                            <svg width="28px" height="28px" viewBox="0 0 16 16" className="bi bi-heart" fill={context.theme_settings ? context.theme_settings.accent_color.value : ''} xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" d="M8 2.748l-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z" />
                                            </svg>}
                                    </div>
                                </Link>
                            );
                        } else {
                            return (
                                <Link to={EcommerceRoutePath.PRODUCT_DETAIL.replace(":seller_slug", value.mp_seller.slug).replace(":product_slug", value.slug)} className="text-decoration-none" key={value.id}>
                                    <div className="py-2 h-100">
                                        <div className="bg-white shadow-graph position-relative rounded p-2 h-100">
                                            <CustomImage folder={PublicStorageFolderPath.products} filename={value.mp_product_images[0].filename} alt={value.mp_product_images[0].filename} className="object-fit-cover" style={{ maxWidth: '100%' }} />
                                            {(value.type === 'auction' && moment(new Date()).isBefore(moment(value?.active_start_date))) &&
                                                <CountdownAuction targetDate={value?.active_start_date} t={t} type={"start"} />
                                            }
                                            {(value.type === 'auction' && moment(new Date()).isBetween(moment(value?.active_start_date), moment(value?.active_end_date))) &&
                                                <CountdownAuction targetDate={value?.active_end_date} t={t} type={"end"} />
                                            }
                                            <TextTruncate lineClamp={2} className="m-0"><ManualSwitchLanguage data={value.mp_product_informations} langAttr={"language_code"} valueAttr={"name"} /></TextTruncate>
                                            <div className="d-flex align-items-center">
                                                <img src={`/images/seller-icon.png`} className="mr-2" style={{ height: 20 }} />
                                                <p
                                                    className="m-0 font-size-80-percent color-374650"
                                                    onMouseOver={event => event.currentTarget.textContent = value.mp_seller.name}
                                                    onMouseOut={event => event.currentTarget.textContent = value.mp_seller.city}
                                                >{value.mp_seller.city}</p>
                                            </div>
                                            {value.is_sale_price &&
                                                <div className="mt-2">
                                                    <span className="font-size-80-percent bgc-accent-color  rounded px-1">{PriceRatio(value.mp_product_skus.find(value1 => value1.is_main).normal_price, value.mp_product_skus.find(value1 => value1.is_main).price)}</span>
                                                    <span className="font-size-80-percent color-374650 px-1"><del>Rp. {CurrencyFormat(value.mp_product_skus.find(value1 => value1.is_main).normal_price)}</del></span>
                                                </div>}
                                            <p className="m-0 color-374650 font-weight-bold">Rp. {CurrencyFormat(value.mp_product_skus.find(value1 => value1.is_main).price)}</p>
                                            <div className="d-flex align-items-center">
                                                {props.data.show_ratings === "yes" &&
                                                    <div>
                                                        <i className="far fa-star accent-color" />
                                                        <span className="font-size-80-percent color-374650 mt-1 ml-1">{value.rating ? value.rating : "-"}</span>
                                                        <span className="font-size-80-percent color-374650 mt-1 ml-1">|</span>
                                                    </div>
                                                }
                                                {props.data.show_unit_sold === "yes" && <div>
                                                    <span className="font-size-80-percent color-374650 mt-1 ml-1">{t('product_detail.sold')} {value.sold_product}</span>
                                                </div>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )
                        }
                    })}
                </div>

                {(data && data.data.length === 0) &&
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

                {(data && data.last_page > 0) &&
                    <div className="d-flex justify-content-end mt-3">
                        <Paginate
                            pageCount={data ? data.last_page : 1}
                            onPageChange={selected => set_current_page(selected)}
                            initialPage={current_page}
                        />
                    </div>}
            </>
        )}</MyContext.Consumer>
    );
}

export default withTranslation()(ProductList);



const CountdownAuction = ({ targetDate, t, type }) => {

    return (
        <div className='d-flex justify-content-center'>
            <div className='shadow-graph bg-white p-2 text-center position-absolute' style={{ top: "40%", width: "90%", height: "20%" }}>
                <p className='font-size-60-percent font-weight-bold text-dark'> {type === "start" ? t('auction.start_id') : t('auction.ends_id')} : </p>
                <Countdown
                    date={targetDate}
                    renderer={({ days, hours, minutes, seconds }) => (
                        <div className='d-flex text-danger' >
                            <p className='font-size-60-percent'>
                                <strong className='font-weight-bold'>{days} </strong>
                                {t('auction.day')}
                            </p>
                            <p>|</p>
                            <p className='font-size-60-percent'>
                                <strong className='font-weight-bold'>{hours} </strong>
                                {t('auction.hour')}
                            </p>
                            <p>|</p>
                            <p className='font-size-60-percent'>
                                <strong className='font-weight-bold'>{minutes} </strong>
                                {t('auction.minute')}
                            </p>
                            <p>|</p>
                            <p className='font-size-60-percent'>
                                <strong className='font-weight-bold'>{seconds} </strong>
                                {t('auction.second')}
                            </p>
                        </div>
                    )}
                />
            </div>
        </div >
    );
};

