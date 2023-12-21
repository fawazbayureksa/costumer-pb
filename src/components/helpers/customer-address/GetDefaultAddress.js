import React, {useEffect, useState} from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Config from "../../axios/Config";
import SwalToast from "../SwalToast";

const GetDefaultAddress = (props) => {
    const [address, set_address] = useState({});

    useEffect (() => {
        getDefaultAddress()
    }, [address])
    
    const getDefaultAddress = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}profile/address/getDefault`
        axios.get(url,Config({
            Authorization: 'Bearer ' + Cookies.get('token')
        })).then(res => {
            set_address(res.data.data)
        }).catch((error) => {
            SwalToast.fire({
                icon: 'error',
                title: 'Whoops. Something went wrong!'
            });
        })
    }

    return (
        <div className="row mt-4">
            <div className="col-12 col-sm-12 col-md-12 col-lg-3 col-xl-3">
                <p className="m-0 color-22262A font-weight-semi-bold">{address.receiver_name}</p>
                <p className="m-0 color-22262A">{address.receiver_phone}</p>
            </div>
            <div className="col-12 col-sm-12 col-md-12 col-lg-3 col-xl-3">
                <p className="m-0 color-22262A font-weight-semi-bold">{address.address_name}</p>
                <p className="m-0 color-22262A">{address.address}</p>
            </div>
            <div className="col-12 col-sm-12 col-md-12 col-lg-3 col-xl-3">
                <p className="m-0 color-22262A">{address.city} {address.postal_code}</p>
                <p className="m-0 color-22262A">{address.province}</p>
            </div>
        </div>
    )
}

export default GetDefaultAddress
