import React from 'react';
import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import Countdown, { zeroPad, calcTimeDelta, formatTimeDelta } from 'react-countdown';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import CurrencyFormat from '../../components/helpers/CurrencyFormat';
import CustomImage, { PublicStorageFolderPath } from '../../components/helpers/CustomImage';
import ManualSwitchLanguage from '../../components/helpers/ManualSwitchLanguage';
import PriceRatio from '../../components/helpers/PriceRatio';
import { useCountdown } from './auction/helpers/useCountdown';
import EcommerceRoutePath from './EcommerceRoutePath';
import { CartCheckoutOuterDiv } from './HelperCartCheckout';


const CartAuctionList = ({
    data,
    index,
    checkSellerCheckbox,
    checkSellerCheckboxOnChange,
    checkSellerInactive,
    checkSingleCheckbox,
    checkSingleCheckboxOnChange,
    inactive_product,
    minStockForOutOfStockWarning,
}) => {


    const { t } = useTranslation()

    const renderer = ({ hours, minutes, seconds, completed, t }) => {

        if (completed) {
            // Render a completed state
            return <div></div>;
        } else {

            return (
                <p className='small p-1'>Produk akan hangus dalam waktu
                    <span className='font-weight-bold text-danger ml-1'>{zeroPad(hours)}:{zeroPad(minutes)}:{zeroPad(seconds)}</span>
                </p>
            )
        }
    };
    return (
        <div>
            <div className="bg-white shadow-graph rounded p-3 mb-4" key={data.id}>
                <p className="m-0 font-weight-bold color-333333 mb-3">{t('cart.auction_product')}</p>
                <div className="d-flex border-bottom pb-2">
                    <div className="d-flex align-items-start mt-2" style={{ width: 20 }}>
                        <input
                            type="checkbox"
                            checked={checkSellerCheckbox(data.cartForAuction)}
                            onChange={checkSellerCheckboxOnChange}
                            index={index}
                            className="checkbox-size"
                            disabled={checkSellerInactive(data.cartForAuction)}
                        />
                    </div>
                    <Link to={EcommerceRoutePath.SELLER.replace(":seller_slug", data.seller.slug)} className="text-decoration-none w-100">
                        <p className="m-0 font-weight-bold color-333333"><i className="fa fa-check-circle accent-color mx-2" />{data.seller.name}</p>
                    </Link>
                </div>
                {data.cartForAuction.map((data1, index1) => {
                    return (
                        <div className="pl-3 py-2" key={data1.id}>
                            <div className="d-flex mt-2">
                                <div className="d-flex align-items-center" style={{ width: 20 }}>
                                    <input
                                        type="checkbox"
                                        checked={checkSingleCheckbox(data1)}
                                        onChange={() => checkSingleCheckboxOnChange(data1)}
                                        className="checkbox-size"
                                    />
                                </div>
                                <div className="d-flex align-items-center w-100 ml-2">
                                    <Link to={EcommerceRoutePath.PRODUCT_DETAIL.replace(":seller_slug", data.seller.slug).replace(":product_slug", data1.mp_product.slug)}>
                                        {data1.mp_product_sku.mp_product_sku_images && data1.mp_product_sku.mp_product_sku_images.length > 0 ?
                                            <CustomImage folder={PublicStorageFolderPath.products} filename={data1.mp_product_sku.mp_product_sku_images[0].filename} alt={data1.mp_product_sku.mp_product_sku_images[0].filename} className="object-fit-cover rounded" style={{ width: 50, height: 50 }} /> :
                                            <CustomImage folder={PublicStorageFolderPath.products} filename={data1.mp_product.mp_product_images[0].filename} alt={data1.mp_product.mp_product_images[0].filename} className="object-fit-cover rounded" style={{ width: 50, height: 50 }} />}
                                    </Link>
                                    <div className="pl-3 product-name">
                                        <Link to={EcommerceRoutePath.PRODUCT_DETAIL.replace(":seller_slug", data.seller.slug).replace(":product_slug", data1.mp_product.slug)} className="m-0 color-333333 text-decoration-none">
                                            <ManualSwitchLanguage data={data1.mp_product.mp_product_informations} langAttr={"language_code"} dataAttr={"name"} />
                                        </Link>
                                        <div className="font-size-90-percent">{data1.mp_product_sku.mp_product_sku_variant_options.map((option) => option.name).join(", ")}</div>
                                        <div className="d-flex align-items-center ">
                                            {data.is_sale_price &&
                                                <>
                                                    <span className="bgc-accent-color  rounded font-size-90-percent px-1">{PriceRatio(data1.mp_product_sku.normal_price, data1.mp_product_sku.price)}</span>
                                                    <span className="font-size-90-percent color-858585 px-2"><del>Rp {CurrencyFormat(data1.mp_product_sku.normal_price)}</del></span>
                                                </>}
                                            <span className=" color-292929 font-weight-bold px-1">Rp {CurrencyFormat(data1?.mp_auction_bid?.bid_price)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {!inactive_product.includes(data1.mp_product_sku_id) &&
                                <div className="d-flex mt-2">
                                    <div className="d-flex align-items-center" style={{ width: '3%' }}></div>
                                    <div className="" style={{ width: '97%' }}>
                                        <div className="row mt-2 align-items-center">
                                            {data1.mp_product_sku.stock < minStockForOutOfStockWarning
                                                && <div className="small color-E32827">{t('cart.almost_out_of_stock', { stock: data1.mp_product_sku.stock })}</div>}
                                            <div className="ml-auto pr-2">
                                                <span className=" color-292929 font-weight-bold px-1">Rp {CurrencyFormat(data1?.mp_auction_bid?.bid_price * data1.quantity)}</span>
                                            </div>
                                        </div>
                                        <div className='mb-3 w-50 text-center' style={{ backgroundColor: 'rgba(255, 215, 168, 1)', borderRadius: 50 }}>
                                            <Countdown
                                                date={data1?.deadline}
                                                renderer={renderer}

                                            />
                                        </div>
                                    </div>
                                </div>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}



export default CartAuctionList;
