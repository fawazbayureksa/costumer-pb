import React, { useEffect, useState } from 'react';
import Cookie from 'js-cookie'
import axios from 'axios'
import Config from '../../../../../components/axios/Config';
import VoucherRow from '../../../../../components/voucher/VoucherRow';
import { useTranslation } from 'react-i18next';
import ErrorDiv from '../../../../../components/helpers/ErrorDiv';
import MyContext from '../../../../../components/MyContext';
import MetaTrigger from '../../../../../components/MetaTrigger';

const MyVouchers = (props) => {
    const [data, set_data] = useState([])
    const [data_shown, set_data_shown] = useState([])
    const [search, set_search] = useState("")
    const [errors, set_errors] = useState({})

    useEffect(() => {
        console.log(props)
        getData()
    }, [])

    const getData = () => {
        axios.get(`${process.env.REACT_APP_BASE_API_URL}my-vouchers/getAvailableVouchers`, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        })).then(response => {
            set_data(response.data.data)
            set_data_shown(response.data.data)
        }).catch(error => {
            console.log(error);
        }).finally(() => {
            //
        });
    }

    const [t] = useTranslation()

    const onSearch = (e) => {
        let value = e.target.value.toUpperCase()
        let data_shown = data.filter(x => x.voucher.code.toUpperCase().includes(value) === true || x.voucher.name.toUpperCase().includes(value) === true)

        set_search(value)
        set_data_shown(data_shown)
    }

    return (
        <>
            <style>{`
            .empty-state {
                width: 300px;
            }
            .vouchers {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
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
            }
        `}</style>
            <MyContext.Consumer>{context => (<>
                <MetaTrigger
                    pageTitle={context.companyName ? `${t('account_setting.my_vouchers')} - ${context.companyName} ` : ""}
                    pageDesc={t('account_setting.my_vouchers')}
                />
                <div className="bg-white shadow-graph rounded p-3">
                    <div className="pb-2">
                        <div className="d-flex mb-4">
                            <input type="search" className="form-control" value={search} onInput={onSearch} placeholder={t('general.search')} />
                        </div>
                        <ErrorDiv error={errors.validate} />
                    </div>
                    {data_shown.length === 0 ?
                        <div className="col-12 p-5">
                            <div className="d-flex justify-content-center">
                                <img
                                    src={`/images/empty_state.png`}
                                    className="empty-state"
                                    onError={event => event.target.src = `/images/placeholder.gif`}
                                />
                            </div>
                            <center className="mt-2">{t("account_setting.no_promo")}</center>
                        </div> :
                        <div className="vouchers">
                            {data_shown.map((item) => (
                                <VoucherRow key={item.id} item={item} page={`my-vouchers`} />
                            ))}
                        </div>}
                </div>
            </>)}</MyContext.Consumer>
        </>
    )
}

export default MyVouchers