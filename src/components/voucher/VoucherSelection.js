import { useState, useEffect, useRef } from 'react'
import VoucherRow from './VoucherRow'
import Cookie from 'js-cookie'
import axios from 'axios'
import Config from '../axios/Config'
import { useTranslation } from 'react-i18next'
import update from 'immutability-helper'
import ErrorDiv from '../helpers/ErrorDiv'

const VoucherSelection = ({ cartIDs, selectedVoucherIDs, onChange }) => {
    const [search, set_search] = useState('')
    const [selected, set_selected] = useState({}) // key-value pair, key: voucher customer id
    const [last_id, set_last_id] = useState(null)

    const [data, set_data] = useState([])
    const [data_shown, set_data_shown] = useState([])
    const [current_grouping_ids, set_current_grouping_ids] = useState(null) // key-value pair, key: voucher id
    const [errors, set_errors] = useState({})
    const [submitting, set_submitting] = useState(false)
    const firstRender = useRef(false)

    const [t] = useTranslation()

    useEffect(() => {
        getData()
    }, [])

    useEffect(() => {
        if (!firstRender.current) return;
        if (data.length === 0) return;
        if (isSelectedEmpty()) changeParent()
        else validateVoucher()
    }, [selected])

    const getData = () => {
        let queryString = "?"
        for (const cart_id of cartIDs) {
            queryString += `&cart_ids=${cart_id}`
        }

        axios.get(`${process.env.REACT_APP_BASE_API_URL}checkout/getAvailableVouchers${queryString}`, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        })).then(response => {
            set_data(response.data.data)
            set_data_shown(response.data.data)
            set_selected(selectedVoucherIDs)
            firstRender.current = true
        }).catch(error => {
            console.log(error);
        }).finally(() => {
            //
        });
    }

    const onSearch = (e) => {
        let value = e.target.value.toUpperCase()
        let data_shown = data.filter(x => x.voucher.code.toUpperCase().includes(value) === true || x.voucher.name.toUpperCase().includes(value) === true)

        set_search(value)
        set_data_shown(data_shown)
    }

    const onSelect = (id) => {
        let current_state = selected[id] ? true : false
        set_selected(update(selected, {
            [id]: { $set: !current_state }
        }))
        set_last_id(id)
    }

    const checkVoucherGrouping = () => {
        let countActiveSelected = 0
        for (const selectedKey in selected) {
            if (selected[selectedKey] === true) countActiveSelected++
        }

        if (countActiveSelected === 0) {
            set_current_grouping_ids(null)
        } else if (current_grouping_ids === null) {
            let temp_current_grouping_ids = null

            for (const selectedKey in selected) {
                if (selected[selectedKey] === true) {
                    let selectedData = data.find(x => x.id === parseInt(selectedKey))

                    temp_current_grouping_ids = {}
                    if (selectedData) {
                        if (selectedData.voucher.grouping_detail) {
                            for (const grouping_detail of selectedData.voucher.grouping_detail.grouping_details) {
                                temp_current_grouping_ids[grouping_detail.mp_voucher_id] = true
                            }
                        } else {
                            temp_current_grouping_ids[selectedData.mp_voucher_id] = true
                        }
                    }
                    break
                }
            }

            set_current_grouping_ids(temp_current_grouping_ids)
        }
    }

    const isSelectedEmpty = () => {
        let emptySelected = true
        for (const selected_id in selected) {
            if (selected[selected_id] === true) {
                emptySelected = false
                break
            }
        }
        return emptySelected
    }

    const changeParent = () => {
        if (onChange) {
            let chosen_vouchers = []
            for (const datum of data) {
                if (selected[datum.id] === true) {
                    chosen_vouchers.push(datum)
                }
            }

            onChange(chosen_vouchers, selected)

            checkVoucherGrouping()
        }
    }

    const validateVoucher = () => {

        let queryString = "?"

        if (cartIDs.length === 0) {
            set_errors({
                validate: "Cart ids error"
            })
            return;
        } else if (isSelectedEmpty() === true) {
            set_errors({
                validate: t('voucher.no_vouchers_selected')
            })
            return;
        }

        for (const cart_id of cartIDs) {
            queryString += `&cart_ids=${cart_id}`
        }
        for (const selected_id in selected) {
            if (selected[selected_id] === true) {
                queryString += `&voucher_customer_ids=${selected_id}`
            }
        }

        set_submitting(true)
        set_errors({})

        axios.get(`${process.env.REACT_APP_BASE_API_URL}checkout/validateVoucherCode${queryString}`, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        })).then(response => {
            changeParent()
        }).catch(error => {
            console.log(error);
            if (error.response.data && error.response.data.message) {
                set_errors({
                    validate: error.response.data.message
                })
            }
            set_selected(update(selected, {
                [last_id]: { $set: false }
            }))

        }).finally(() => {
            set_submitting(false)
        });
    }

    return (<>
        <div className="pb-2">
            <div className="d-flex border-bottom">
                <input type="search" className="form-control" value={search} onInput={onSearch} placeholder={t('general.search')} />
            </div>
            <ErrorDiv error={errors.validate} />
        </div>
        <div className="py-2">
            <div className="d-flex">
                <div className=" font-weight-semi-bold">{t('voucher.choose_voucher')}</div>
                <div className="ml-auto">
                    <a href={`#voucher-available`} className="text-decoration-none color-212529 mr-2" data-toggle="collapse" aria-expanded="false">
                        <i className="fas fa-caret-down color-97A0AE" />
                        <i className="fas fa-caret-up color-97A0AE" />
                    </a>
                </div>
            </div>

            <div className="mt-3 overflow-auto" id="voucher-available" style={{ maxHeight: '80vh' }}>
                {data_shown.map((item) => (
                    <VoucherRow key={item.id} item={item}
                        onSelect={onSelect}
                        selected={selected[item.id] === true}
                        disabled={(submitting || (current_grouping_ids && current_grouping_ids[item.mp_voucher_id] !== true))}
                    />
                ))}
            </div>
        </div>
    </>)
}

export default VoucherSelection