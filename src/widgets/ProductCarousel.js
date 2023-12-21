import React, { useEffect, useState } from "react";
import axios from "axios";
import Config from "../components/axios/Config";
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import TextTruncate from "../components/helpers/TextTruncate";
import EcommerceRoutePath from "../pages/e-commerce/EcommerceRoutePath";
import { Link } from "react-router-dom";
import ManualSwitchLanguage from "../components/helpers/ManualSwitchLanguage";
import CurrencyFormat from "../components/helpers/CurrencyFormat";
import $ from "jquery";
import PriceRatio from "../components/helpers/PriceRatio";
import CustomImage, { PublicStorageFolderPath } from "../components/helpers/CustomImage";
import SwalToast from "../components/helpers/SwalToast";
import Cookie from "js-cookie";
import update from "immutability-helper";
import { useTranslation } from "react-i18next";
import MyContext from "../components/MyContext";

/**
 * 
 * @param {object} data data for this component
 */
const ProductCarousel = (props) => {
    const [products, set_products] = useState([]);
    const [active, setActive] = useState(false)
    const [t] = useTranslation()

    // const responsiveView = () => {
    //     imgSquare();
    // }

    useEffect(() => {
        getProducts();
        // window.addEventListener('resize', responsiveView);
        // return () => {
        //     window.removeEventListener('resize', responsiveView);
        // };
    }, []);

    const getProducts = () => {
        let params = {
            order_by: 'date',
            order: 'desc',
            length: props.data.product_per_page,
            page: 1,
            type: props.data.type,
            custom_product_url: props.data.custom_product_url
        }
        if (props.data.mp_category_slug) {
            params = { ...params, category: props.data.mp_category_slug }
        }
        axios.get(`${process.env.REACT_APP_BASE_API_URL}ecommerce/products/get`, Config({}, params)).then(response => {
            set_products(response.data.data.data);
        }).catch(error => {
            console.error(error);
        }).finally(() => {
            // imgSquare();
        });
    }

    const responsive = {
        desktop: {
            breakpoint: { max: 3000, min: 1024 },
            items: props.data.number_of_products,
        },
        tablet: {
            breakpoint: { max: 1024, min: 464 },
            items: props.data.number_of_products,
        },
        mobile: {
            breakpoint: { max: 464, min: 0 },
            items: props.data.number_of_products,
        }
    };

    // const imgSquare = () => {
    //     console.log('here')
    //     $('.product-carousel-image').css('height', $('.product-carousel-image').width())
    //     console.log("width", $('.product-carousel-image').width())
    // }

    // const CustomRightArrow = ({ onClick, ...rest }) => {
    //     const {
    //       onMove,
    //       carouselState: { currentSlide, deviceType }
    //     } = rest;
    //     // onMove means if dragging or swiping in progress.
    //     return <button onClick={() => onClick()} />;
    // };

    const addWishlist = (e, index, product_id, value) => {
        e.preventDefault()
        if (!Cookie.get('token')) {
            SwalToast.fire({ icon: 'info', title: t('product_detail.do_login_first') });
            return
        }

        axios.post(`${process.env.REACT_APP_BASE_API_URL}my-wishlist/add`, {
            product_id: product_id
        }, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        })).then(response => {
            let product = update(products, {
                [index]: {
                    mp_wishlist: { $set: value }
                }
            })
            set_products(product)
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
    const onScroll = (prev, next) => {
        if (next.currentSlide !== 0) {
            setActive(true)
        } else {
            setActive(false)
        }
    }


    return (
        <div className="overflow-hidden">
            <style>{`
                .image-visible {
                    animation: fadein 3s ease; 
                    visibility: hidden;
                }
                @keyframes fadeIn {
                    0% {
                        opacity: 0;
                    }
                    100% {
                        opacity: 1;
                    }
                }
                .product-cart {
                    height: 420px;
                    margin-top: -20px;
                }
                .product-carousel-image {
                    height: auto;
                }
                .product-carousel-image {
                    max-width: 100%;
                }
                .image-card {
                    height: 240px;
                }
                @media (max-width: 767.98px) {
                    .product-cart {
                        height: 320px;
                        margin-top: 5px;
                    }
                    .product-carousel-image {
                        height: auto;
                    }
                    .image-card {
                        height: 170px;
                    }
                }
            `}</style>

            <div id="product-comp"
                style={{
                    backgroundColor: props.data.display_carousel ? props.data.background_color : "",
                    width: "100%"
                }}
            >
                {props.data.display_carousel &&
                    <div
                        className={`position-absolute`}
                        style={{ width: `${props.data.banner_layout ? props.data.banner_layout[0] : "auto"}}` }}>
                        <CustomImage
                            filename={props.data.banner_image}
                            folder={PublicStorageFolderPath.cms}
                            alt={props.data.banner_image}
                            className={`${active ? 'image-visible' : ''}  product-cart`}
                            style={{ width: "100%" }}
                        />
                    </div>
                }
                <div style={{
                    width: `${props.data.banner_layout ? props.data.banner_layout[1] : "auto"}`,
                    marginLeft: `${props.data.banner_layout ? props.data.banner_layout[0] : "auto"}`
                }}>
                    <Carousel
                        responsive={responsive}
                        itemClass="p-2 place-self-center"
                        afterChange={(prev, next) => onScroll(prev, next)}
                        draggable
                        slidesToSlide={props.data.display_carousel ? props.data.number_of_products : 1}
                    >
                        {props.data.layout === 'type_1' ?
                            products.map((value, index) => (
                                <MyContext.Consumer>{context => (<>
                                    <Link to={EcommerceRoutePath.PRODUCT_DETAIL.replace(":seller_slug", value.mp_seller.slug).replace(":product_slug", value.slug)} className="text-decoration-none" key={value.id}>
                                        <div className="py-2"
                                            style={{
                                                paddingLeft: props.data.padding_left,
                                            }}
                                        >
                                            <div className="bg-white shadow-graph position-relative rounded p-2 product-cart"
                                                style={{
                                                    width: props.data.display_carousel ? 230 : "auto",
                                                }}
                                            >
                                                <div className="image-card">
                                                    <CustomImage
                                                        folder={PublicStorageFolderPath.products}
                                                        filename={value.mp_product_images[0].filename}
                                                        alt={value.mp_product_images[0].filename}
                                                        className="w-100 product-carousel-image"
                                                    />
                                                </div>

                                                <TextTruncate lineClamp={2} className="m-0  font-weight-semi-bold">
                                                    <ManualSwitchLanguage data={value.mp_product_informations} langAttr={"language_code"} valueAttr={"name"} />
                                                </TextTruncate>

                                                {value.is_sale_price &&
                                                    <div className="d-flex align-items-center">
                                                        <span className="bgc-accent-color  rounded px-1">{PriceRatio(value.mp_product_skus.find(value1 => value1.is_main).normal_price, value.mp_product_skus.find(value1 => value1.is_main).price)}</span>
                                                        <span className="color-374650 px-1"><del>Rp. {CurrencyFormat(value.mp_product_skus.find(value1 => value1.is_main).normal_price)}</del></span>
                                                    </div>

                                                }
                                                <p className="m-0  color-374650 font-weight-bold">Rp. {CurrencyFormat(value.mp_product_skus.find(value1 => value1.is_main).price)}</p>
                                                <p
                                                    className="m-0  color-374650"
                                                    onMouseOver={event => event.currentTarget.textContent = value.mp_seller.name}
                                                    onMouseOut={event => event.currentTarget.textContent = value.mp_seller.city}
                                                >

                                                    {value.mp_seller.city}</p>
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
                                                <div className="position-absolute" style={{ right: '0.5rem', bottom: 0 }}>
                                                    <div className="position-absolute pointer" style={{ right: '0.5rem', bottom: 0 }} onClick={e => addWishlist(e, index, value.id, !value.mp_wishlist)}>
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
                                        </div>
                                    </Link>
                                </>)}</MyContext.Consumer>
                            )) :
                            props.data.layout === 'type_2' ?
                                products.map(value => (
                                    <Link to={EcommerceRoutePath.PRODUCT_DETAIL.replace(":seller_slug", value.mp_seller.slug).replace(":product_slug", value.slug)} className="text-decoration-none" key={value.id}>
                                        <div className="py-2"
                                            style={{
                                                paddingLeft: props.data.display_carousel ? props.data.padding_left : "auto",
                                            }}
                                        >
                                            <div className="bg-white shadow-graph position-relative rounded p-2 product-cart"
                                                style={{
                                                    width: props.data.display_carousel ? 230 : "auto",

                                                }}
                                            >
                                                
                                                <div className="image-card">
                                                    <CustomImage folder={PublicStorageFolderPath.products} filename={value.mp_product_images[0].filename} alt={value.mp_product_images[0].filename} className="product-carousel-image" />
                                                </div>
                                                {value.is_sale_price &&
                                                    <div className="d-flex align-items-center mt-2">
                                                        <span className="bgc-accent-color  rounded px-1">{PriceRatio(value.mp_product_skus.find(value1 => value1.is_main).normal_price, value.mp_product_skus.find(value1 => value1.is_main).price)}</span>
                                                        <span className="color-374650 px-1"><del>Rp. {CurrencyFormat(value.mp_product_skus.find(value1 => value1.is_main).normal_price)}</del></span>
                                                    </div>}
                                                <TextTruncate lineClamp={2} className="m-0  font-weight-semi-bold"><ManualSwitchLanguage data={value.mp_product_informations} langAttr={"language_code"} valueAttr={"name"} /></TextTruncate>
                                                <p className="m-0  color-374650 font-weight-bold">Rp. {CurrencyFormat(value.mp_product_skus.find(value1 => value1.is_main).price)}</p>
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
                                                <p
                                                    className="m-0  color-374650"
                                                    onMouseOver={event => event.currentTarget.textContent = value.mp_seller.name}
                                                    onMouseOut={event => event.currentTarget.textContent = value.mp_seller.city}
                                                >{value.mp_seller.city}</p>
                                                <div className="position-absolute" style={{ right: '0.5rem', bottom: 0 }}>
                                                    <span><i className="fas fa-heart accent-color" style={{ fontSize: 28 }} /></span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                )) :
                                products.map(value => (
                                    <Link to={EcommerceRoutePath.PRODUCT_DETAIL.replace(":seller_slug", value.mp_seller.slug).replace(":product_slug", value.slug)} className="text-decoration-none" key={value.id}>
                                        <div className="py-2"
                                            style={{
                                                paddingLeft: props.data.display_carousel ? props.data.padding_left : "auto",
                                            }}
                                        >
                                            <div className="bg-white shadow-graph position-relative rounded p-2 product-cart"
                                                style={{
                                                    width: props.data.display_carousel ? 230 : "auto",
                                                }}
                                            >
                                                
                                                <div className="image-card">
                                                    <CustomImage folder={PublicStorageFolderPath.products} filename={value.mp_product_images[0].filename} alt={value.mp_product_images[0].filename} className="product-carousel-image" />
                                                </div>
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
                                                    <div className="d-flex align-items-center mt-2">
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
                                ))
                        }
                    </Carousel>
                </div>
            </div>
        </div >
    )
}

export default ProductCarousel
