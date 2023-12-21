import React from 'react';
import { CurrencyFormat2 } from '../../../../components/helpers/CurrencyFormat';
import CustomImage, { PublicStorageFolderPath } from '../../../../components/helpers/CustomImage';
import { useCountdown } from '../helpers/useCountdown';
import Countdown from 'react-countdown';
import { DateTimeFormat } from '../../../../components/helpers/DateTimeFormat';
import { isLoginTrue } from '../../../general/forum/components/IsLogin'
import EcommerceRoutePath from '../../EcommerceRoutePath';
import { Link } from 'react-router-dom';
import TextTruncate from '../../../../components/helpers/TextTruncate';
import ManualSwitchLanguage from '../../../../components/helpers/ManualSwitchLanguage';
const CardAuction = ({ data, status }) => {

    let highestBid = data?.mp_product_auction_bid[0]?.bid_price;
    data?.mp_product_auction_bid.map((bid) => {
        if (bid.mp_product_auction_bid > highestBid) {
            highestBid = bid.mp_product_auction_bid;
        }
    })

    console.log(data)

    return (
        <div>
            <style>{`
                .product-cart {
                    height: 420px;
                }
                .product-carousel-image {
                    height: auto;
                }
                .product-carousel-image {
                    max-width: 100%;
                }
                @media (max-width: 767.98px) {
                    .product-cart {
                        height: 320px;
                    }
                    .product-carousel-image {
                        height: auto;
                    }
                }
            `}</style>
            {status !== 'done' &&
                <div className="shadow-graph mt-3 mb-3" style={{ borderRadius: 10 }}>
                    <div className='d-flex mb-2 responsive-card p-2'>
                        <div className='col-md-5 col-sm-5 col-lg-5 align-self-center'>
                            <CustomImage
                                className="mt-2 w-auto product-carousel-image"
                                filename={data?.mp_product_images[0]?.filename}
                                folder={PublicStorageFolderPath.products}
                            />
                        </div>
                        <div className='col-md-7 col-sm-7 col-lg-7'>
                            <TextTruncate lineClamp={2} className="m-0  color-black font-size-80-percent font-weight-bold">
                                <ManualSwitchLanguage data={data.mp_product_informations} langAttr={"language_code"} valueAttr={"name"} />
                            </TextTruncate>
                            <p className='font-size-90-percent color-6D6D6D my-2'>Penawaran Tertinggi:</p>
                            {/* <p className='font-size-90-percent font-weight-bold accent-color'>Rp.{CurrencyFormat2(data?.mp_product_skus[0].price)}</p> */}
                            <p className='font-size-90-percent font-weight-bold accent-color'>Rp.{CurrencyFormat2(highestBid)}</p>
                            <div className='mb-3 mt-3' style={{ backgroundColor: 'rgba(255, 240, 202, 1)', maxWidth: 200, width: 'auto', borderRadius: 5 }}>
                                <Countdown
                                    date={data?.active_end_date}
                                    renderer={({ days, hours, minutes, seconds }) => (
                                        <p className='font-size-80-percent p-1 accent-color button-nowrap'>Berakhir dalam <span className='font-weight-bold'>{days}:{hours}:{minutes}:{seconds}</span></p>
                                    )}
                                />
                            </div>
                            <div
                                className='position-relative'
                                style={{ bottom: 0 }}
                            >
                                <Link className="btn btn-sm text-white bgc-accent-color button-nowrap w-50 p-2 text-decoration-none" to={EcommerceRoutePath.PRODUCT_DETAIL.replace(":seller_slug", data.mp_seller.slug).replace(":product_slug", data.slug)}  >
                                    Tawar Lagi
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            }
            {status === 'done' &&
                <Link className="text-decoration-none color-8D8D8D my-2" to={EcommerceRoutePath.PRODUCT_DETAIL.replace(":seller_slug", data?.mp_seller.slug).replace(":product_slug", data?.slug)}>

                    <div className="shadow-graph mt-3 mb-3" style={{ borderRadius: 10 }}>
                        <div className='d-flex mb-2 responsive-card p-2'>
                            <div className='col-md-5 col-sm-5 col-lg-5 align-self-center'>
                                <CustomImage
                                    className="mt-2 w-auto product-carousel-image"
                                    filename={data?.mp_product_images[0]?.filename}
                                    folder={PublicStorageFolderPath.products}
                                />
                            </div>
                            <div className='col-md-7 col-sm-7 col-lg-7'>
                                <p className='font-size-90-percent font-weight-600'
                                    style={{ color: isLoginTrue(data.mp_product_auction_bid[0]?.mp_customer_id) ? '#6FC32E' : '#F54C4C' }}
                                >
                                    {isLoginTrue(data.mp_product_auction_bid[0]?.mp_customer_id) ? 'Menang' : 'Kalah'}
                                </p>
                                {/* <p className='font-size-90-percent'>{data?.mp_product_informations[0]?.name}</p> */}
                                <TextTruncate lineClamp={2} className="m-0  color-black font-size-80-percent font-weight-bold">
                                    <ManualSwitchLanguage data={data.mp_product_informations} langAttr={"language_code"} valueAttr={"name"} />
                                </TextTruncate>
                                <p className='font-size-80-percent my-2 color-black'>
                                    {DateTimeFormat(data?.active_start_date, 2)}
                                </p>
                            </div>
                        </div>
                    </div>
                </Link>
            }
        </div >
    );
}

export default CardAuction;

