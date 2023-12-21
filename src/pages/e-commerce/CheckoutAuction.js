import React from 'react';
import CurrencyFormat from '../../components/helpers/CurrencyFormat';
import CustomImage, { PublicStorageFolderPath } from '../../components/helpers/CustomImage';
import ManualSwitchLanguage from '../../components/helpers/ManualSwitchLanguage';

const CheckoutAuction = ({
    data
}) => {
    return (
        <>
            {data.cartForAuction.map((value1, index1) => (
                <div className="d-flex align-items-center mt-3" key={value1.id}>
                    {value1.mp_product_sku.mp_product_sku_images && value1.mp_product_sku.mp_product_sku_images.length > 0 ?
                        <CustomImage folder={PublicStorageFolderPath.products} filename={value1.mp_product_sku.mp_product_sku_images[0].filename} alt={value1.mp_product_sku.mp_product_sku_images[0].filename} className="object-fit-cover rounded" style={{ width: 50, height: 50 }} /> :
                        <CustomImage folder={PublicStorageFolderPath.products} filename={value1.mp_product.mp_product_images[0].filename} alt={value1.mp_product.mp_product_images[0].filename} className="object-fit-cover rounded" style={{ width: 50, height: 50 }} />}
                    <div className="pl-3 w-100">
                        <div className="m-0 color-333333  row">
                            <ManualSwitchLanguage data={value1.mp_product.mp_product_informations} langAttr={"language_code"} valueAttr={"name"} />
                            <div className="ml-auto">
                                <span> {value1.quantity} pcs</span>
                            </div>
                        </div>
                        <div className="">
                            <span>{value1.mp_product_sku.mp_product_sku_variant_options.map((option) => option.name).join(", ")}</span>
                        </div>
                        <div className="d-flex align-items-center">
                            {/* {value.is_sale_price &&
                        <>
                            <span className="bgc-accent-color  rounded px-1">{PriceRatio(value1.mp_product_sku.normal_price, value1.mp_product_sku.price)}</span>
                            <span className="color-858585 px-2"><del>Rp {CurrencyFormat(value1.mp_product_sku.normal_price)}</del></span>
                        </>} */}
                            <span className="color-292929 font-weight-bold px-1 price-center">Rp {CurrencyFormat(value1.mp_product_sku.price)}</span>
                            <div className="ml-auto">
                                <span className="color-292929 font-weight-bold price-right">Rp {CurrencyFormat(value1.mp_product_sku.price)}</span>
                                <span className="color-292929 font-weight-bold total-price">Rp {CurrencyFormat(value1.mp_product_sku.price * value1.quantity)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </>
    )
}

export default CheckoutAuction;
