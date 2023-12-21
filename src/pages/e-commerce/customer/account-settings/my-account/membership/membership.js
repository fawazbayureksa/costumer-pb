import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import { Modal, ProgressBar } from 'react-bootstrap';
import Config from '../../../../../../components/axios/Config';
import SwalToast from '../../../../../../components/helpers/SwalToast';
import Template from '../../../../../../components/Template';
import { DateTimeFormat } from '../../../../../../components/helpers/DateTimeFormat';
import { TinyMceContent } from '../../../../../../components/helpers/TinyMceEditor';
import CurrencyFormat, { CurrencyFormat2 } from '../../../../../../components/helpers/CurrencyFormat';
import MembershipRows from './MembershipRows';
import CustomImage, { PublicStorageFolderPath } from '../../../../../../components/helpers/CustomImage';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { data } from 'jquery';
import update from 'immutability-helper'


const Membership = () => {


    const [modalDetail, setModalDetail] = useState(false);
    const [modalTdPoint, setModalTdPoint] = useState(false);
    const [modalPoint, setModalPoint] = useState(false);
    const [modalHistroyActivity, setModalHistoryActivity] = useState(false);
    const [dataHistory, setDataHistory] = useState([]);
    const [dataVoucherEligible, setDataVoucherEligible] = useState([]);
    const [dataVoucherIneligible, setDataVoucherIneligible] = useState([]);
    const [perPage, setPerPage] = useState(10);
    const [lastCashPointLogID, setlastCashPointLogID] = useState()
    const [lastLoyaltyPointLogID, setlastLoyaltyPointLogID] = useState()
    const [noMore, setNoMore] = useState(true)
    const [datas, setData] = useState({});

    useEffect(() => {
        getData();
        getPointHistory();
        getVoucherReedem();
    }, []);


    const [t] = useTranslation()

    const getData = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}membership/getMasterData`;

        axios.get(url, Config({
            Authorization: `Bearer ${Cookies.get("token")}`,
        }))
            .then(response => {
                let data = response.data.data;
                setData(data);
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
    const getPointHistory = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}membership/getPointsHistory`;
        let param = {
            per_page: perPage,
            last_cash_point_log_id: lastCashPointLogID,
            last_loyalty_point_log_id: lastLoyaltyPointLogID
        }
        axios.get(url, Config({
            Authorization: `Bearer ${Cookies.get("token")}`,
        },
            param
        ))
            .then(response => {
                let data = response.data.data;
                setDataHistory(update(dataHistory, {
                    $push: data.data
                }))
                setNoMore(data.data.length === perPage ? data.data[data.data.length - 1].id : false)
                setlastCashPointLogID(data.lastCashPointLogID)
                setlastLoyaltyPointLogID(data.lastLoyaltyPointLogID)
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

    const getVoucherReedem = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}membership/getVouchersToRedeem`;

        axios.get(url, Config({
            Authorization: `Bearer ${Cookies.get("token")}`,
        }))
            .then(response => {
                let data = response.data.data;
                setDataVoucherEligible(data.eligibleVouchers)
                setDataVoucherIneligible(data.ineligibleVouchers);
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

    return (
        <Template>
            <>
                <style>{`
                    .vouchers {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 15px;
                    }
                    .empty-state {
                        width: 300px;
                    }
                    .vouchers {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 15px;
                    }
                    .show-history{
                        font-size:16px;
                    }
                    .hr34 {
                        margin-top:35px
                    }
                    @media (max-width: 765.98px) {
                        .empty-state {
                            width: 200px;
                        }
                        .vouchers {
                            display: grid;
                            grid-template-columns: 1fr;
                            gap: 10px;
                        }
                        .show-history{
                            display:none;
                        }
                        .iconafd{
                            font-size:20px;
                        }
                        .container {
                            padding:0;
                        }
                    }
                    @media (max-width: 425px) {
                        .responsive-card{
                            display:flex;
                            flex-direction:column;
                            
                        }
                        .button-exchange {
                            display:flex;
                            align-self:start;
                        }
                    }
                `}</style>
                <div className='container mt-5 mb-5'>
                    <CustomImage folder={PublicStorageFolderPath.membership}
                        filename={datas?.customerLevel?.banner}
                        alt={datas?.customerLevel?.banner}
                        style={{ width: "100%", height: 250 }}
                        className="rounded w-100 object-fit-cover"
                    />
                    <div className="py-3 shadow-graph rounded bgc-accent-color">
                        <div className='d-flex flex-sm-nowrap text-white justify-content-between align-items-center ml-3 mr-3'>
                            <div className='d-flex align-items-center'>
                                <CustomImage style={{ width: 50, borderRadius: 50 }} />
                                <h5 className='ml-3 font-weight-semi-bold mt-2 text-white'>{(datas?.customerLevel?.name) || "-"}</h5>
                                <span className="cursor-pointer ml-3 underline" onClick={(e) => setModalDetail(true)}>{t("membership.details")}</span>
                            </div>
                            <div className=''>
                                <span className='font-weight-semi-bold cursor-pointer' onClick={(e) => setModalHistoryActivity(true)}><i className="fa fa-clock color-ECECEC iconafd"></i>
                                    <span className='show-history'> {t("membership.history")}</span>
                                </span>
                            </div>
                        </div>
                        <div className='vouchers px-3'>

                            <div className="px-3 py-3 shadow-graph rounded mt-3 bgc-FFFFFF">
                                <div className='d-flex justify-content-between' >
                                    <p className='font-weight-bold'>{(datas?.cashPointCustomName) || "-"}</p>
                                    <p className='cursor-pointer color-FFB200' onClick={(e) => setModalTdPoint(true)}>
                                        {t("membership.modal_info")}
                                    </p>
                                </div>
                                <div className='d-flex mt-2 align-items-center'>
                                    <h4 className='font-weight-bold accent-color'>{CurrencyFormat2(datas?.currentCashPoint)}</h4>
                                    <h5 className="color-AAAAAA ml-2">{t("membership.point")}</h5>
                                </div>
                                <hr className='hr34' />
                                <h6 className='text-danger'>
                                    {
                                        datas?.cashPointExpireSchedule != null
                                            ?
                                            `${CurrencyFormat2(datas?.cashPointExpireSchedule.point * -1)}
                                                 ${t("membership.expire")}
                                                 ${(DateTimeFormat(datas?.cashPointExpireSchedule.scheduled_time, 0))}`
                                            :
                                            ""
                                    }
                                </h6>
                            </div>

                            <div className="px-3 py-3 shadow-graph rounded mt-3 bgc-FFFFFF">
                                <div className='d-flex justify-content-between'>
                                    <p className='font-weight-bold'>{t("membership.loyalty_points")}</p>
                                    <p className='cursor-pointer accent-color' onClick={(e) => setModalPoint(true)}>
                                        {t("membership.modal_info")}
                                    </p>
                                </div>
                                <div className='d-flex mt-2 align-items-center'>
                                    <h4 className='font-weight-bold color-FFB200' > {CurrencyFormat2(datas?.currentLoyaltyPoint)}</h4>
                                    <h6 className="color-AAAAAA">/{CurrencyFormat2(datas?.customerNextLevel?.min_point)}</h6>
                                </div>
                                <ProgressBar variant="warning" now={datas?.currentLoyaltyPoint} max={datas?.customerNextLevel?.min_point} min={0} />
                                <hr />
                                <h6>{`
                                    ${CurrencyFormat(datas?.customerNextLevel?.min_point - datas?.currentLoyaltyPoint)}
                                    ${t("membership.next_level")}
                                    `}
                                </h6>
                            </div>
                        </div>
                    </div>
                    {(dataVoucherEligible !== null || dataVoucherIneligible !== null) ?
                        <>
                            <div className="bg-white shadow-graph rounded py-3 mt-4">
                                <div className='container-fluid pb-2'>
                                    <h5 className="font-weight-semi-bold">{t("membership.redeem_voucher")}</h5>
                                    <div className='vouchers'>
                                        {dataVoucherEligible && dataVoucherEligible.map((item) => (
                                            <MembershipRows key={item.id} item={item} submit={getData} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white shadow-graph rounded py-3 mt-4">
                                <div className='container-fluid '>
                                    <h5 className="font-weight-semi-bold">{t("membership.redeem_voucher_2")}</h5>
                                    <div className='vouchers'>
                                        {dataVoucherIneligible && dataVoucherIneligible.map((item) =>
                                        (
                                            <MembershipRows item={item} type={0} key={item.id} submit={getData} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                        :
                        <>
                            <div className="bg-white shadow-graph rounded py-3 mt-4">
                                <div className='container-fluid pb-2'>
                                    <div className='d-flex justify-content-center'>
                                        <img
                                            src={`/images/empty_state.png`}
                                            className="empty-state"
                                            onError={event => event.target.src = `/images/placeholder.gif`}
                                        />
                                    </div>
                                    <center className="mt-2">{t("account_setting.no_promo")}</center>
                                </div>
                            </div>
                        </>
                    }


                    <Modal
                        size="lg"
                        centered
                        show={modalDetail}
                        onHide={() => setModalDetail(false)}>
                        <Modal.Header closeButton>
                            <h6 className='font-weight-bold'>{t("membership.header_modal_details_member")}</h6>
                        </Modal.Header>
                        <Modal.Body>
                            <div>
                                <TinyMceContent>
                                    {datas?.customerLevel?.description}
                                </TinyMceContent>
                            </div>
                        </Modal.Body>
                    </Modal>
                    {/*  */}
                    <Modal
                        size="lg"
                        centered
                        show={modalTdPoint}
                        onHide={() => setModalTdPoint(false)}
                    // scrollable={true}
                    >
                        <Modal.Header closeButton>
                            <h5 className='font-weight-bold'>
                                {(datas?.cashPointCustomName) || "-"}
                            </h5>
                        </Modal.Header>
                        <Modal.Body>
                            <div>
                                <TinyMceContent>
                                    {(datas?.cashPointDescription)}
                                </TinyMceContent>
                            </div>
                        </Modal.Body>
                    </Modal>
                    {/*  */}
                    <Modal
                        size="lg"
                        centered
                        show={modalPoint}
                        onHide={() => setModalPoint(false)}>
                        <Modal.Header closeButton>
                            <h6 className='font-weight-bold'>
                                {t("membership.loyalty_points")}
                            </h6>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="">
                                <TinyMceContent>
                                    {datas?.loyaltyPointDescription}
                                </TinyMceContent>
                            </div>
                        </Modal.Body>
                    </Modal>
                    {/*  */}
                    <Modal
                        centered
                        show={modalHistroyActivity}
                        onHide={() => setModalHistoryActivity(false)}
                        animation
                        scrollable={true}
                    >
                        <Modal.Header closeButton>
                            <h6 className='font-weight-bold'>{t("membership.header_modal_history_point")}</h6>
                        </Modal.Header>
                        <Modal.Body id="scrollableDiv">
                            <InfiniteScroll
                                dataLength={dataHistory.length}
                                hasMore={noMore}
                                next={getPointHistory}
                                loader={<p>Loading ..</p>}
                                scrollableTarget="scrollableDiv"
                            >
                                <div className='overflow-hidden' >
                                    {dataHistory && dataHistory.map((item, index) => (
                                        <div>
                                            <div className="row justify-content-between">
                                                <div className='col-md-9 col-sm-9'>
                                                    <h6>Transaksi: {item.description}</h6>
                                                    <small className='color-AAAAAA'>{DateTimeFormat(item.created_at)}</small>
                                                </div>
                                                <div className='co  l-md-3 col-sm-3 mt-2'>
                                                    <h6 className='color-858585 fs-small'>
                                                        {(item.type == "cash") ? datas?.cashPointCustomName : (item.type == "loyalty") ? t("membership.loyalty_points") : "-"}
                                                    </h6>
                                                    <h6
                                                        className={item.point > 0 ? "text-success" : "text-danger"}>
                                                        {(item.point > 0) ? `+${CurrencyFormat2(item.point)}` : CurrencyFormat2(item.point)}
                                                    </h6>
                                                </div>
                                            </div>
                                            <hr />
                                        </div>
                                    ))}
                                </div>
                            </InfiniteScroll>
                        </Modal.Body>
                    </Modal>
                </div>
                {/*  */}
            </>
        </Template>
    );
}


export default Membership;
