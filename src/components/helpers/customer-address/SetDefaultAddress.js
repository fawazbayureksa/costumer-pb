import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Config from "../../axios/Config";
import SwalToast from '../SwalToast';


const SetDefaultAddress = (props) => {
    const [submitting, set_submitting] = useState(false);

    useEffect(() => {
        if (props.modal) {
            setDefaultAddress(props.data.id)
        }
    }, [props.modal])

    const setDefaultAddress = (id) => {
        let url = `${process.env.REACT_APP_BASE_API_URL}profile/address/setDefault`
        let data = {
            mp_customer_address_id: id
        }
        set_submitting(true);
        axios.post(url, data, Config({
            Authorization: 'Bearer ' + Cookies.get('token')
        })).then(res => {
            SwalToast.fire({
                icon: 'success',
                title: 'Successfully Changed'
            })
            props.runAfter()
            props.closeModal()
        }).catch((error) => {
            let errMsg = 'Whoops. Something went wrong!'
            if (error.response) errMsg = error.response.data.message
            SwalToast.fire({
                icon: "error",
                title: errMsg
            })
        }).finally(() => {
            set_submitting(false)
        })
    }

    return (
        <>
            {props.element &&
                <a href="#" className={`text-decoration-none ${props.data.is_main ? 'd-none' : ''}`} onClick={event => setDefaultAddress(props.data.id)}>
                    {props.element}
                </a>}
        </>
    );
}

export default SetDefaultAddress