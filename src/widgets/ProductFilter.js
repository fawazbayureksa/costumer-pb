import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import InputRange from "react-input-range";
import "react-input-range/lib/bundle/react-input-range.css";
import CurrencyFormat from "../components/helpers/CurrencyFormat";
import axios from "axios";
import Config from "../components/axios/Config";
import TreeView from "../components/helpers/tree-view/TreeView";
import $ from "jquery";
import { withTranslation } from "react-i18next";
import EcommerceRoutePath from "../pages/e-commerce/EcommerceRoutePath";
import { PureComponent } from "react";

/**
 * 
 * @param {object} data data for this component
 */
const ProductFilter = (props) => {
    const history = useHistory();
    let params = new URLSearchParams(window.location.search);
    let querySearch = params.get('search');
    let queryMinPrice = params.get('min_price');
    let queryMaxPrice = params.get('max_price');
    let queryDeliveryMethod = params.get('delivery_method');
    let queryArea = params.get('area');
    let queryRating = params.get('rating');
    let queryCategory = params.get('category');

    const [courierOptions, setCourierTypeOptions] = useState([]);
    const [sellerAreaOptions, setSellerAreaOptions] = useState([]);
    const [categoriesOptions, setCategoriesOptions] = useState([]);

    const [changingFilter, setChangingFilter] = useState(false);

    const [temp_search, set_temp_search] = useState(querySearch || '');
    const [search, set_search] = useState(querySearch || '');
    const [price, set_price] = useState({
        min: parseInt(queryMinPrice) || 1,
        max: parseInt(queryMaxPrice) || 50000000,
    });
    const [delivery_method, set_delivery_method] = useState(queryDeliveryMethod || '');
    const [area, set_area] = useState(queryArea || '');
    const [rating, set_rating] = useState(queryRating || '');
    const [category, set_category] = useState(queryCategory || props.data.mp_category_slug || '');
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [popup, setPopup] = useState(false);

    const responsiveView = () => {
        let widthOfWindow = window.innerWidth;
        setWindowWidth(widthOfWindow);
    }

    useEffect(() => {
        getCourierTypeOptions();
        getSellerAreaOptions();
        getCategoriesOptions();
        window.addEventListener('resize', responsiveView);
        return () => {
            window.removeEventListener('resize', responsiveView);
        };
    }, [])

    useEffect(() => {
        generateFilters();
    }, [search, price, delivery_method, area, rating, category]);

    const getCourierTypeOptions = () => {
        axios.get(`${process.env.REACT_APP_BASE_API_URL}ecommerce/products/delivery-methods/get`, Config()).then(response => {
            console.log("courier type..")
            console.log(response.data.data)
            setCourierTypeOptions(response.data.data);
        }).catch(error => {
            console.error(error);
        }).finally(() => {
            //
        });
    }

    const getSellerAreaOptions = () => {
        axios.get(`${process.env.REACT_APP_BASE_API_URL}ecommerce/products/seller-area/get`, Config()).then(response => {
            setSellerAreaOptions(response.data.data);
        }).catch(error => {
            console.error(error);
        }).finally(() => {
            //
        });
    }

    const getCategoriesOptions = () => {
        axios.get(`${process.env.REACT_APP_BASE_API_URL}ecommerce/products/categories/get`, Config()).then(response => {
            console.log(response.data.data)
            setCategoriesOptions(response.data.data);
        }).catch(error => {
            console.error(error);
        }).finally(() => {
            //
        });
    }

    const generateFilters = () => {
        setChangingFilter(true);

        let urlParams = new URLSearchParams(window.location.search)
        urlParams.set("search", search);
        urlParams.set(`min_price`, price.min);
        urlParams.set(`max_price`, price.max);
        urlParams.set(`delivery_method`, delivery_method);
        urlParams.set(`area`, area);
        urlParams.set(`rating`, rating);
        urlParams.set(`category`, category);

        history.push({
            pathname: history.location.pathname,
            search: urlParams.toString()
        });
    }

    const categoryClicked = (event, value) => {
        $('.tecta-trv-v1 li').css('font-weight', 'normal');
        event.currentTarget.style.fontWeight = 'bold';
        set_category(value.slug);
    }

    const deliveryClicked = (event, value) => {
        $('.tecta-trv-v1 li').css('font-weight', 'normal');
        event.currentTarget.style.fontWeight = 'bold';
        set_delivery_method(value.key);
    }

    const { t } = props;

    return (
        <>
            <style>{`
                        .input-range__label-container {
                            display: none;
                        }
                        a[aria-expanded=false] .fa-caret-up {
                            display: none;
                        }
                        a[aria-expanded=true] .fa-caret-down {
                            display: none;
                        }
                    `}</style>
            {windowWidth <= 767 ?
                <>
                    {popup ?
                        <div className="position-absolute bg-white px-3" style={{ left: 0, right: 0, top: 0, bottom: 0, zIndex: 2000 }}>
                            <div className="d-flex justify-content-between align-items-center my-3">
                                <h6 onClick={event => setPopup(false)} className="m-0 color-374650">Close</h6>
                                {changingFilter && <h6 onClick={event => { setChangingFilter(false); history.push(EcommerceRoutePath.PRODUCTS) }} className="m-0 color-374650">{t('product_filter.clear')}</h6>}
                            </div>
                            {props.data && props.data.cards.map((value, index) => {
                                if (props.data.layout === 'type_1') {
                                    if (value.type === 'enable_search' && value.is_enabled) {
                                        return (
                                            <div className="input-group mb-3">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Search"
                                                    value={temp_search}
                                                    onChange={event => set_temp_search(event.target.value)}
                                                    onKeyUp={event => {
                                                        if (event.keyCode === 13) set_search(temp_search);
                                                    }}
                                                />
                                                <div className="input-group-append" style={{ cursor: 'pointer' }} onClick={event => set_search(temp_search)}>
                                                    <span className="input-group-text">
                                                        <i className="fas fa-search" />
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    } else if (value.type === 'enable_category' && value.is_enabled) {
                                        return (
                                            <div className="mb-3 bgc-F0F6F9 p-3">
                                                <p className="mb-2 color-333333">{t('product_filter.categories')}</p>
                                                <p
                                                    className={`m-0  ${(category === '' || category === null) ? 'color-333333 font-weight-bold' : ''}`}
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={event => {
                                                        $('.tecta-trv-v1 li').css('font-weight', 'normal');
                                                        set_category('');
                                                    }}
                                                >{t('product_filter.all_categories')}</p>
                                                <div className="overflow-auto" style={{ maxHeight: 400 }}>
                                                    <TreeView
                                                        data={categoriesOptions}
                                                        childAttr={'categories'}
                                                        nameAttr={'name'}
                                                        className={" color-333333"}
                                                        margin={"0.5rem"}
                                                        onClick={categoryClicked}
                                                        onClickNested={categoryClicked}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    } else if (value.type === 'enable_area' && value.is_enabled) {
                                        return (
                                            <div className="mb-3 bgc-F0F6F9 p-3">
                                                <p className="mb-2 color-333333">{t('product_filter.area')}</p>
                                                <p
                                                    className={`mb-2  ${(area === '' || area === null) ? 'color-333333 font-weight-bold' : ''}`}
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={event => set_area('')}
                                                >{t('product_filter.all_area')}</p>
                                                <div className="overflow-auto" style={{ maxHeight: 400 }}>
                                                    {sellerAreaOptions.map((value1, index1, array1) => (
                                                        <p
                                                            className={`${index1 === array1.length - 1 ? '' : 'mb-2'}  ${(area === value1.value) ? 'color-333333 font-weight-bold' : ''}`}
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={event => set_area(value1.value)}
                                                        >{value1.label}</p>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    } else if (value.type === 'enable_price' && value.is_enabled) {
                                        return (
                                            <div className="mb-3 bgc-F0F6F9 p-3">
                                                <p className="mb-2 ">Range: Rp{CurrencyFormat(price.min.toString())} - Rp{CurrencyFormat(price.max.toString())}</p>
                                                <div className="px-2">
                                                    <InputRange
                                                        minValue={1}
                                                        maxValue={50000000}
                                                        formatLabel={value1 => `Rp${CurrencyFormat(value1.toString())}`}
                                                        onChange={data => set_price(data)}
                                                        value={price}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    } else if (value.type === 'enable_delivery_method' && value.is_enabled) {
                                        return (
                                            <div className="mb-3 bgc-F0F6F9 p-3">
                                                <p className="mb-2 color-333333">{t('product_filter.delivery_method')}</p>
                                                <p
                                                    className={`mb-2  ${(delivery_method === '' || delivery_method === null) ? 'color-333333 font-weight-bold' : ''}`}
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={event => {
                                                        set_delivery_method('')
                                                        $('.tecta-trv-v1 li').css('font-weight', 'normal');
                                                    }}
                                                >{t('product_filter.all_delivery')}</p>
                                                <div className="overflow-auto" style={{ maxHeight: 400 }}>
                                                    <TreeView
                                                        data={courierOptions}
                                                        childAttr={'mp_courier_types'}
                                                        nameAttr={'name'}
                                                        className={" color-333333"}
                                                        margin={"0.5rem"}
                                                        onClick={deliveryClicked}
                                                        onClickNested={deliveryClicked}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    } else if (value.type === 'enable_rating' && value.is_enabled) {
                                        return (
                                            <div className="mb-3 bgc-F0F6F9 p-3">
                                                <p className="mb-2 color-333333">{t('product_filter.rating')}</p>
                                                <p
                                                    className={`mb-2  ${(rating === '' || rating === null) ? 'color-333333 font-weight-bold' : ''}`}
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={event => set_rating('')}
                                                >{t('product_filter.all_rating')}</p>
                                                {['5', '4', '3'].map((value1, index1, array1) => (
                                                    <p
                                                        className={`${index1 === array1.length - 1 ? '' : 'mb-2'}  ${(rating === value1) ? 'color-333333 font-weight-bold' : ''}`}
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={event => set_rating(value1)}
                                                    >{value1} {t('product_filter.rating_up')}</p>
                                                ))}
                                            </div>
                                        );
                                    }
                                } else if (props.data.layout === 'type_2') {
                                    if (value.type === 'enable_search' && value.is_enabled) {
                                        return (
                                            <div className="input-group mb-3">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Search"
                                                    value={temp_search}
                                                    onChange={event => set_temp_search(event.target.value)}
                                                    onKeyUp={event => {
                                                        if (event.keyCode === 13) set_search(temp_search);
                                                    }}
                                                />
                                                <div className="input-group-append" style={{ cursor: 'pointer' }} onClick={event => set_search(temp_search)}>
                                                    <span className="input-group-text">
                                                        <i className="fas fa-search" />
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    } else if (value.type === 'enable_category' && value.is_enabled) {
                                        return (
                                            <div className="mb-3 bgc-F0F6F9 p-3">
                                                <p className="mb-2 color-333333">{t('product_filter.categories')}</p>
                                                <p
                                                    className={`m-0  ${(category === '' || category === null) ? 'color-333333 font-weight-bold' : ''}`}
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={event => {
                                                        $('.tecta-trv-v1 li').css('font-weight', 'normal');
                                                        set_category('');
                                                    }}
                                                >{t('product_filter.all_categories')}</p>
                                                <div className="overflow-auto" style={{ maxHeight: 400 }}>
                                                    <TreeView
                                                        data={categoriesOptions}
                                                        childAttr={'categories'}
                                                        nameAttr={'name'}
                                                        className={" color-333333"}
                                                        margin={"0.5rem"}
                                                        onClick={categoryClicked}
                                                        onClickNested={categoryClicked}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    } else if (value.type === 'enable_area' && value.is_enabled) {
                                        return (
                                            <div className="mb-3 bgc-F0F6F9 p-3">
                                                <p className="mb-2 color-333333">{t('product_filter.area')}</p>
                                                <p
                                                    className={`mb-2  ${(area === '' || area === null) ? 'color-333333 font-weight-bold' : ''}`}
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={event => set_area('')}
                                                >{t('product_filter.all_area')}</p>
                                                <div className="overflow-auto" style={{ maxHeight: 400 }}>
                                                    {sellerAreaOptions.map((value1, index1, array1) => (
                                                        <p
                                                            className={`${index1 === array1.length - 1 ? '' : 'mb-2'}  ${(area === value1.value) ? 'color-333333 font-weight-bold' : ''}`}
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={event => set_area(value1.value)}
                                                        >{value1.label}</p>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    } else if (value.type === 'enable_price' && value.is_enabled) {
                                        return (
                                            <div className="mb-3 bgc-F0F6F9 p-3">
                                                <p className="mb-2 ">Range: Rp{CurrencyFormat(price.min.toString())} - Rp{CurrencyFormat(price.max.toString())}</p>
                                                <div className="px-2">
                                                    <InputRange
                                                        minValue={1}
                                                        maxValue={50000000}
                                                        formatLabel={value1 => `Rp${CurrencyFormat(value1.toString())}`}
                                                        onChange={data => set_price(data)}
                                                        value={price}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    } else if (value.type === 'enable_delivery_method' && value.is_enabled) {
                                        return (
                                            <div className="mb-3 bgc-F0F6F9 p-3">
                                                <p className="mb-2 color-333333">{t('product_filter.delivery_method')}</p>
                                                <p
                                                    className={`mb-2  ${(delivery_method === '' || delivery_method === null) ? 'color-333333 font-weight-bold' : ''}`}
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={event => {
                                                        set_delivery_method('')
                                                        $('.tecta-trv-v1 li').css('font-weight', 'normal');
                                                    }}
                                                >{t('product_filter.all_delivery')}</p>
                                                <div className="overflow-auto" style={{ maxHeight: 400 }}>
                                                    <TreeView
                                                        data={courierOptions}
                                                        childAttr={'mp_courier_types'}
                                                        nameAttr={'name'}
                                                        className={" color-333333"}
                                                        margin={"0.5rem"}
                                                        onClick={deliveryClicked}
                                                        onClickNested={deliveryClicked}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    } else if (value.type === 'enable_rating' && value.is_enabled) {
                                        return (
                                            <div className="mb-3 bgc-F0F6F9 p-3">
                                                <p className="mb-2 color-333333">{t('product_filter.rating')}</p>
                                                <p
                                                    className={`mb-2  ${(rating === '' || rating === null) ? 'color-333333 font-weight-bold' : ''}`}
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={event => set_rating('')}
                                                >{t('product_filter.all_rating')}</p>
                                                {['5', '4', '3'].map((value1, index1, array1) => (
                                                    <p
                                                        className={`${index1 === array1.length - 1 ? '' : 'mb-2'}  ${(rating === value1) ? 'color-333333 font-weight-bold' : ''}`}
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={event => set_rating(value1)}
                                                    >{value1} {t('product_filter.rating_up')}</p>
                                                ))}
                                            </div>
                                        );
                                    }
                                } else {
                                    return null;
                                }
                            })}
                        </div> :
                        <div className="fixed-bottom text-center bg-white shadow-graph p-2" style={{ left: '35%', right: '35%', bottom: 30, zIndex: 2000, borderRadius: '2rem' }}>
                            <p onClick={event => setPopup(true)} className="m-0  color-374650 font-weight-semi-bold">Filter</p>
                        </div>}
                </> :
                <div className="w-100">
                    {changingFilter &&
                        <div className="clear text-right mb-3">
                            <p onClick={event => {
                                set_category("")
                                set_area("")
                                set_delivery_method("")
                                set_rating("")
                                history.push(EcommerceRoutePath.PRODUCTS)
                            }} className="small">{t('product_filter.clear')}</p>
                        </div>}
                    {props.data && props.data.cards.map((value, index) => {
                        if (props.data.layout === 'type_1') {
                            if (value.type === 'enable_search' && value.is_enabled) {
                                return (
                                    <div className="input-group mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search"
                                            value={temp_search}
                                            onChange={event => set_temp_search(event.target.value)}
                                            onKeyUp={event => {
                                                if (event.keyCode === 13) set_search(temp_search);
                                            }}
                                        />
                                        <div className="input-group-append" style={{ cursor: 'pointer' }} onClick={event => set_search(temp_search)}>
                                            <span className="input-group-text">
                                                <i className="fas fa-search" />
                                            </span>
                                        </div>
                                    </div>
                                );
                            } else if (value.type === 'enable_category' && value.is_enabled) {
                                return (
                                    <div className="mb-3 bgc-F0F6F9 p-3">
                                        <p className="mb-2 color-333333">{t('product_filter.categories')}</p>
                                        <p
                                            className={`m-0  ${(category === '' || category === null) ? 'color-333333 font-weight-bold' : ''}`}
                                            style={{ cursor: 'pointer' }}
                                            onClick={event => {
                                                $('.tecta-trv-v1 li').css('font-weight', 'normal');
                                                set_category('');
                                            }}
                                        >{t('product_filter.all_categories')}</p>
                                        <div className="overflow-auto" style={{ maxHeight: 400 }}>
                                            <TreeView
                                                data={categoriesOptions}
                                                childAttr={'categories'}
                                                nameAttr={'name'}
                                                className={" color-333333"}
                                                margin={"0.5rem"}
                                                onClick={categoryClicked}
                                                onClickNested={categoryClicked}
                                            />
                                        </div>
                                    </div>
                                );
                            } else if (value.type === 'enable_area' && value.is_enabled) {
                                return (
                                    <div className="mb-3 bgc-F0F6F9 p-3">
                                        <p className="mb-2 color-333333">{t('product_filter.area')}</p>
                                        <p
                                            className={`mb-2  ${(area === '' || area === null) ? 'color-333333 font-weight-bold' : ''}`}
                                            style={{ cursor: 'pointer' }}
                                            onClick={event => set_area('')}
                                        >{t('product_filter.all_area')}</p>
                                        <div className="overflow-auto" style={{ maxHeight: 400 }}>
                                            {sellerAreaOptions.map((value1, index1, array1) => (
                                                <p
                                                    className={`${index1 === array1.length - 1 ? '' : 'mb-2'}  ${(area === value1.value) ? 'color-333333 font-weight-bold' : ''}`}
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={event => set_area(value1.value)}
                                                >{value1.label}</p>
                                            ))}
                                        </div>
                                    </div>
                                );
                            } else if (value.type === 'enable_price' && value.is_enabled) {
                                return (
                                    <div className="mb-3 bgc-F0F6F9 p-3">
                                        <p className="mb-2 ">Range: Rp{CurrencyFormat(price.min.toString())} - Rp{CurrencyFormat(price.max.toString())}</p>
                                        <div className="px-2">
                                            <InputRange
                                                minValue={1}
                                                maxValue={50000000}
                                                formatLabel={value1 => `Rp${CurrencyFormat(value1.toString())}`}
                                                onChange={data => set_price(data)}
                                                value={price}
                                            />
                                        </div>
                                    </div>
                                );
                            } else if (value.type === 'enable_delivery_method' && value.is_enabled) {
                                return (
                                    <div className="mb-3 bgc-F0F6F9 p-3">
                                        <p className="mb-2 color-333333">{t('product_filter.delivery_method')}</p>
                                        <p
                                            className={`mb-2  ${(delivery_method === '' || delivery_method === null) ? 'color-333333 font-weight-bold' : ''}`}
                                            style={{ cursor: 'pointer' }}
                                            onClick={event => {
                                                set_delivery_method('')
                                                $('.tecta-trv-v1 li').css('font-weight', 'normal');
                                            }}
                                        >{t('product_filter.all_delivery')}</p>
                                        <div>
                                            <TreeView
                                                data={courierOptions}
                                                childAttr={'mp_courier_types'}
                                                nameAttr={'name'}
                                                className={" color-333333"}
                                                margin={"0.5rem"}
                                                onClick={deliveryClicked}
                                                onClickNested={deliveryClicked}
                                            />
                                        </div>
                                    </div>
                                );
                            } else if (value.type === 'enable_rating' && value.is_enabled) {
                                return (
                                    <div className="mb-3 bgc-F0F6F9 p-3">
                                        <p className="mb-2 color-333333">{t('product_filter.rating')}</p>
                                        <p
                                            className={`mb-2  ${(rating === '' || rating === null) ? 'color-333333 font-weight-bold' : ''}`}
                                            style={{ cursor: 'pointer' }}
                                            onClick={event => set_rating('')}
                                        >{t('product_filter.all_rating')}</p>
                                        {['5', '4', '3'].map((value1, index1, array1) => (
                                            <p
                                                className={`${index1 === array1.length - 1 ? '' : 'mb-2'}  ${(rating === value1) ? 'color-333333 font-weight-bold' : ''}`}
                                                style={{ cursor: 'pointer' }}
                                                onClick={event => set_rating(value1)}
                                            >{value1} {t('product_filter.rating_down')}</p>
                                        ))}
                                    </div>
                                );
                            }
                        } else if (props.data.layout === 'type_2') {
                            if (value.type === 'enable_search' && value.is_enabled) {
                                return (
                                    <div className="input-group mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search"
                                            value={temp_search}
                                            onChange={event => set_temp_search(event.target.value)}
                                            onKeyUp={event => {
                                                if (event.keyCode === 13) set_search(temp_search);
                                            }}
                                        />
                                        <div className="input-group-append" style={{ cursor: 'pointer' }} onClick={event => set_search(temp_search)}>
                                            <span className="input-group-text">
                                                <i className="fas fa-search" />
                                            </span>
                                        </div>
                                    </div>
                                );
                            } else if (value.type === 'enable_category' && value.is_enabled) {
                                return (
                                    <div className="border-bottom py-3">
                                        <a className="d-flex text-decoration-none" href={`#categories-${props.data.layout}`} data-toggle="collapse" aria-expanded="false">
                                            <p className="mb-2 font-weight-bold color-333333">{t('product_filter.categories')}</p>
                                            <div className="ml-auto">
                                                <i className="fas fa-caret-down color-97A0AE" />
                                                <i className="fas fa-caret-up color-97A0AE" />
                                            </div>
                                        </a>
                                        <form id={`categories-${props.data.layout}`} className="collapse m-0 p-0">
                                            {
                                                categoriesOptions.map((data, index) =>
                                                    <div key={index}>
                                                        <div className="form-check d-flex my-2">
                                                            <input className="form-check-input" type="checkbox"
                                                                checked={category === data.slug}
                                                                onChange={event => category === data.slug ? set_category("") : set_category(data.slug)}
                                                            />
                                                            <a className="d-flex w-100" href={`#categories-level-${data.id}`} data-toggle="collapse" aria-expanded="false">
                                                                <label className="form-check-label ">
                                                                    {data.name}
                                                                </label>
                                                                <div className="ml-auto">
                                                                    <i className="fas fa-caret-down color-97A0AE" />
                                                                    <i className="fas fa-caret-up color-97A0AE" />
                                                                </div>
                                                            </a>
                                                        </div>
                                                        <div id={`categories-level-${data.id}`} className="collapse ml-3 p-0 m-0">
                                                            {
                                                                data.categories && data.categories.map((data2, index2) =>
                                                                    <Children
                                                                        index={index2}
                                                                        name={data2.name}
                                                                        data={data2}
                                                                        category={category}
                                                                        set_category={set_category} />
                                                                )
                                                            }
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        </form>
                                    </div>
                                );
                            } else if (value.type === 'enable_area' && value.is_enabled) {
                                return (
                                    <div className="border-bottom py-3">
                                        <a href={`#area-${props.data.type_layout}`} className="d-flex text-decoration-none color-212529 mr-2" data-toggle="collapse" aria-expanded="false">
                                            <p className="mb-2 font-weight-bold color-333333">{t('product_filter.area')}</p>
                                            <div className="ml-auto">
                                                <i className="fas fa-caret-down color-97A0AE" />
                                                <i className="fas fa-caret-up color-97A0AE" />
                                            </div>
                                        </a>
                                        <form id={`area-${props.data.type_layout}`} className="collapse m-0 p-0">
                                            {
                                                sellerAreaOptions.map((data, index) =>
                                                    <div key={index}>
                                                        <div className="form-check d-flex my-2">
                                                            <input className="form-check-input" type="checkbox"
                                                                checked={area == data.value}
                                                                onChange={event => area === data.value ? set_area("") : set_area(data.value)}
                                                            />
                                                            <label className="form-check-label ">
                                                                {data.label}
                                                            </label>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        </form>
                                    </div>
                                );
                            } else if (value.type === 'enable_price' && value.is_enabled) {
                                return (
                                    <div className="border-bottom py-3">
                                        <a href={`#price-${props.data.type_layout}`} className="d-flex text-decoration-none color-212529 mr-2" data-toggle="collapse" aria-expanded="false">
                                            <p className="mb-2 font-weight-bold color-333333">{t('cart.price')}</p>
                                            <div className="ml-auto">
                                                <i className="fas fa-caret-down color-97A0AE" />
                                                <i className="fas fa-caret-up color-97A0AE" />
                                            </div>
                                        </a>
                                        <div id={`price-${props.data.type_layout}`} className="collapse" >
                                            <div className="mb-2 px-2">
                                                <InputRange
                                                    className="accent-color"
                                                    minValue={1}
                                                    maxValue={50000000}
                                                    formatLabel={value1 => `Rp${CurrencyFormat(value1.toString())}`}
                                                    onChange={data => set_price(data)}
                                                    value={price}
                                                />
                                            </div>
                                            <div className="mb-2  justify-content-between d-flex">
                                                <label>Rp</label>
                                                <input style={{ maxWidth: 100 }} className="form-control" type="text" value={price.min} />
                                                <label>-</label>
                                                <input style={{ maxWidth: 100 }} className="form-control" type="text" value={price.max} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            } else if (value.type === 'enable_delivery_method' && value.is_enabled) {
                                return (
                                    <div className="border-bottom py-3">
                                        <a href={`#delivery-method-${props.data.type_layout}`} className="d-flex text-decoration-none color-212529 mr-2" data-toggle="collapse" aria-expanded="false">
                                            <p className="mb-2 font-weight-bold color-333333">{t('product_filter.delivery_method')}</p>
                                            <div className="ml-auto">
                                                <i className="fas fa-caret-down color-97A0AE" />
                                                <i className="fas fa-caret-up color-97A0AE" />
                                            </div>
                                        </a>
                                        <form id={`delivery-method-${props.data.type_layout}`} className="collapse m-0 p-0">
                                            {
                                                courierOptions.map((data, index) =>
                                                    <div key={index}>
                                                        <div className="form-check d-flex my-2">
                                                            <input className="form-check-input" type="checkbox"
                                                                checked={delivery_method == data.key}
                                                                onChange={event => delivery_method === data.key ? set_delivery_method("") : set_delivery_method(data.key)}
                                                            />
                                                            <label className="form-check-label ">
                                                                {data.name}
                                                            </label>
                                                            <div className="ml-auto">
                                                                <a href={`#delivery-method-type-${data.id}`} className="text-decoration-none color-212529 mr-2" data-toggle="collapse" aria-expanded="false">
                                                                    <i className="fas fa-caret-down color-97A0AE" />
                                                                    <i className="fas fa-caret-up color-97A0AE" />
                                                                </a>
                                                            </div>
                                                        </div>
                                                        <div id={`delivery-method-type-${data.id}`} className="collapse ml-3 p-0 m-0">
                                                            {
                                                                data.mp_courier_types && data.mp_courier_types.map((data2, index2) =>
                                                                    <div className="form-check d-flex my-2">
                                                                        <input className="form-check-input" type="checkbox"
                                                                            checked={delivery_method == data2.key}
                                                                            onChange={event => delivery_method == data2.key ? set_delivery_method("") : set_delivery_method(data2.key)}
                                                                        />
                                                                        <label className="form-check-label ">
                                                                            {data2.name}
                                                                        </label>
                                                                    </div>
                                                                )
                                                            }
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        </form>
                                    </div>
                                );
                            } else if (value.type === 'enable_rating' && value.is_enabled) {
                                return (
                                    <div className="border-bottom py-3">
                                        <a href={`#rating-${props.data.type_layout}`} className="d-flex text-decoration-none color-212529 mr-2" data-toggle="collapse" aria-expanded="false">
                                            <p className="mb-2 font-weight-bold color-333333">{t('product_filter.rating')}</p>
                                            <div className="ml-auto">
                                                <i className="fas fa-caret-down color-97A0AE" />
                                                <i className="fas fa-caret-up color-97A0AE" />
                                            </div>
                                        </a>
                                        <form id={`rating-${props.data.type_layout}`} className="collapse m-0 p-0">
                                            {
                                                [5, 4, 3, 2, 1].map((data, index) =>
                                                    <div key={index}>
                                                        <div className="form-check d-flex my-2">
                                                            <input className="form-check-input" type="checkbox"
                                                                checked={rating == data}
                                                                onChange={event => rating === data ? set_rating("") : set_rating(data)}
                                                            />
                                                            {[5, 4, 3, 2, 1].map(data2 =>
                                                                data >= data2 ? <i className="far fa-star accent-color " /> : ""
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        </form>
                                    </div>
                                );
                            }
                        } else {
                            return null;
                        }
                    })}
                </div>}
        </>
    );
}
class Children extends PureComponent {
    render() {
        return (
            <div key={this.props.index}>
                <div className="form-check d-flex my-2 ml-3">
                    <input className="form-check-input" type="checkbox" value="true"
                        checked={this.props.category === this.props.data.slug}
                        onChange={event => this.props.category === this.props.data.slug ? this.props.set_category("") : this.props.set_category(this.props.data.slug)}
                        name="edit_value" />
                    <a className="d-flex w-100 text-decoration-none" href={`#categories-level-${this.props.data.id}`} data-toggle="collapse" aria-expanded="false">
                        <label className="form-check-label ">
                            {this.props.name}
                        </label>
                        {
                            this.props.data.categories &&
                            <div className="ml-auto">
                                <i className="fas fa-caret-down color-97A0AE" />
                                <i className="fas fa-caret-up color-97A0AE" />
                            </div>
                        }
                    </a>
                </div>
                <div id={`categories-level-${this.props.data.id}`} className="ml-3 p-0 m-0 collapse">
                    {
                        this.props.data.categories && this.props.data.categories.map((data2, index2) =>
                            <Children
                                index={index2}
                                name={data2.name}
                                data={data2}
                                category={this.props.category}
                                set_category={this.props.set_category} />
                        )
                    }
                </div>
            </div>
        )
    }
}

export default withTranslation()(ProductFilter)
