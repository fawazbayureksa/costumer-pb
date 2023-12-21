import React from 'react';
import Carousel from 'react-multi-carousel';
import { Link } from 'react-router-dom';
import CustomImage, { PublicStorageFolderPath } from '../../../../components/helpers/CustomImage';
import { DateTimeFormat } from '../../../../components/helpers/DateTimeFormat';
import CurrencyFormat2 from '../../../../components/helpers/CurrencyFormat';
import EcommerceRoutePath from '../../EcommerceRoutePath';
import { CountdownAuction } from './CountDownAuction';
import TextTruncate from '../../../../components/helpers/TextTruncate';
import ManualSwitchLanguage from '../../../../components/helpers/ManualSwitchLanguage';
import moment from 'moment';

const CardSlider = ({ data, name, t }) => {

    const responsive = {
        desktop: {
            breakpoint: { max: 3000, min: 1024 },
            items: 4,
        },
        tablet: {
            breakpoint: { max: 1024, min: 464 },
            items: 2,
        },
        mobile: {
            breakpoint: { max: 464, min: 0 },
            items: 1,
        }
    };

    return (
        <div className="overflow-hidden">
            {data?.length > 0 &&
                <>
                    <Style />
                    <Carousel responsive={responsive} itemClass="p-2 place-self-center">
                        {name !== "nextDay" &&
                            <CardBanner name={name} t={t} />
                        }
                        {data && data.map((item) => (
                            <Link className="text-decoration-none color-8D8D8D my-2" to={EcommerceRoutePath.PRODUCT_DETAIL.replace(":seller_slug", item?.mp_seller.slug).replace(":product_slug", item?.slug)}>
                                <div className="py-2">
                                    <div className="bg-white shadow-graph position-relative rounded p-2 product-cart">
                                        <div className="d-flex align-items-center">
                                            <CustomImage
                                                filename={item?.mp_product_images[0]?.filename}
                                                folder={PublicStorageFolderPath.products}
                                                className="w-100 product-carousel-image mt-2"
                                            />
                                        </div>
                                        {
                                            (moment(new Date()).isBefore(moment(item?.active_start_date)) === false) &&
                                            <CountdownAuction targetDate={item?.active_end_date} t={t} type={"end_id"} />
                                        }
                                        {
                                            (moment(new Date()).isBefore(moment(item?.active_start_date)) === true) &&
                                            <CountdownAuction targetDate={item?.active_start_date} t={t} type={"start_in"} />
                                        }
                                        <div className='d-flex flex-column align-items-start p-1'>
                                            <TextTruncate lineClamp={2} className="m-0  color-black font-size-80-percent font-weight-bold">
                                                <ManualSwitchLanguage data={item.mp_product_informations} langAttr={"language_code"} itemAttr={"name"} />
                                            </TextTruncate>
                                            <p className='font-size-80-percent my-2 color-black'>
                                                <i className='font-size-90-percent fas fa-calendar color-black'></i> {DateTimeFormat(item?.active_start_date, 2)}
                                            </p>
                                            <p className='font-size-80-percent m-0'>{item?.mp_seller?.city}</p>
                                            <p className='font-size-80-percent my-2'>Penawaran Awal : <strong className='accent-color font-weight-bold' >Rp {CurrencyFormat2(item?.mp_product_skus[0]?.price)}</strong></p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </Carousel>
                </>
            }
        </div >
    );
}

export default CardSlider;

export const CardBanner = ({ name, t }) => {
    return (
        <div>
            <Style />
            {name == "onGoing" &&
                <div className="bgc-accent-color shadow-graph position-relative rounded p-2 cart-banner" style={{ borderRadius: 10 }}>
                    <h3 className='h3 text-white my-3 font-weight-bold'>{t('auction.ongoing')} </h3>
                    <p>{t('auction.bid_now_before_end')}</p>
                    <div style={{ position: 'absolute', bottom: 20 }}>
                        <p className='body font-weight-bold'>{t('auction.view_all_product')} <i className='fas fa-arrow-right'></i></p>
                    </div>
                </div>
            }
            {name == "onTheDay" &&
                <div className="bgc-gradient-color shadow-graph position-relative rounded p-2 cart-banner  " style={{ borderRadius: 10 }}>
                    <h3 className='h3 text-white my-3 font-weight-bold'>
                        {t('auction.will_begin_today')}
                    </h3>
                    <p className='text-white'>{t('auction.auction_only_today')}</p>
                    <div style={{ position: 'absolute', bottom: 20 }}>
                        <p className='text-white body font-weight-bold'>{t('auction.view_all_product')} <i className='fas fa-arrow-right'></i></p>
                    </div>
                </div>
            }
            {name == "promote" &&
                <div className="bgc-facebook-color shadow-graph position-relative rounded p-2 cart-banner  " style={{ borderRadius: 10 }}>
                    <h3 className='h3 text-white my-3 font-weight-bold'>{t('auction.featured_product')}</h3>
                    <p className='text-white'>
                        {t('auction.give_the_highest')}
                    </p>
                    <div style={{ position: 'absolute', bottom: 20 }}>
                        <p className='text-white body font-weight-bold'>{t('auction.view_all_product')} <i className='fas fa-arrow-right'></i></p>
                    </div>
                </div>
            }
        </div>
    );
}

const Style = () => {
    return (
        <style>{`
        .cart-banner {
            height: 420px;
        }
        .product-carousel-image {
            height: auto;
        }
        .product-carousel-image {
            max-width: 100%;
        }
        @media (max-width: 767.98px) {
            .cart-banner {
                height: 420px;
            }
            .product-carousel-image {
                height: auto;
            }
        `}
        </style>
    )
}
