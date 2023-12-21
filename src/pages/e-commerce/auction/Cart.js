import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react'
import Config from '../../../components/axios/Config';
import CustomImage from '../../../components/helpers/CustomImage';
import SwalToast from '../../../components/helpers/SwalToast';
import MyContext from '../../../components/MyContext'
import Template from '../../../components/Template'

const Style = props => {
    if (props.themes) {
        return (
            <style>{`
                #body {
                    max-width: ${props.themes.site_width.width};
                    margin: 0 auto;
                }
            `}</style>
        );
    } else return null;
};

export default function Cart() {

    const [data, setData] = useState()


    useEffect(() => {
        getCart()
    }, []);


    const getCart = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}cart/get`

        axios.get(url, Config({
            Authorization: `Bearer ${Cookies.get("token")}`,
        })).then(response => {
            setData(response.data.data);
        }).catch(error => {
            console.log(error)
            if (error.response) {
                SwalToast.fire({
                    icon: "error",
                    title: error.response.data.message
                })
            } else {
                SwalToast.fire({
                    icon: "error",
                    title: "Something went wrong",
                })
            }
        })
    }

    console.log(data)

    return (
        <Template>
            <MyContext.Consumer>{context => (
                <div id="body">
                    <Style themes={context.theme_settings} />
                    <div className="row mt-2">
                        <div className="col-12 col-sm-12 col-md-8 col-lg-8 col-xl-8">
                            <div className="px-3 py-3 bg-white shadow-graph rounded">
                                <div className='d-flex align-items-center justify-content-between'>
                                    <h5 className='h5 font-weight-bold'>Produk Lelang</h5>
                                    <i class="fas fa-question accent-color"></i>
                                </div>
                                <div className="form-check d-flex align-items-center mt-3 pb-3 border-bottom">
                                    <input
                                        className="form-check-input mt-0"
                                        type="checkbox"
                                        id="select-all"
                                    />
                                    <i class="fas fa-check-circle accent-color"></i>
                                    <h6 className="h6 form-check-label  m-0 ml-1 font-weight-bold" htmlFor="select-all">
                                        Maju Jaya Shop
                                    </h6>
                                </div>
                                <div className="form-check d-flex mt-3 ml-3">
                                    <input
                                        className="form-check-input mt-0"
                                        type="checkbox"
                                        id="select-all"
                                    />
                                    <CustomImage style={{ width: 56, height: 56 }} className='ml-3' />
                                    <div className='ml-2'>
                                        <h6 className='h6 font-weight-semi-bold'>
                                            KitchenAid Artisan Stand Mixer 4,8L Attachement Sifter a...
                                        </h6>
                                        <p className='body color-6D6D6D'>White</p>
                                        <div className='d-flex'>
                                            <div className='p-0 text-center' style={{ width: 40, borderRadius: 20, backgroundColor: "#FFD7A8" }}>
                                                <p className='body accent-color font-weight-bold'>
                                                    40%
                                                </p>
                                            </div>
                                            <p className='ml-2'>
                                                Rp 9.099.000
                                            </p>
                                            <p className='ml-2 font-weight-bold'>
                                                Rp 7.279.200
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className='p-0 text-center mt-3 w-50 ml-3' style={{ borderRadius: 20, backgroundColor: "#FFD7A8" }}>
                                    <p className='small font-weight-bold'>
                                        Produk akan hangus dalam waktu
                                        <span className='color-EB2424 ml-1'>
                                            15:45 menit
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div className="px-3 py-3 bg-white shadow-graph rounded mt-3">
                                <div className="form-check d-flex align-items-center mt-3 pb-3 border-bottom">
                                    <input
                                        className="form-check-input mt-0"
                                        type="checkbox"
                                        id="select-all"
                                    />
                                    <i class="fas fa-check-circle accent-color"></i>
                                    <h6 className="h6 form-check-label  m-0 ml-1 font-weight-bold" htmlFor="select-all">
                                        Maju Jaya Shop
                                    </h6>
                                </div>
                                <div className="form-check d-flex mt-3 ml-3">
                                    <input
                                        className="form-check-input mt-0"
                                        type="checkbox"
                                        id="select-all"
                                    />
                                    <CustomImage style={{ width: 56, height: 56 }} className='ml-3' />
                                    <div className='ml-2'>
                                        <h6 className='h6 font-weight-semi-bold'>
                                            KitchenAid Artisan Stand Mixer 4,8L Attachement Sifter a...
                                        </h6>
                                        <p className='body color-6D6D6D'>White</p>
                                        <div className='d-flex'>
                                            <div className='p-0 text-center' style={{ width: 40, borderRadius: 20, backgroundColor: "#FFD7A8" }}>
                                                <p className='body accent-color font-weight-bold'>
                                                    40%
                                                </p>
                                            </div>
                                            <p className='ml-2'>
                                                Rp9.099.000
                                            </p>
                                            <p className='ml-2 font-weight-bold'>
                                                Rp7.279.200
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className='d-flex ml-5 mt-3 justify-content-between'>
                                    <div className='d-flex'>
                                        <div className='p-0 text-center bgc-accent-color cursor-pointer' style={{ borderRadius: "50%", width: 24, height: 24 }}>
                                            <p className='body font-weight-bold'>
                                                -
                                            </p>
                                        </div>
                                        <div className='mx-2 border-bottom'>
                                            20
                                        </div>
                                        <div className='p-0 text-center bgc-accent-color cursor-pointer' style={{ borderRadius: "50%", width: 24, height: 24 }}>
                                            <p className='body font-weight-bold'>
                                                +
                                            </p>
                                        </div>
                                    </div>
                                    <h6 className='h6 font-weight-bold'>
                                        Rp14.558.400
                                    </h6>
                                </div>
                            </div>
                            <div className="px-3 py-3 bg-white shadow-graph rounded mt-3">
                                <div className="form-check d-flex align-items-center mt-3 pb-3 border-bottom">
                                    <input
                                        className="form-check-input mt-0"
                                        type="checkbox"
                                        id="select-all"
                                    />
                                    <i class="fas fa-check-circle accent-color"></i>
                                    <h6 className="h6 form-check-label  m-0 ml-1 font-weight-bold" htmlFor="select-all">
                                        Maju Jaya Shop
                                    </h6>
                                </div>
                                <div className='border-accent-color mt-3' style={{ borderRadius: 10 }}>
                                    <div className='p-2 d-flex justify-content-between' style={{ backgroundColor: "#FFD7A8", borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                                        <h5 className='h5 font-weight-bold'>
                                            Paket Diskon PWP
                                        </h5>
                                        <i class="fas fa-question accent-color"></i>
                                    </div>
                                    <div className="form-check d-flex mt-3 ml-3 p-3">
                                        <input
                                            className="form-check-input mt-0"
                                            type="checkbox"
                                            id="select-all"
                                        />
                                        <CustomImage style={{ width: 56, height: 56 }} className='ml-3' />
                                        <div className='ml-2'>
                                            <h6 className='h6 font-weight-semi-bold'>
                                                KitchenAid Artisan Stand Mixer 4,8L Attachement Sifter a...
                                            </h6>
                                            <p className='body color-6D6D6D'>White</p>
                                            <div className='d-flex'>
                                                <div className='p-0 text-center' style={{ width: 40, borderRadius: 20, backgroundColor: "#FFD7A8" }}>
                                                    <p className='body accent-color font-weight-bold'>
                                                        40%
                                                    </p>
                                                </div>
                                                <p className='ml-2'>
                                                    Rp 9.099.000
                                                </p>
                                                <p className='ml-2 font-weight-bold'>
                                                    Rp 7.279.200
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='d-flex ml-5 my-3 justify-content-between mx-3'>
                                        <div className='d-flex'>
                                            <div className='p-0 text-center bgc-accent-color cursor-pointer' style={{ borderRadius: "50%", width: 24, height: 24 }}>
                                                <p className='body font-weight-bold'>
                                                    -
                                                </p>
                                            </div>
                                            <div className='mx-2 border-bottom'>
                                                20
                                            </div>
                                            <div className='p-0 text-center bgc-accent-color cursor-pointer' style={{ borderRadius: "50%", width: 24, height: 24 }}>
                                                <p className='body font-weight-bold'>
                                                    +
                                                </p>
                                            </div>
                                        </div>
                                        <h6 className='h6 font-weight-bold'>
                                            Rp14.558.400
                                        </h6>
                                    </div>
                                    <div className="form-check d-flex mt-3 ml-3 p-3">
                                        <input
                                            className="form-check-input mt-0"
                                            type="checkbox"
                                            id="select-all"
                                        />
                                        <CustomImage style={{ width: 56, height: 56 }} className='ml-3' />
                                        <div className='ml-2'>
                                            <h6 className='h6 font-weight-semi-bold'>
                                                KitchenAid Artisan Stand Mixer 4,8L Attachement Sifter a...
                                            </h6>
                                            <p className='body color-6D6D6D'>White</p>
                                            <div className='d-flex'>
                                                <div className='p-0 text-center' style={{ width: 40, borderRadius: 20, backgroundColor: "#FFD7A8" }}>
                                                    <p className='body accent-color font-weight-bold'>
                                                        40%
                                                    </p>
                                                </div>
                                                <p className='ml-2'>
                                                    Rp 9.099.000
                                                </p>
                                                <p className='ml-2 font-weight-bold'>
                                                    Rp 7.279.200
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='d-flex ml-5 my-3 justify-content-between mx-3'>
                                        <div className='d-flex'>
                                            <div className='p-0 text-center bgc-accent-color cursor-pointer' style={{ borderRadius: "50%", width: 24, height: 24 }}>
                                                <p className='body font-weight-bold'>
                                                    -
                                                </p>
                                            </div>
                                            <div className='mx-2 border-bottom'>
                                                20
                                            </div>
                                            <div className='p-0 text-center bgc-accent-color cursor-pointer' style={{ borderRadius: "50%", width: 24, height: 24 }}>
                                                <p className='body font-weight-bold'>
                                                    +
                                                </p>
                                            </div>
                                        </div>
                                        <h6 className='h6 font-weight-bold'>
                                            Rp14.558.400
                                        </h6>
                                    </div>
                                    <div className='p-0 text-center mt-3 ml-3 my-3' style={{ width: 500, borderRadius: 20, backgroundColor: "#FFD7A8" }}>
                                        <p className='small font-weight-bold'>
                                            <i class="fas fa-circle-exclamation mr-1"></i>
                                            Selamat! Paket Diskon PWP sudah aktif. Kamu hemat Rp 200.000.
                                        </p>
                                    </div>
                                </div>
                                <div className="form-check d-flex mt-3 ml-3 p-3">
                                    <input
                                        className="form-check-input mt-0"
                                        type="checkbox"
                                        id="select-all"
                                    />
                                    <CustomImage style={{ width: 56, height: 56 }} className='ml-3' />
                                    <div className='ml-2'>
                                        <h6 className='h6 font-weight-semi-bold'>
                                            KitchenAid Artisan Stand Mixer 4,8L Attachement Sifter a...
                                        </h6>
                                        <p className='body color-6D6D6D'>White</p>
                                        <div className='d-flex'>
                                            <div className='p-0 text-center' style={{ width: 40, borderRadius: 20, backgroundColor: "#FFD7A8" }}>
                                                <p className='body accent-color font-weight-bold'>
                                                    40%
                                                </p>
                                            </div>
                                            <p className='ml-2'>
                                                Rp 9.099.000
                                            </p>
                                            <p className='ml-2 font-weight-bold'>
                                                Rp 7.279.200
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className='d-flex ml-5 my-3 justify-content-between mx-3'>
                                    <div className='d-flex'>
                                        <div className='p-0 text-center bgc-accent-color cursor-pointer' style={{ borderRadius: "50%", width: 24, height: 24 }}>
                                            <p className='body font-weight-bold'>
                                                -
                                            </p>
                                        </div>
                                        <div className='mx-2 border-bottom'>
                                            20
                                        </div>
                                        <div className='p-0 text-center bgc-accent-color cursor-pointer' style={{ borderRadius: "50%", width: 24, height: 24 }}>
                                            <p className='body font-weight-bold'>
                                                +
                                            </p>
                                        </div>
                                    </div>
                                    <h6 className='h6 font-weight-bold'>
                                        Rp14.558.400
                                    </h6>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4">
                            <div className="px-4 py-4 bg-white shadow-graph rounded">
                                <div className='d-flex align-items-center justify-content-between'>
                                    <h6 className='h6 font-weight-bold'>Voucher Diskon</h6>
                                </div>
                                <div className='p-3 border-C5C5C5 rounded'>
                                    <div className='d-flex align-items-center'>
                                        <img src={`/images/image_discount.png`} className='mr-1' style={{ width: "auto", height: 40 }} />
                                        <p className='body'>Selamat, kamu dapat voucher diskon 30%!</p>
                                    </div>
                                </div>
                                <div className='p-3 border-C5C5C5 rounded mt-3'>
                                    <div className='d-flex align-items-center'>
                                        <img src={`/images/image_free_ongkir.png`} className='mr-1' style={{ width: "auto", height: 40 }} />
                                        <p className='body'>Selamat, kamu dapat voucher gratis ongkos kirim!</p>
                                    </div>
                                </div>
                                <div className='text-center mt-3'>
                                    <h6 className='h6 font-weight-bold accent-color'>Mau Voucher Lain ?</h6>
                                </div>
                                <div className='mt-3'>
                                    <h6 className='h6 font-weight-bold'>Ringkasan Belanja</h6>
                                    <div className='d-flex justify-content-between my-2'>
                                        <p className='small color-6D6D6D'>
                                            Total Harga (4 Produk)
                                        </p>
                                        <p className='small'>
                                            Rp 14.558.400
                                        </p>
                                    </div>
                                    <div className='d-flex justify-content-between my-2'>
                                        <p className='small color-6D6D6D'>
                                            Diskon
                                        </p>
                                        <p className='small'>
                                            - Rp 4.367.520
                                        </p>
                                    </div>
                                    <div className='d-flex justify-content-between my-2'>
                                        <p className='small color-6D6D6D'>
                                            Total Pembayaran
                                        </p>
                                        <h6 className='h6 font-weight-bold'>
                                            Rp 10.190.880
                                        </h6>
                                    </div>
                                </div>
                                <div className='mt-3'>
                                    <button className='btn btn-md w-100 bgc-accent-color font-weight-bold text-white'>
                                        Checkout
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}</MyContext.Consumer>
        </Template >
    )
}


