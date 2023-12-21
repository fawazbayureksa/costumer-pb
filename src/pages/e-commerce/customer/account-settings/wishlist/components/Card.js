import React from 'react';
import { Link } from 'react-router-dom';
import { CurrencyFormat2 } from '../../../../../../components/helpers/CurrencyFormat';
import CustomImage, { PublicStorageFolderPath } from '../../../../../../components/helpers/CustomImage';
import { DateTimeFormat } from '../../../../../../components/helpers/DateTimeFormat';
import ManualSwitchLanguage from '../../../../../../components/helpers/ManualSwitchLanguage';
import TextTruncate from '../../../../../../components/helpers/TextTruncate';
import { CountdownAuction } from '../../../../auction/components/CountDownAuction';
import EcommerceRoutePath from '../../../../EcommerceRoutePath';

const Card = ({ data, t }) => {
    return (
        <div id="data-wishlist" className="mt-4">
            <style>{`
                #data-wishlist {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1rem;
                }
                @media (max-width: 575.98px) {
                    #data-wishlist {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 1rem;
                    }
                }
                @media (min-width: 576px) and (max-width: 767.98px) {
                    #data-wishlist {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 1rem;
                    }
                }
            `}</style>
            {data && data.map((item) => (
                <Link className="text-decoration-none color-8D8D8D my-2" to={EcommerceRoutePath.PRODUCT_DETAIL.replace(":seller_slug", item?.mp_product?.mp_seller?.slug).replace(":product_slug", item?.mp_product.slug)}>
                    <div className="py-2">
                        <div className="bg-white shadow-graph position-relative rounded p-2 product-cart">
                            <div className="d-flex align-items-center">
                                <CustomImage
                                    filename={item?.mp_product.mp_product_images[0]?.filename}
                                    folder={PublicStorageFolderPath.products}
                                    className="w-100 product-carousel-image mt-2"
                                />
                            </div>
                            {/* <CountdownAuction targetDate={item?.mp_product.active_end_date} t={t} /> */}
                            <div className='d-flex flex-column align-items-start p-1'>
                                <TextTruncate lineClamp={2} className="m-0  color-black font-size-80-percent font-weight-bold">
                                    <ManualSwitchLanguage data={item.mp_product.mp_product_informations} langAttr={"language_code"} valueAttr={"name"} />
                                </TextTruncate>
                                <p className='font-size-80-percent my-2 color-black'>
                                    <i className='font-size-90-percent fas fa-calendar color-black'></i> {DateTimeFormat(item?.mp_product.active_start_date, 2)}
                                </p>
                                <p className='font-size-80-percent m-0'>{item?.mp_product.mp_seller?.city}</p>
                                <p className='font-size-80-percent my-2'>Penawaran Awal : <strong className='accent-color font-weight-bold' >Rp {CurrencyFormat2(item?.mp_product.mp_product_skus[0]?.price)}</strong></p>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}

export default Card;
