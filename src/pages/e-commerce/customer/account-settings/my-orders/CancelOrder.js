import { useEffect, useState } from "react";
import ErrorDiv from "../../../../../components/helpers/ErrorDiv";
import Select from 'react-select'
import axios from "axios";
import Config from "../../../../../components/axios/Config";
import Cookie from "js-cookie";
import ExceedUploadLimit from "../../../../../components/helpers/ExceedUploadLimit";
import SwalToast from "../../../../../components/helpers/SwalToast";

/**
 * 
 * @param {string} orderCode  
 * @param {function} closeModal 
 * @param {function} refreshData refresh data in main page 
 * @param {function} t language
 * @returns 
 */
const CancelOrder = (props) => {
    const [errors, set_errors] = useState({})
    const [submitting, set_submitting] = useState(false)


    const validate = () => {
        let validate = true;
        let errors = {}

        set_errors(errors)
        return validate;
    }
    const submit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        let data = {
            order_code: props.orderCode,
        }

        set_submitting(true)
        let url = `${process.env.REACT_APP_BASE_API_URL}my-orders/cancelOrder`
        axios.post(url, data, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        })).then(response => {
            props.closeModal()
            props.refreshData()
        }).catch(error => {
            console.log(error)
            if (error.response) {
                console.log(error.response)
                if (error.response.data.message) {
                    SwalToast.fire({ icon: "error", title: error.response.data.message })
                }
            }
        }).finally(() => {
            set_submitting(false)
        });
    }

    return (
        <form onSubmit={submit}>
            <div className="row mt-3">
                <div className="col-6">
                    <button type="button" onClick={props.closeModal} className="btn btn-block border-707070 color-374650 font-weight-bold">{props.t("general.cancel")}</button>
                </div>
                <div className="col-6">
                    <button type="submit" disabled={submitting} className="btn btn-block bgc-accent-color  font-weight-bold">{props.t("general.confirm")}</button>
                </div>
            </div>
        </form>
    )
}

export default CancelOrder