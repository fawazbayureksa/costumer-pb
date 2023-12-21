import axios from 'axios';
import Cookies from 'js-cookie';
import moment from 'moment';
import React, { useState, useEffect, StyleSheet } from 'react';
import { Modal } from 'react-bootstrap';
import Countdown from 'react-countdown';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import Config from '../../../../components/axios/Config';
import { CurrencyFormat2 } from '../../../../components/helpers/CurrencyFormat';
import SwalToast from '../../../../components/helpers/SwalToast';
import { TinyMceContent } from '../../../../components/helpers/TinyMceEditor';
import { isLogin, isLoginTrue } from '../../../general/forum/components/IsLogin';
import { CountdownAuction } from '../../auction/components/CountDownAuction';
import EcommerceRoutePath from '../../EcommerceRoutePath';




const AuctionConditions = ({ data, getProductDetail }) => {
    const [bidOption, setBidOption] = useState([])
    const [historyBid, setHistoryBid] = useState([])
    const [selectBid, setSelectBid] = useState([])
    const [bid, setBid] = useState()
    const [idBid, setIdBid] = useState()
    const [modalTnc, setModalTnc] = useState(false)
    const [tnc, setTnc] = useState([])
    const [dataAuction, setDataAuction] = useState()
    const [price, setPrice] = useState()
    const [notifSimiliar, setNotifSimiliar] = useState()
    const [wishlist, setWishlist] = useState(false)
    const [modalConfirmed, setModalConfirmed] = useState(false);
    const history = useHistory()

    useEffect(() => {
        getDataAuction()
        getTnc()
        if (data.mp_wishlist) {
            setWishlist(!wishlist)
        }
    }, [])

    const onSelectBid = (bid, id, price) => {
        setSelectBid(bid)
        setBid(((bid * data.mp_product_skus[0].price) / 100) + price)
        setIdBid(id)
    }

    const getDataAuction = () => {

        let url = `${process.env.REACT_APP_BASE_API_URL}auction/detailAuction/${data?.id}`

        let axiosInstance = axios.get(url, Config({}))

        if (isLogin()) {
            axiosInstance = axios.get(url, Config({ Authorization: `Bearer ${Cookies?.get("token")}` }))
        }
        axiosInstance.then(response => {
            setBidOption(response.data.data.bid_option)
            if (response.data.data.highest_bidder.length > 0) {
                setPrice(response.data.data.highest_bidder[0]?.bid_price)
            } else {
                setPrice(data.mp_product_skus[0].price)
            }
            setHistoryBid(response.data.data.highest_bidder)
            setDataAuction(response.data.data)
            setNotifSimiliar(response.data.data.notif_similiar_product)
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

    const getTnc = () => {

        let url = `${process.env.REACT_APP_BASE_API_URL}auction/product/getTnc`

        let axiosInstance = axios.get(url, Config({}))

        if (isLogin()) {
            axiosInstance = axios.get(url, Config({ Authorization: `Bearer ${Cookies?.get("token")}` }))
        }

        axiosInstance.then(response => {
            setTnc(response.data.data);
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


    const onSubmitBid = () => {
        if (dataAuction?.approve_tnc === true) {
            setModalConfirmed(true)
        } else {
            setModalTnc(true)
        }
    }


    const onSubmitBidAuction = () => {

        let url = `${process.env.REACT_APP_BASE_API_URL}auction/product/submitBidAction`;

        if (!isLogin()) {
            SwalToast.fire({ icon: "error", title: "Login is required" })
            return
        } else {
            let body = {
                mp_product_id: data?.id,
                mp_auction_bid_option_id: idBid,
                bid_price: bid
            }
            axios.post(url, body, Config({
                Authorization: `Bearer ${Cookies.get('token')}`
            })).then(response => {
                SwalToast.fire({ icon: "success", title: response.data.message })
                getDataAuction()
                getProductDetail()
                setModalConfirmed(false)
                // history.push({
                //     pathname: EcommerceRoutePath.LELANG_CART
                // })
            }).catch(error => {
                console.log(error);
                if (error.response) {
                    console.log(error.response.data);
                    SwalToast.fire({ icon: "error", title: error.response.data.message })
                }
            })
        }
    }

    const addSmiliar = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}auction/product/addNotifSimiliarProduct`;

        if (!isLogin()) {
            SwalToast.fire({ icon: "error", title: "Login is required" })
            return
        } else {
            let body = {
                mp_product_id: data?.id,
            }
            axios.post(url, body, Config({
                Authorization: `Bearer ${Cookies.get('token')}`
            })).then(response => {
                console.log(response.data.data)
                SwalToast.fire({ icon: "success", title: response.data.message })
                getDataAuction()
            }).catch(error => {
                console.log(error);
                if (error.response) {
                    console.log(error.response.data);
                    SwalToast.fire({ icon: "error", title: error.response.data.message })
                }
            })
        }
    }
    const DeleteSmiliar = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}auction/product/deleteNotifSimiliarProduct`;

        if (!isLogin()) {
            SwalToast.fire({ icon: "error", title: "Login is required" })
            return
        } else {
            let body = {
                mp_product_id: data?.id,
            }
            axios.post(url, body, Config({
                Authorization: `Bearer ${Cookies.get('token')}`
            })).then(response => {
                SwalToast.fire({ icon: "success", title: response.data.message })
                getDataAuction()
            }).catch(error => {
                console.log(error);
                if (error.response) {
                    console.log(error.response.data);
                    SwalToast.fire({ icon: "error", title: error.response.data.message })
                }
            })
        }

    }


    const addWishlist = (product_id, value) => {
        // const { t } = this.props;
        // console.log(value)
        // setWishlist(value)
        // return
        if (!Cookies.get('token')) {
            SwalToast.fire({ icon: 'info', title: t('product_detail.do_login_first') });
            return
        }

        axios.post(`${process.env.REACT_APP_BASE_API_URL}my-wishlist/add`, {
            product_id: product_id
        }, Config({
            Authorization: `Bearer ${Cookies.get('token')}`
        })).then(response => {
            setWishlist(value)
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

    const { t } = useTranslation()


    return (
        <div>
            <div className="pb-2">
                <h6 className="h6 font-weight-bold m-0 mb-2 mt-3">{t('auction.increase_offer')}</h6>
                {data.status !== "done" ?
                    <>
                        {(moment(new Date()).isBefore(moment(data?.active_start_date)) === true) ?
                            <div className='d-flex justify-content-between'>
                                <p>{t('auction.is_start')}</p>
                                <button className='btn font-size-90-percent bgc-accent-color text-white' onClick={() => addWishlist(data.id, !wishlist)}>
                                    <i className='far fa-heart mr-2'></i>
                                    {!wishlist ? 'Add to Wishlist' : 'Remove from wishlist'}
                                </button>
                            </div>
                            :
                            <>
                                <div className='row px-2'>
                                    {bidOption.map((bid, index) => (
                                        <div
                                            key={index}
                                            className={`btn mx-2 font-size-90-percent ${selectBid == bid.value ? 'border-accent-color accent-color' : 'color-8D8D8D border-DCDCDC'}`}
                                            style={{
                                                borderWidth: selectBid == bid.value ? 2 : 0.5,
                                                fontWeight: 'bold',
                                                fontSize: 16,
                                            }}
                                            onClick={() => onSelectBid(bid.value, bid.id, price)}
                                        >
                                            + Rp.{CurrencyFormat2((bid.value * data.mp_product_skus[0].price) / 100)}
                                        </div>
                                    ))}
                                </div>
                                <div className='d-flex justify-content-end'>
                                    <div
                                        className='box-countDown'
                                        style={{
                                            textAlign: 'center',
                                            top: "55%",
                                            borderRadius: 5,
                                            paddingTop: 10,
                                            position: 'absolute'
                                        }}
                                    >
                                        <p className='fs-small'>{t('auction.ends_id')}</p>
                                        <Countdown date={data?.active_end_date}
                                            renderer={
                                                ({ days, hours, minutes, seconds }) => (
                                                    <div className='d-flex text-danger align-items-center px-3'>
                                                        <p className='small'>
                                                            <strong className='font-weight-bold'>{days}</strong>
                                                            hari
                                                        </p>
                                                        <p>|</p>
                                                        <p className='small'>
                                                            <strong className='font-weight-bold'>{hours}</strong>
                                                            jam
                                                        </p>
                                                        <p>|</p>
                                                        <p className='small'>
                                                            <strong className='font-weight-bold'>{minutes}</strong>
                                                            menit
                                                        </p>
                                                        <p>|</p>
                                                        <p className='small'>
                                                            <strong className='font-weight-bold'>{seconds}</strong>
                                                            detik
                                                        </p>
                                                    </div>
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <div className='d-flex justify-content-between mt-2'>
                                    <div className='d-flex'>
                                        <p className='body'>Anda akan menawar:</p>
                                        <p className='font-weight-bold ml-1'>
                                            Rp.{CurrencyFormat2(bid) || '-'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => onSubmitBid()}
                                        disabled={!bid}
                                        className='btn btn-sm text-white bgc-accent-color px-4 py-2 ml-3 font-weight-bold'>
                                        <i class="fas fa-gavel mr-2 rotate-75" style={{ fontSize: 18 }}></i>
                                        Tawar
                                    </button>
                                </div>
                                <div className='bgc-F6F6F6 mt-3 p-3 rounded'>
                                    <h6 className="h6 font-weight-bold m-0 mb-2">Riwayat Penawaran</h6>
                                    {historyBid.map((item) => (
                                        <div className='d-flex justify-content-between'>
                                            <p>
                                                {isLoginTrue(item.mp_customer_id) === true ? 'Anda' : censorName(item.name)}
                                            </p>
                                            <h5 className='h5 font-weight-bold accent-color'>Rp.{CurrencyFormat2(item?.bid_price)}</h5>
                                        </div>
                                    ))}
                                </div>
                            </>
                        }
                    </>
                    :
                    <>
                        <p>{t('auction.is_ended')}</p>
                        <p className='h6 font-weight-bold' style={{
                            color: isLoginTrue(historyBid[0]?.mp_customer_id) ? '#6FC32E' : '#F54C4C'
                        }}
                        >
                            {isLoginTrue(historyBid[0]?.mp_customer_id) ? 'Menang' : 'Kalah'}
                        </p>
                        {notifSimiliar ?
                            <button
                                onClick={DeleteSmiliar}
                                className='btn btn-sm text-white bgc-accent-color mt-2 font-weight-bold'>
                                {t('auction.notif_similiar_product_delete')}
                            </button>
                            :
                            <button
                                onClick={addSmiliar}
                                className='btn btn-sm text-white bgc-accent-color mt-2 font-weight-bold'>
                                {t('auction.notif_similiar_product')}
                            </button>
                        }

                    </>
                }
            </div>
            <Modal
                size="lg"
                centered
                show={modalTnc}
                onHide={() => setModalTnc(false)}>
                <Modal.Header closeButton>
                    <h6 className='font-weight-bold'>
                        Syarat & Ketentuan Lelang
                    </h6>
                </Modal.Header>
                <Modal.Body>
                    <TinyMceContent className=" mt-3">
                        {tnc[0]?.content}
                    </TinyMceContent>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        onClick={() => { setModalTnc(false); setModalConfirmed(true) }}
                        className='btn btn-sm  bgc-accent-color px-4 py-2  font-weight-bold'>
                        Setuju
                    </button>
                </Modal.Footer>
            </Modal>
            <Modal
                size="lg"
                centered
                show={modalConfirmed}
                onHide={() => setModalConfirmed(false)}>
                <Modal.Header closeButton>
                    <h6 className='font-weight-bold'>
                        Konfirmasi Penawaran
                    </h6>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Anda yakin ingin menaikkan penawaran sebesar{' '}
                        <strong>
                            Rp{CurrencyFormat2(bid)}
                        </strong>
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        onClick={() => onSubmitBidAuction()}
                        className='btn btn-sm  bgc-accent-color px-4 py-2  font-weight-bold'>
                        Tawar
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default AuctionConditions;

const censorName = name => {
    const regex = /(^.|\s[^\s])|./g;
    const converted = name.replace(regex, (x, y) => y || 'x');
    return converted;
};
